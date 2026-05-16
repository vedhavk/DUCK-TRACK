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

from database import get_db, Veterinary

load_dotenv()

router = APIRouter(prefix="/veterinary", tags=["Veterinary"])

SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
TOKEN_EXP  = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/veterinary/login")


# ── Schemas ──────────────────────────────────────────────────────────────────

class VetRegister(BaseModel):
    name:     str
    pin_code: str
    email:    EmailStr
    district: str
    state:    str
    password: str


class VetOut(BaseModel):
    id:       int
    name:     str
    pin_code: str
    email:    str
    district: str
    state:    str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type:   str
    user:         VetOut


# ── Utilities ────────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    payload = data.copy()
    expire  = datetime.utcnow() + (expires_delta or timedelta(minutes=TOKEN_EXP))
    payload.update({"exp": expire, "role": "veterinary"})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_vet(
    token: str = Depends(oauth2_scheme),
    db:    Session = Depends(get_db),
) -> Veterinary:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate veterinary credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role:  str = payload.get("role")
        if email is None or role != "veterinary":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    vet = db.query(Veterinary).filter(Veterinary.email == email).first()
    if vet is None:
        raise credentials_exception
    return vet


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/register", response_model=VetOut, status_code=status.HTTP_201_CREATED)
def register_vet(data: VetRegister, db: Session = Depends(get_db)):
    if db.query(Veterinary).filter(Veterinary.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    vet = Veterinary(
        name     = data.name,
        pin_code = data.pin_code,
        email    = data.email,
        district = data.district,
        state    = data.state,
        password = hash_password(data.password),
    )
    db.add(vet)
    db.commit()
    db.refresh(vet)
    return vet


@router.post("/login", response_model=Token)
def login_vet(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    vet = db.query(Veterinary).filter(Veterinary.email == form_data.username).first()
    if not vet or not verify_password(form_data.password, vet.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_token({"sub": vet.email})
    return {"access_token": token, "token_type": "bearer", "user": vet}


@router.get("/me", response_model=VetOut)
def get_me(current: Veterinary = Depends(get_current_vet)):
    return current


class VetUpdate(BaseModel):
    name:     Optional[str] = None
    pin_code: Optional[str] = None
    district: Optional[str] = None
    state:    Optional[str] = None


@router.patch("/me", response_model=VetOut)
def update_me(
    data:    VetUpdate,
    current: Veterinary = Depends(get_current_vet),
    db:      Session    = Depends(get_db),
):
    """Update mutable profile fields. Email and password are not editable here."""
    if data.name     is not None: current.name     = data.name
    if data.pin_code is not None: current.pin_code = data.pin_code
    if data.district is not None: current.district = data.district
    if data.state    is not None: current.state    = data.state
    db.commit()
    db.refresh(current)
    return current


@router.get("/history")
def vet_alert_history(
    current: Veterinary = Depends(get_current_vet),
    db:      Session = Depends(get_db),
):
    from database import AlertCallVeterinary
    records = (
        db.query(AlertCallVeterinary)
        .filter(AlertCallVeterinary.veterinary_id == current.id)
        .order_by(AlertCallVeterinary.created_at.desc())
        .all()
    )
    return [
        {
            "id":          r.id,
            "latitude":    r.latitude,
            "longitude":   r.longitude,
            "pin_code":    r.pin_code,
            "prediction":  r.prediction,
            "file_type":   r.file_type,
            "alert_sent":  r.alert_sent,
            "created_at":  r.created_at,
            "heatmap_url": (
                f"https://www.google.com/maps/search/?api=1"
                f"&query={r.latitude},{r.longitude}"
            ),
        }
        for r in records
    ]

# ── Farmer Overview ────────────────────────────────────────────────────────────

@router.get("/farmers-overview")
def get_farmers_overview(
    current: Veterinary = Depends(get_current_vet),
    db:      Session = Depends(get_db),
):
    from database import Farmer, DuckYearlyCount
    from sqlalchemy import func

    # Subquery to get latest duck count year per farmer
    # Alternatively, just sum up all duck counts, or get the latest.
    # The requirement says "Total ducks per farmer. Year-wise or current count".
    # Let's return the sum of all ducks, or better yet, a list of year/counts, or just the most recent year's count.
    # To keep it simple and clean, let's join and get the total count or array.
    
    farmers = db.query(Farmer).all()
    
    results = []
    for f in farmers:
        # Get latest duck count
        latest_count = (
            db.query(DuckYearlyCount)
            .filter(DuckYearlyCount.farmer_id == f.id)
            .order_by(DuckYearlyCount.year.desc())
            .first()
        )
        
        results.append({
            "farmer_id": f.id,
            "name": f.name,
            "email": f.email,
            "district": f.district,
            "state": f.state,
            "pin_code": f.pin_code,
            "latest_duck_count": latest_count.duck_count if latest_count else 0,
            "latest_count_year": latest_count.year if latest_count else None,
        })
        
    return results

# ── Disease Spread Map ────────────────────────────────────────────────────────

@router.get("/disease-map")
def get_disease_map(
    current: Veterinary = Depends(get_current_vet),
    db:      Session = Depends(get_db),
):
    from database import OutbreakHistory
    
    outbreaks = (
        db.query(OutbreakHistory)
        .order_by(OutbreakHistory.created_at.desc())
        .limit(1)
        .all()
    )
    
    results = []
    for ob in outbreaks:
        results.append({
            "farm_name": ob.reporter_name,
            "latitude": ob.latitude,
            "longitude": ob.longitude,
            "disease": "Duck Virus", # or use prediction logic if added to db
            "date_detected": ob.created_at.date().isoformat()
        })
        
    return results