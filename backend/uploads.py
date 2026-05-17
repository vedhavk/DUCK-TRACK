import os
import logging
from pathlib import Path
from datetime import datetime

from fastapi import (
    APIRouter, Depends, File, Form, HTTPException,
    UploadFile, status,
)
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database import (
    get_db, Farmer, Veterinary,
    AlertCallFarmer, AlertCallVeterinary,
    OutbreakHistory,
)
from checker import detect_file_type, validate_file_size
from predict import predict_image, predict_video, normalise_label   # ✅ import from predict only
from alerts  import send_farmer_alert, send_vet_alert
from dotenv  import load_dotenv

load_dotenv()

log = logging.getLogger(__name__)   # ✅ fixed: was _name_ (single underscores)

router     = APIRouter(prefix="/upload", tags=["Upload"])
SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads"))
MAX_MB     = int(os.getenv("MAX_FILE_SIZE_MB", 100))

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/farmer/login")


# ── Auth ──────────────────────────────────────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db:    Session = Depends(get_db),
) -> tuple:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role:  str = payload.get("role")
        if not email or role not in ("farmer", "veterinary", "admin"):
            raise exc
    except JWTError:
        raise exc

    if role == "farmer":
        user = db.query(Farmer).filter(Farmer.email == email).first()
    elif role == "veterinary":
        user = db.query(Veterinary).filter(Veterinary.email == email).first()
    else:
        from database import Admin
        user = db.query(Admin).filter(Admin.username == email).first()

    if user is None:
        raise exc
    return user, role


# ── Alert broadcast ───────────────────────────────────────────────────────────

def _broadcast_all(db: Session, latitude: float, longitude: float, pin_code: str):
    farmers = db.query(Farmer).all()
    vets    = db.query(Veterinary).all()

    log.info("Broadcasting to %d farmers and %d vets", len(farmers), len(vets))

    farmer_notified = []
    for f in farmers:
        try:
            ok = send_farmer_alert(f.email, f.name, latitude, longitude, pin_code)
            if ok:
                farmer_notified.append(f.email)
        except Exception as e:
            log.error("Farmer alert failed for %s: %s", f.email, e)

    vet_notified = []
    for v in vets:
        try:
            ok = send_vet_alert(v.email, v.name, latitude, longitude, pin_code)
            if ok:
                vet_notified.append(v.email)
        except Exception as e:
            log.error("Vet alert failed for %s: %s", v.email, e)

    return {"farmers": farmer_notified, "vets": vet_notified}


# ── Upload endpoint ───────────────────────────────────────────────────────────

@router.post("/")
async def upload_file(
    file:      UploadFile = File(...),
    latitude:  float      = Form(...),
    longitude: float      = Form(...),
    pin_code:  str        = Form(...),
    auth:      tuple      = Depends(get_current_user),
    db:        Session    = Depends(get_db),
):
    user, role = auth
    log.info("Upload from %s id=%s pin=%s", role, user.id, pin_code)

    raw = await file.read()
    validate_file_size(raw, MAX_MB)

    file_type = detect_file_type(file.filename, file.content_type)

    suffix    = Path(file.filename).suffix.lower()
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    save_name = f"{role}_{user.id}_{timestamp}{suffix}"
    save_path = UPLOAD_DIR / save_name

    with open(save_path, "wb") as fh:
        fh.write(raw)

    if file_type == "image":
        result = predict_image(raw)
    else:
        result = predict_video(str(save_path))

    prediction = normalise_label(result["prediction"])
    confidence = result["confidence"]

    alerts_sent = None

    # ── Always persist the scan record (healthy OR diseased) ─────────────────
    if role == "farmer":
        record = AlertCallFarmer(
            latitude  = latitude,
            longitude = longitude,
            pin_code  = pin_code,
            farmer_id = user.id,
            prediction= prediction,
            file_type = file_type,
            alert_sent= "n/a",          # default for healthy; overwritten if diseased
        )
    else:
        # veterinary or admin
        if role == "veterinary":
            vet_id = user.id
        else:
            # Fallback for admin uploads (which do not have a dedicated veterinary_id)
            first_vet = db.query(Veterinary).first()
            if not first_vet:
                placeholder = Veterinary(
                    name="System Placeholder Vet",
                    pin_code="000000",
                    email="system_vet@ducktrack.com",
                    district="System",
                    state="System",
                    password="placeholderpassword"
                )
                db.add(placeholder)
                db.commit()
                db.refresh(placeholder)
                vet_id = placeholder.id
            else:
                vet_id = first_vet.id

        record = AlertCallVeterinary(
            latitude      = latitude,
            longitude     = longitude,
            pin_code      = pin_code,
            veterinary_id = vet_id,
            prediction    = prediction,
            file_type     = file_type,
            alert_sent    = "n/a",
        )
    db.add(record)
    db.commit()
    db.refresh(record)

    if prediction == "diseased":
        # ── 1. Update alert_sent on the newly created record ─────────────────
        record.alert_sent = "pending"

        # ── 2. Write to unified OutbreakHistory ──────────────────────────────
        history = OutbreakHistory(
            latitude      = latitude,
            longitude     = longitude,
            pin_code      = pin_code,
            reported_by   = role,
            reporter_id   = user.id,
            reporter_name = getattr(user, "name", getattr(user, "username", "Admin")),
            file_type     = file_type,
            alert_sent    = "pending",
        )
        db.add(history)
        db.commit()
        db.refresh(history)

        # ── 3. Broadcast emails ──────────────────────────────────────────────
        alerts_sent = _broadcast_all(db, latitude, longitude, pin_code)

        total_sent         = len(alerts_sent["farmers"]) + len(alerts_sent["vets"])
        status_str         = "sent" if total_sent > 0 else "failed"
        record.alert_sent  = status_str
        history.alert_sent = status_str
        db.commit()

    return {
        "filename":    save_name,
        "file_type":   file_type,
        "prediction":  prediction,
        "confidence":  confidence,
        "latitude":    latitude,
        "longitude":   longitude,
        "pin_code":    pin_code,
        "alerts_sent": alerts_sent,
    }


# ── Vet history endpoint (read outbreak_history) ──────────────────────────────

@router.get("/outbreak-history")
def get_outbreak_history(
    auth: tuple   = Depends(get_current_user),
    db:   Session = Depends(get_db),
):
    """
    Returns all outbreak history rows — accessible by both farmers and vets,
    but the frontend only shows this page to vets.
    """
    rows = (
        db.query(OutbreakHistory)
        .order_by(OutbreakHistory.created_at.desc())
        .all()
    )
    return [
        {
            "id":            r.id,
            "latitude":      r.latitude,
            "longitude":     r.longitude,
            "pin_code":      r.pin_code,
            "reported_by":   r.reported_by,
            "reporter_name": r.reporter_name,
            "file_type":     r.file_type,
            "alert_sent":    r.alert_sent,
            "created_at":    r.created_at.isoformat(),
        }
        for r in rows
    ]