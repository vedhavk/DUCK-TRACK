import os
import cv2
import numpy as np
import joblib
from pathlib import Path
from fastapi import HTTPException
import tensorflow as tf

# ── Lazy-loaded model handles ─────────────────────────────────────────────────
_keras_image_model = None   # img.keras  — image classifier
_keras_video_model = None   # best_model.keras — BiLSTM+Attention video classifier
_efficientnet      = None   # EfficientNetB0 feature extractor (shared, frozen)

# ── Paths ─────────────────────────────────────────────────────────────────────
MODEL_DIR             = Path(os.getenv("MODEL_DIR", "."))
KERAS_IMAGE_PATH      = MODEL_DIR / "img.keras"
KERAS_VIDEO_PATH      = MODEL_DIR / "best_model.keras"   # ← new model

# ── Video model hyper-params (must match training exactly) ────────────────────
NUM_FRAMES  = 16     # frames sampled per video   (CONFIG['NUM_FRAMES'])
IMG_SIZE    = 224    # EfficientNetB0 input size   (CONFIG['IMG_SIZE'])
FEATURE_DIM = 1280   # EfficientNetB0 GAP output dim


# ─────────────────────────────────────────────────────────────────────────────
#  Loaders
# ─────────────────────────────────────────────────────────────────────────────

def _load_keras_image():
    """Load the image classification model (img.keras)."""
    global _keras_image_model
    if _keras_image_model is None:
        if not KERAS_IMAGE_PATH.exists():
            raise HTTPException(
                status_code=500,
                detail=f"Keras image model not found at {KERAS_IMAGE_PATH}",
            )
        _keras_image_model = tf.keras.models.load_model(str(KERAS_IMAGE_PATH))
    return _keras_image_model


def _load_efficientnet():
    """
    Lazy-load a frozen EfficientNetB0 feature extractor.
    Identical to what was used during training:
        EfficientNetB0(include_top=False, weights='imagenet', pooling='avg')
    Output shape per frame: (1280,)
    """
    global _efficientnet
    if _efficientnet is None:
        base = tf.keras.applications.EfficientNetB0(
            include_top=False,
            weights="imagenet",
            input_shape=(IMG_SIZE, IMG_SIZE, 3),
            pooling="avg",
        )
        base.trainable = False
        _efficientnet = base
    return _efficientnet


class TemporalAttentionPool(tf.keras.layers.Layer):
    """
    Weighted sum over the time axis.
    Mirrors the custom layer defined in the training notebook (Cell 10).
    Must be registered here so Keras can deserialize best_model.keras
    without requiring safe_mode=False.

    Input : (batch, T, D)
    Output: (batch, D)
    """
    def call(self, x):
        return tf.reduce_sum(x, axis=1)

    def get_config(self):
        return super().get_config()


def _load_keras_video():
    """
    Load the BiLSTM+Attention video classification model (best_model.keras).

    The model uses a custom TemporalAttentionPool layer (replaces the old
    Lambda layer). We pass it via custom_objects so Keras can deserialize
    the architecture correctly without safe_mode=False.
    """
    global _keras_video_model
    if _keras_video_model is None:
        if not KERAS_VIDEO_PATH.exists():
            raise HTTPException(
                status_code=500,
                detail=f"Video model not found at {KERAS_VIDEO_PATH}",
            )
        _keras_video_model = tf.keras.models.load_model(
            str(KERAS_VIDEO_PATH),
            custom_objects={"TemporalAttentionPool": TemporalAttentionPool},
            compile=False,
        )
        _keras_video_model.compile(
            optimizer="adam",
            loss="binary_crossentropy",
            metrics=["accuracy"],
        )
    return _keras_video_model
# ─────────────────────────────────────────────────────────────────────────────

def _preprocess_image_bytes(image_bytes: bytes) -> np.ndarray:
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image.")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype("float32") / 255.0
    return np.expand_dims(img, axis=0)   # (1, 224, 224, 3)


# ─────────────────────────────────────────────────────────────────────────────
#  Video frame extraction  (matches training's extract_frames())
# ─────────────────────────────────────────────────────────────────────────────

