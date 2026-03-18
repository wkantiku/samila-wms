from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from auth import verify_password, create_access_token, User, require_user
from schemas import LoginRequest, Token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
    if user.status != "active":
        raise HTTPException(status_code=403, detail="บัญชีผู้ใช้ถูกระงับ")
    user.last_login = datetime.utcnow()
    db.commit()
    token = create_access_token({"sub": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "warehouses": user.warehouses or [],
            "menus": user.menus or {},
            "status": user.status,
            "lastLogin": user.last_login.isoformat() if user.last_login else "-",
        },
    }


@router.post("/logout")
def logout():
    return {"message": "ออกจากระบบสำเร็จ"}


@router.get("/me")
def get_me(current_user: User = Depends(require_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "warehouses": current_user.warehouses or [],
        "menus": current_user.menus or {},
        "status": current_user.status,
    }
