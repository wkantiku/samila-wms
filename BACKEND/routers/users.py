from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import User, hash_password, verify_password, require_user
from schemas import UserCreate, UserUpdate, UserOut, ChangePasswordRequest

router = APIRouter(prefix="/api/users", tags=["Users"])


def _user_out(u: User) -> dict:
    return {
        "id": u.id, "username": u.username, "name": u.name, "email": u.email,
        "role": u.role, "warehouses": u.warehouses or [], "menus": u.menus or {},
        "status": u.status,
        "lastLogin": u.last_login.isoformat() if u.last_login else "-",
    }


@router.get("")
def list_users(db: Session = Depends(get_db), _: User = Depends(require_user)):
    users = db.query(User).order_by(User.id).all()
    return [_user_out(u) for u in users]


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_user)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้")
    return _user_out(u)


@router.post("")
def create_user(data: UserCreate, db: Session = Depends(get_db), _: User = Depends(require_user)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="ชื่อผู้ใช้นี้มีอยู่แล้ว")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
    u = User(
        username=data.username, email=data.email, name=data.name,
        hashed_password=hash_password(data.password),
        role=data.role, warehouses=data.warehouses, menus=data.menus, status=data.status,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return _user_out(u)


@router.put("/{user_id}")
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), _: User = Depends(require_user)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้")
    if data.email is not None:     u.email = data.email
    if data.name is not None:      u.name = data.name
    if data.role is not None:      u.role = data.role
    if data.warehouses is not None: u.warehouses = data.warehouses
    if data.menus is not None:     u.menus = data.menus
    if data.status is not None:    u.status = data.status
    if data.password:
        if len(data.password) < 6:
            raise HTTPException(status_code=400, detail="รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
        u.hashed_password = hash_password(data.password)
    db.commit()
    db.refresh(u)
    return _user_out(u)


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current: User = Depends(require_user)):
    if current.id == user_id:
        raise HTTPException(status_code=400, detail="ไม่สามารถลบบัญชีตัวเองได้")
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้")
    u.status = "inactive"
    db.commit()
    return {"message": "ลบผู้ใช้สำเร็จ"}


@router.post("/{user_id}/change-password")
def change_password(user_id: int, data: ChangePasswordRequest, db: Session = Depends(get_db), current: User = Depends(require_user)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้")
    if current.role not in ("superadmin", "admin") and current.id != user_id:
        raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์เปลี่ยนรหัสผ่านผู้ใช้อื่น")
    if current.id == user_id and not verify_password(data.old_password, u.hashed_password):
        raise HTTPException(status_code=400, detail="รหัสผ่านเดิมไม่ถูกต้อง")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร")
    u.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "เปลี่ยนรหัสผ่านสำเร็จ"}
