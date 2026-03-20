"""
JWT Authentication + User Model for Samila WMS
"""
import os
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, text
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from wms_database_schema import Base, engine, SessionLocal
from database import get_db

# ── Config ─────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "samila-wms-secret-key-change-in-production-2026")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# ── User Model (not in wms_database_schema.py) ─────────────────
class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String(50), unique=True, nullable=False, index=True)
    email           = Column(String(100), unique=True, nullable=True)
    name            = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role            = Column(String(50), default="operator")
    warehouses      = Column(JSON, default=list)
    menus           = Column(JSON, default=dict)
    status          = Column(String(20), default="active")
    company_no      = Column(String(50), nullable=True)
    last_login      = Column(DateTime, nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Create users table if not exists
Base.metadata.create_all(bind=engine)

# Migration: add company_no column to existing users table
try:
    with engine.connect() as _conn:
        _conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS company_no VARCHAR(50)"))
        _conn.commit()
except Exception:
    pass


# ── Password helpers ────────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT helpers ─────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            return None
    except JWTError:
        return None
    return db.query(User).filter(User.username == username).first()


def require_user(current_user: Optional[User] = Depends(get_current_user)) -> User:
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="กรุณาเข้าสู่ระบบ")
    if current_user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="บัญชีผู้ใช้ถูกระงับ")
    return current_user
