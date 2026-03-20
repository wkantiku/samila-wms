from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from auth import User, get_current_user, require_user
from schemas import CustomerCreate, CustomerUpdate
from wms_database_schema import Customer

router = APIRouter(prefix="/api/customers", tags=["Customers"])


def _cust_out(c: Customer) -> dict:
    return {
        "id": c.id, "code": c.code,
        "name": c.name_en, "name_th": c.name_th or c.name_en,
        "contact_person": c.contact_person, "email": c.email,
        "phone": c.phone, "address": c.address,
        "city": c.city, "tax_id": c.tax_id,
        "credit_limit": float(c.credit_limit or 0),
        "payment_terms": c.payment_terms,
        "logo": c.logo,
        "credit_days": c.credit_days or 30,
        "company_no": c.company_no or "",
        "status": "active" if c.is_active else "inactive",
    }


@router.get("")
def list_customers(search: Optional[str] = None, company_no: Optional[str] = None, include_inactive: bool = False, db: Session = Depends(get_db), current: Optional[User] = Depends(get_current_user)):
    q = db.query(Customer)
    if not include_inactive:
        q = q.filter(Customer.is_active == True)
    # non-superadmin: force scope to their own company regardless of query param
    if current and current.role != "superadmin" and current.company_no:
        q = q.filter(Customer.company_no == current.company_no)
    elif company_no:
        q = q.filter(Customer.company_no == company_no)
    if search:
        like = f"%{search}%"
        q = q.filter(
            (Customer.name_en.ilike(like)) |
            (Customer.name_th.ilike(like)) |
            (Customer.code.ilike(like))
        )
    return [_cust_out(c) for c in q.order_by(Customer.id).all()]


@router.get("/{cust_id}")
def get_customer(cust_id: int, db: Session = Depends(get_db)):
    c = db.query(Customer).filter(Customer.id == cust_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="ไม่พบลูกค้า")
    return _cust_out(c)


@router.post("")
def create_customer(data: CustomerCreate, db: Session = Depends(get_db), current: User = Depends(require_user)):
    if db.query(Customer).filter(Customer.code == data.code).first():
        raise HTTPException(status_code=400, detail="รหัสลูกค้านี้มีอยู่แล้ว")
    # admin: force company_no to their own
    effective_company = data.company_no
    if current.role != "superadmin" and current.company_no:
        effective_company = current.company_no
    c = Customer(
        code=data.code, name_en=data.name, name_th=data.name_th or data.name,
        contact_person=data.contact_person, email=data.email, phone=data.phone,
        address=data.address, city=data.city, tax_id=data.tax_id,
        credit_limit=data.credit_limit, payment_terms=data.payment_terms,
        logo=data.logo, credit_days=data.credit_days,
        company_no=effective_company,
        is_active=(data.status == "active"),
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _cust_out(c)


@router.put("/{cust_id}")
def update_customer(cust_id: int, data: CustomerUpdate, db: Session = Depends(get_db), current: User = Depends(require_user)):
    c = db.query(Customer).filter(Customer.id == cust_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="ไม่พบลูกค้า")
    if current.role != "superadmin" and current.company_no and c.company_no != current.company_no:
        raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์แก้ไข Customer นอกบริษัทของตน")
    if data.name is not None:           c.name_en = data.name
    if data.name_th is not None:        c.name_th = data.name_th
    if data.contact_person is not None: c.contact_person = data.contact_person
    if data.email is not None:          c.email = data.email
    if data.phone is not None:          c.phone = data.phone
    if data.address is not None:        c.address = data.address
    if data.tax_id is not None:         c.tax_id = data.tax_id
    if data.credit_limit is not None:   c.credit_limit = data.credit_limit
    if data.logo is not None:           c.logo = data.logo
    if data.credit_days is not None:    c.credit_days = data.credit_days
    # only superadmin can change company_no
    if data.company_no is not None and current.role == "superadmin":
        c.company_no = data.company_no
    if data.status is not None:         c.is_active = (data.status == "active")
    db.commit()
    db.refresh(c)
    return _cust_out(c)


@router.delete("/{cust_id}")
def delete_customer(cust_id: int, db: Session = Depends(get_db), current: User = Depends(require_user)):
    c = db.query(Customer).filter(Customer.id == cust_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="ไม่พบลูกค้า")
    if current.role != "superadmin" and current.company_no and c.company_no != current.company_no:
        raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์ลบ Customer นอกบริษัทของตน")
    c.is_active = False
    db.commit()
    return {"message": "ลบลูกค้าสำเร็จ"}