def _extract_frames(video_path: str) -> np.ndarray:
    """
    Uniformly sample NUM_FRAMES frames from the video.

    Returns
    -------
    np.ndarray, shape (NUM_FRAMES, IMG_SIZE, IMG_SIZE, 3), dtype float32, [0,1]
    Raises HTTPException on any read failure.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise HTTPException(status_code=400, detail="Could not open video file.")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        total_frames = NUM_FRAMES       # safe fallback

    indices = np.linspace(0, total_frames - 1, NUM_FRAMES, dtype=int)
    frames  = []

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ret, frame = cap.read()
        if ret:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, (IMG_SIZE, IMG_SIZE))
        else:
            # Duplicate last good frame (or zeros if no good frame yet)
            frame = frames[-1] if frames else np.zeros(
                (IMG_SIZE, IMG_SIZE, 3), dtype=np.uint8
            )
        frames.append(frame)

    cap.release()

    # Guarantee exactly NUM_FRAMES
    while len(frames) < NUM_FRAMES:
        frames.append(frames[-1])

    # Normalise to [0, 1]  — training used img / 255 before passing to EfficientNet
    arr = np.array(frames[:NUM_FRAMES], dtype=np.float32) / 255.0
    return arr   # (NUM_FRAMES, 224, 224, 3)


# ─────────────────────────────────────────────────────────────────────────────
#  EfficientNet feature extraction  (matches training's extract_video_features)
# ─────────────────────────────────────────────────────────────────────────────

def _extract_efficientnet_features(frames: np.ndarray) -> np.ndarray:
    """
    Pass each frame through EfficientNetB0 to get a (NUM_FRAMES, 1280) array.

    During training the frames were re-scaled to 0-255 before the extractor
    because EfficientNetB0 includes its own internal rescaling layer.
    We replicate that here.

    Parameters
    ----------
    frames : np.ndarray  (NUM_FRAMES, 224, 224, 3), float32, values in [0,1]

    Returns
    -------
    np.ndarray  (NUM_FRAMES, 1280), float32
    """
    extractor = _load_efficientnet()

    # Training code: frames_uint = (frames * 255.0).astype(np.float32)
    frames_uint = (frames * 255.0).astype(np.float32)   # (T, H, W, 3)

    features = extractor.predict(frames_uint, verbose=0)  # (T, 1280)
    return features.astype(np.float32)


# ─────────────────────────────────────────────────────────────────────────────
#  Label normalisation  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────

_LABEL_MAP = {
    "0": "healthy",  "1": "diseased",
    0:   "healthy",   1:  "diseased",
    "healthy": "healthy", "diseased": "diseased",
}

def normalise_label(raw) -> str:
    """Convert model output (0/1 or string) to 'healthy' or 'diseased'."""
    return _LABEL_MAP.get(raw, str(raw))


CLASS_NAMES = ["healthy", "diseased"]


# ─────────────────────────────────────────────────────────────────────────────
#  Public API
# ─────────────────────────────────────────────────────────────────────────────

def predict_image(image_bytes: bytes) -> dict:
    """Predict duck health from a single image."""
    model      = _load_keras_image()
    tensor     = _preprocess_image_bytes(image_bytes)
    raw_output = model.predict(tensor)

    if raw_output.shape[-1] == 1:
        # Sigmoid output: ≥ 0.5 → healthy
        confidence = float(raw_output[0][0])
        predicted  = "healthy" if confidence >= 0.5 else "diseased"
        confidence = confidence if predicted == "healthy" else 1.0 - confidence
    else:
        # Softmax output
        idx        = int(np.argmax(raw_output[0]))
        raw_label  = CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else str(idx)
        predicted  = normalise_label(raw_label)
        confidence = float(raw_output[0][idx])

    return {"prediction": predicted, "confidence": round(confidence, 4)}


def predict_video(video_path: str) -> dict:
    """
    Predict duck health from a video file.

    Pipeline (mirrors the Jupyter training notebook exactly):
      1. Uniformly sample NUM_FRAMES (16) frames  → (16, 224, 224, 3)
      2. Extract EfficientNetB0 features per frame → (16, 1280)
      3. Add batch dim                             → (1, 16, 1280)
      4. Pass through BiLSTM + Attention model     → sigmoid scalar
      5. Threshold at 0.5: ≥ 0.5 → diseased

    Returns
    -------
    dict with keys:
        prediction  – "healthy" or "diseased"
        confidence  – probability of the predicted class (0-1)
        diseased_prob – raw sigmoid output
        healthy_prob  – 1 - sigmoid output
    """
    # ── Step 1: frames ────────────────────────────────────────────────────────
    frames = _extract_frames(video_path)           # (16, 224, 224, 3)

    # ── Step 2: CNN features ──────────────────────────────────────────────────
    features = _extract_efficientnet_features(frames)   # (16, 1280)

    # ── Step 3: batch dimension ───────────────────────────────────────────────
    model_input = features[np.newaxis, ...]        # (1, 16, 1280)

    # ── Step 4: BiLSTM + Attention inference ──────────────────────────────────
    video_model   = _load_keras_video()
    raw_output    = video_model.predict(model_input, verbose=0)  # (1, 1)
    prob_diseased = float(raw_output[0][0])
    prob_healthy  = 1.0 - prob_diseased

    # ── Step 5: threshold ─────────────────────────────────────────────────────
    predicted  = "diseased" if prob_diseased >= 0.5 else "healthy"
    confidence = prob_diseased if predicted == "diseased" else prob_healthy

    return {
        "prediction":   predicted,
        "confidence":   round(confidence, 4),
        "diseased_prob": round(prob_diseased, 4),
        "healthy_prob":  round(prob_healthy,  4),
    }