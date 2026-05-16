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

from database import get_db, Farmer

load_dotenv()

router = APIRouter(prefix="/farmer", tags=["Farmer"])

SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
TOKEN_EXP  = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/farmer/login")


# ── Schemas ──────────────────────────────────────────────────────────────────

class FarmerRegister(BaseModel):
    name:     str
    pin_code: str
    email:    EmailStr
    district: str
    state:    str
    password: str


class FarmerOut(BaseModel):
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
    user:         FarmerOut


# ── Utilities ────────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    payload = data.copy()
    expire  = datetime.utcnow() + (expires_delta or timedelta(minutes=TOKEN_EXP))
    payload.update({"exp": expire, "role": "farmer"})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_farmer(
    token: str = Depends(oauth2_scheme),
    db:    Session = Depends(get_db),
) -> Farmer:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate farmer credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role:  str = payload.get("role")
        if email is None or role != "farmer":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    farmer = db.query(Farmer).filter(Farmer.email == email).first()
    if farmer is None:
        raise credentials_exception
    return farmer


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/register", response_model=FarmerOut, status_code=status.HTTP_201_CREATED)
def register_farmer(data: FarmerRegister, db: Session = Depends(get_db)):
    if db.query(Farmer).filter(Farmer.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    farmer = Farmer(
        name     = data.name,
        pin_code = data.pin_code,
        email    = data.email,
        district = data.district,
        state    = data.state,
        password = hash_password(data.password),
    )
    db.add(farmer)
    db.commit()
    db.refresh(farmer)
    return farmer


@router.post("/login", response_model=Token)
def login_farmer(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    farmer = db.query(Farmer).filter(Farmer.email == form_data.username).first()
    if not farmer or not verify_password(form_data.password, farmer.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_token({"sub": farmer.email})
    return {"access_token": token, "token_type": "bearer", "user": farmer}


@router.get("/me", response_model=FarmerOut)
def get_me(current: Farmer = Depends(get_current_farmer)):
    return current


class FarmerUpdate(BaseModel):
    name:     Optional[str] = None
    pin_code: Optional[str] = None
    district: Optional[str] = None
    state:    Optional[str] = None


@router.patch("/me", response_model=FarmerOut)
def update_me(
    data:    FarmerUpdate = ...,
    current: Farmer = Depends(get_current_farmer),
    db:      Session = Depends(get_db),
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
def farmer_alert_history(
    current: Farmer = Depends(get_current_farmer),
    db:      Session = Depends(get_db),
):
    from database import AlertCallFarmer
    records = (
        db.query(AlertCallFarmer)
        .filter(AlertCallFarmer.farmer_id == current.id)
        .order_by(AlertCallFarmer.created_at.desc())
        .all()
    )
    return [
        {
            "id":         r.id,
            "latitude":   r.latitude,
            "longitude":  r.longitude,
            "pin_code":   r.pin_code,
            "prediction": r.prediction,
            "file_type":  r.file_type,
            "alert_sent": r.alert_sent,
            "created_at": r.created_at,
        }
        for r in records
    ]


# ── Duck Yearly Count ─────────────────────────────────────────────────────────

class DuckCountIn(BaseModel):
    year:       int
    duck_count: int


class DuckCountOut(BaseModel):
    id:         int
    year:       int
    duck_count: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


@router.get("/duck-counts", response_model=list[DuckCountOut])
def get_duck_counts(
    current: Farmer = Depends(get_current_farmer),
    db:      Session = Depends(get_db),
):
    """Return all yearly duck counts for the current farmer, sorted by year desc."""
    from database import DuckYearlyCount
    rows = (
        db.query(DuckYearlyCount)
        .filter(DuckYearlyCount.farmer_id == current.id)
        .order_by(DuckYearlyCount.year.desc())
        .all()
    )
    return rows


@router.post("/duck-counts", response_model=DuckCountOut, status_code=status.HTTP_201_CREATED)
def upsert_duck_count(
    data:    DuckCountIn,
    current: Farmer = Depends(get_current_farmer),
    db:      Session = Depends(get_db),
):
    """Insert or update the duck count for a given year (upsert by farmer_id + year)."""
    from database import DuckYearlyCount
    existing = (
        db.query(DuckYearlyCount)
        .filter(
            DuckYearlyCount.farmer_id == current.id,
            DuckYearlyCount.year      == data.year,
        )
        .first()
    )
    if existing:
        existing.duck_count = data.duck_count
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    row = DuckYearlyCount(
        farmer_id  = current.id,
        year       = data.year,
        duck_count = data.duck_count,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/duck-counts/{year}", status_code=status.HTTP_204_NO_CONTENT)
def delete_duck_count(
    year:    int,
    current: Farmer = Depends(get_current_farmer),
    db:      Session = Depends(get_db),
):
    """Delete the duck count entry for a given year."""
    from database import DuckYearlyCount
    row = (
        db.query(DuckYearlyCount)
        .filter(
            DuckYearlyCount.farmer_id == current.id,
            DuckYearlyCount.year      == year,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="No entry found for this year")
    db.delete(row)
    db.commit()