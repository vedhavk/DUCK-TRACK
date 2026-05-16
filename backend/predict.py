import os
import cv2
import numpy as np
import joblib
from pathlib import Path
from fastapi import HTTPException

_keras_model   = None
_sklearn_model = None

MODEL_DIR          = Path(os.getenv("MODEL_DIR", "."))
KERAS_MODEL_PATH   = MODEL_DIR / "img.keras"
SKLEARN_MODEL_PATH = MODEL_DIR / "vo.pkl"

IMG_SIZE = (224, 224)


def _load_keras():
    global _keras_model
    if _keras_model is None:
        if not KERAS_MODEL_PATH.exists():
            raise HTTPException(status_code=500,
                detail=f"Keras model not found at {KERAS_MODEL_PATH}")
        import tensorflow as tf
        _keras_model = tf.keras.models.load_model(str(KERAS_MODEL_PATH))
    return _keras_model


def _load_sklearn():
    global _sklearn_model
    if _sklearn_model is None:
        if not SKLEARN_MODEL_PATH.exists():
            raise HTTPException(status_code=500,
                detail=f"sklearn model not found at {SKLEARN_MODEL_PATH}")
        _sklearn_model = joblib.load(str(SKLEARN_MODEL_PATH))
    return _sklearn_model


def _preprocess_image_bytes(image_bytes: bytes) -> np.ndarray:
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image.")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, IMG_SIZE)
    img = img.astype("float32") / 255.0
    return np.expand_dims(img, axis=0)


def _extract_video_feature_vector(video_path: str, n_features: int) -> np.ndarray:
    """
    Extract frames from video and produce a flat vector of exactly n_features.

    Strategy:
    1. Figure out how many frames and what frame size gives n_features pixels.
    2. Sample that many frames evenly, resize each, flatten & concatenate.
    3. If we can't find a clean split, sample 1 frame and resize to fit exactly.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise HTTPException(status_code=400, detail="Could not open video file.")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        total_frames = 100  # fallback estimate

    # ── Find a (n_frames, height, width, channels) that matches n_features ──
    best = None
    for n_frames in [1, 2, 4, 5, 6, 8, 10, 12, 16, 20, 24, 30, 32]:
        for channels in [3, 1]:
            px_per_frame = n_features / (n_frames * channels)
            if px_per_frame != int(px_per_frame):
                continue
            px_per_frame = int(px_per_frame)
            side = px_per_frame ** 0.5
            if abs(side - round(side)) < 1e-6:
                side = int(round(side))
                best = (n_frames, side, side, channels)
                break
            for h in range(8, 300):
                if px_per_frame % h == 0:
                    w = px_per_frame // h
                    if 8 <= w <= 300:
                        best = (n_frames, h, w, channels)
                        break
            if best:
                break
        if best:
            break

    if best is None:
        side = int(n_features ** 0.5) + 1
        best = (1, side, side, 1)

    n_frames, h, w, channels = best

    # ── Sample frames ────────────────────────────────────────────────────────
    indices = np.linspace(0, total_frames - 1, n_frames, dtype=int)
    parts = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ret, frame = cap.read()
        if not ret:
            frame = np.zeros((h, w, 3), dtype=np.uint8)
        if channels == 1:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            frame = cv2.resize(frame, (w, h))
            parts.append(frame.flatten())
        else:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, (w, h))
            parts.append(frame.flatten())
    cap.release()

    vector = np.concatenate(parts).astype("float32") / 255.0

    # Safety: trim or pad to exactly n_features
    if len(vector) > n_features:
        vector = vector[:n_features]
    elif len(vector) < n_features:
        vector = np.pad(vector, (0, n_features - len(vector)))

    return vector.reshape(1, -1)


CLASS_NAMES = ["healthy", "diseased"]


def predict_image(image_bytes: bytes) -> dict:
    model      = _load_keras()
    tensor     = _preprocess_image_bytes(image_bytes)
    raw_output = model.predict(tensor)

    if raw_output.shape[-1] == 1:
        confidence = float(raw_output[0][0])
        predicted  = "healthy" if confidence >= 0.5 else "diseased"
        confidence = confidence if predicted == "healthy" else 1 - confidence
    else:
        idx        = int(np.argmax(raw_output[0]))
        raw_label  = CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else idx
        predicted  = normalise_label(raw_label)
        confidence = float(raw_output[0][idx])

    return {"prediction": predicted, "confidence": round(confidence, 4)}


def predict_video(video_path: str) -> dict:
    model      = _load_sklearn()
    n_features = getattr(model, "n_features_in_", 16488)
    features   = _extract_video_feature_vector(video_path, n_features)
    raw        = model.predict(features)[0]
    predicted  = normalise_label(raw)
    proba      = model.predict_proba(features)[0] if hasattr(model, "predict_proba") else None
    confidence = float(max(proba)) if proba is not None else 1.0

    return {
        "prediction": predicted,
        "confidence": round(confidence, 4),
    }


# ── Label normalisation ───────────────────────────────────────────────────────
# The SVM was trained with numeric labels (0 = healthy, 1 = diseased).
# Map any numeric or string variant to the canonical strings used by uploads.py.

_LABEL_MAP = {
    "0": "healthy", "1": "diseased",
    0:   "healthy", 1:   "diseased",
    "healthy": "healthy", "diseased": "diseased",
}

def normalise_label(raw) -> str:
    """Convert model output (0/1 or string) to 'healthy' or 'diseased'."""
    return _LABEL_MAP.get(raw, str(raw))