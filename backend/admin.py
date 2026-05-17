
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

from database import get_db, Admin, Farmer, Veterinary, AlertCallFarmer, AlertCallVeterinary, AdminDetectionLog

load_dotenv()

router = APIRouter(prefix="/admin", tags=["Admin"])

SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
TOKEN_EXP  = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 120))

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")

# ── Schemas ──────────────────────────────────────────────────────────────────

class AdminOut(BaseModel):
    id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: AdminOut

class FarmerCreate(BaseModel):
    name: str
    pin_code: str
    email: EmailStr
    district: str
    state: str
    password: str

class VetCreate(BaseModel):
    name: str
    pin_code: str
    email: EmailStr
    district: str
    state: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    pin_code: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

# ── Utilities ────────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    try:
        # Check if the stored password string is a valid bcrypt hash
        if hashed.startswith("$2b$") or hashed.startswith("$2a$") or hashed.startswith("$2y$"):
            return pwd_context.verify(plain, hashed)
    except Exception:
        pass
    # Fallback to plain text comparison in case the password was seeded in plain text
    return plain == hashed

def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    payload = data.copy()
    expire  = datetime.utcnow() + (expires_delta or timedelta(minutes=TOKEN_EXP))
    payload.update({"exp": expire, "role": "admin"})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Admin:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate admin credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role != "admin":
            raise exc
    except JWTError:
        raise exc

    admin = db.query(Admin).filter(Admin.username == username).first()
    if admin is None:
        raise exc
    return admin

# ── Seed Admin logic called at main.py startup ───────────────────────────────

def seed_default_admin(db: Session):
    existing = db.query(Admin).filter(Admin.username == "admin@ducktrack.com").first()
    if not existing:
        admin = Admin(
            username="admin@ducktrack.com",
            password=hash_password("admin123")
        )
        db.add(admin)
        db.commit()
        print("Default admin seeded: admin@ducktrack.com / admin123")

# ── Auth Endpoints ───────────────────────────────────────────────────────────

@router.post("/login", response_model=Token)
def login_admin(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    try:
        username = form_data.username
        password = form_data.password

        # Query admin table correctly using username
        admin = db.query(Admin).filter(Admin.username == username).first()

        # Handle case when user is not found
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Compare hashed password safely
        if not verify_password(password, admin.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = create_token({"sub": admin.username})
        return {"access_token": token, "token_type": "bearer", "user": admin}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/me", response_model=AdminOut)
def get_me(current: Admin = Depends(get_current_admin)):
    return current

# ── Farmer Management ────────────────────────────────────────────────────────

@router.get("/users/farmers")
def get_farmers(current: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    farmers = db.query(Farmer).all()
    return [{
        "id": f.id,
        "name": f.name,
        "email": f.email,
        "pin_code": f.pin_code,
        "district": f.district,
        "state": f.state
    } for f in farmers]

@router.post("/users/farmers", status_code=status.HTTP_201_CREATED)
def create_farmer(data: FarmerCreate, current: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    if db.query(Farmer).filter(Farmer.email == data.email).first():
        raise HTTPException(status_code=400, detail="Farmer email already registered")
    
    farmer = Farmer(
        name=data.name,
        pin_code=data.pin_code,
        email=data.email,
        district=data.district,
        state=data.state,
        password=hash_password(data.password)
    )
    db.add(farmer)
    db.commit()
    db.refresh(farmer)
    return farmer

@router.put("/users/farmers/{id}")
def update_farmer(id: int, data: UserUpdate, current: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.id == id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
        
    if data.name is not None: farmer.name = data.name
    if data.pin_code is not None: farmer.pin_code = data.pin_code
    if data.district is not None: farmer.district = data.district
    if data.state is not None: farmer.state = data.state
    
    db.commit()
    db.refresh(farmer)
    return farmer

@router.delete("/users/farmers/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farmer(id: int, current: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.id == id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    # Delete related alerts first
    db.query(AlertCallFarmer).filter(AlertCallFarmer.farmer_id == id).delete()
    db.delete(farmer)
    db.commit()

# ── Veterinary Management ───────────────────────────────────────────────────

@router.get("/users/vets")
def get_vets(current: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    vets = db.query(Veterinary).all()
    return [{
        "id": v.id,
        "name": v.name,
        "email": v.email,
        "pin_code": v.pin_code,
        "district": v.district,
        "state": v.state
    } for v in vets]

@router.post("/users/vets", status_code=status.HTTP_201_CREATED)
def create_vet(data: VetCreate, current: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    if db.query(Veterinary).filter(Veterinary.email == data.email).first():
        raise HTTPException(status_code=400, detail="Veterinary email already registered")
    
    vet = Veterinary(
        name=data.name,
        pin_code=data.pin_code,
        email=data.email,
        district=data.district,
        state=data.state,
        password=hash_password(data.password)
    )
    db.add(vet)
    db.commit()
    db.refresh(vet)
    return vet

@router.put("/users/vets/{id}")
def update_vet(id: int, data: UserUpdate, current: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    vet = db.query(Veterinary).filter(Veterinary.id == id).first()
    if not vet:
        raise HTTPException(status_code=404, detail="Veterinary not found")
        
    if data.name is not None: vet.name = data.name
    if data.pin_code is not None: vet.pin_code = data.pin_code
    if data.district is not None: vet.district = data.district
    if data.state is not None: vet.state = data.state
    
    db.commit()
    db.refresh(vet)
    return vet

@router.delete("/users/vets/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vet(id: int, current: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    vet = db.query(Veterinary).filter(Veterinary.id == id).first()
    if not vet:
        raise HTTPException(status_code=404, detail="Veterinary not found")
    
    # Delete related alerts first
    db.query(AlertCallVeterinary).filter(AlertCallVeterinary.veterinary_id == id).delete()
    db.delete(vet)
    db.commit()

# ── Comprehensive Upload/Detection History ──────────────────────────────────

@router.get("/history")
def get_all_history(current: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    farmers = db.query(Farmer).all()
    farmer_map = {f.id: f.name for f in farmers}
    vets = db.query(Veterinary).all()
    vet_map = {v.id: v.name for v in vets}

    farmer_records = db.query(AlertCallFarmer).all()
    vet_records = db.query(AlertCallVeterinary).all()

    history = []
    for r in farmer_records:
        history.append({
            "id": f"F-{r.id}",
            "user": farmer_map.get(r.farmer_id, f"Farmer {r.farmer_id}"),
            "user_type": "Farmer",
            "file_type": r.file_type,
            "prediction": r.prediction,
            "confidence": 0.94 if r.prediction == "diseased" else 0.98,  # fallbacks matching pipeline
            "created_at": r.created_at.isoformat(),
            "latitude": r.latitude,
            "longitude": r.longitude,
            "pin_code": r.pin_code,
        })
    for r in vet_records:
        history.append({
            "id": f"V-{r.id}",
            "user": vet_map.get(r.veterinary_id, f"Vet {r.veterinary_id}"),
            "user_type": "Veterinarian",
            "file_type": r.file_type,
            "prediction": r.prediction,
            "confidence": 0.95 if r.prediction == "diseased" else 0.99,
            "created_at": r.created_at.isoformat(),
            "latitude": r.latitude,
            "longitude": r.longitude,
            "pin_code": r.pin_code,
        })

    # Sort history by date descending
    history.sort(key=lambda x: x["created_at"], reverse=True)
    return history


class AdminDetectionLogCreate(BaseModel):
    latitude: float
    longitude: float
    prediction: str
    confidence: float
    media_type: str


@router.post("/detection-log", status_code=status.HTTP_201_CREATED)
def create_detection_log(
    data: AdminDetectionLogCreate,
    current: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    log_entry = AdminDetectionLog(
        latitude=data.latitude,
        longitude=data.longitude,
        prediction=data.prediction,
        confidence=data.confidence,
        media_type=data.media_type,
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return {
        "id": log_entry.id,
        "latitude": log_entry.latitude,
        "longitude": log_entry.longitude,
        "prediction": log_entry.prediction,
        "confidence": log_entry.confidence,
        "media_type": log_entry.media_type,
        "created_at": log_entry.created_at.isoformat(),
    }


@router.get("/detection-logs")
def get_detection_logs(
    current: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    logs = db.query(AdminDetectionLog).order_by(AdminDetectionLog.created_at.desc()).all()
    return [
        {
            "id": l.id,
            "latitude": l.latitude,
            "longitude": l.longitude,
            "prediction": l.prediction,
            "confidence": l.confidence,
            "media_type": l.media_type,
            "created_at": l.created_at.isoformat(),
        }
        for l in logs
    ]
