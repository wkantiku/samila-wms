from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from auth import User, require_user
from schemas import ProductCreate, ProductUpdate
from wms_database_schema import Product

router = APIRouter(prefix="/api/products", tags=["Products"])


def _prod_out(p: Product) -> dict:
    return {
        "id": p.id, "sku": p.sku, "barcode": p.barcode,
        "name": p.name_en, "name_th": p.name_th,
        "category": p.category, "unit": p.unit or "PCS",
        "weight_kg": p.weight_kg, "reorder_level": p.reorder_level,
        "max_stock_level": p.max_stock_level,
        "price": float(p.price) if p.price else None,
        "status": "active" if p.is_active else "inactive",
    }


@router.get("")
def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_user),
):
    q = db.query(Product)
    if search:
        like = f"%{search}%"
        q = q.filter(
            Product.sku.ilike(like) | Product.name_en.ilike(like) | Product.barcode.ilike(like)
        )
    if category:
        q = q.filter(Product.category == category)
    return [_prod_out(p) for p in q.order_by(Product.id).all()]


@router.get("/sku/{sku}")
def get_by_sku(sku: str, db: Session = Depends(get_db), _: User = Depends(require_user)):
    p = db.query(Product).filter(Product.sku == sku).first()
    if not p:
        raise HTTPException(status_code=404, detail="ไม่พบสินค้า")
    return _prod_out(p)


@router.get("/{prod_id}")
def get_product(prod_id: int, db: Session = Depends(get_db), _: User = Depends(require_user)):
    p = db.query(Product).filter(Product.id == prod_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="ไม่พบสินค้า")
    return _prod_out(p)


@router.post("")
def create_product(data: ProductCreate, db: Session = Depends(get_db), _: User = Depends(require_user)):
    if db.query(Product).filter(Product.sku == data.sku).first():
        raise HTTPException(status_code=400, detail="SKU นี้มีอยู่แล้ว")
    p = Product(
        sku=data.sku, barcode=data.barcode,
        name_en=data.name, name_th=data.name_th or data.name,
        category=data.category, unit=data.unit,
        weight_kg=data.weight_kg, reorder_level=data.reorder_level,
        max_stock_level=data.max_stock_level, price=data.price,
        is_active=(data.status == "active"),
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return _prod_out(p)


@router.put("/{prod_id}")
def update_product(prod_id: int, data: ProductUpdate, db: Session = Depends(get_db), _: User = Depends(require_user)):
    p = db.query(Product).filter(Product.id == prod_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="ไม่พบสินค้า")
    if data.barcode is not None:       p.barcode = data.barcode
    if data.name is not None:          p.name_en = data.name
    if data.name_th is not None:       p.name_th = data.name_th
    if data.category is not None:      p.category = data.category
    if data.unit is not None:          p.unit = data.unit
    if data.weight_kg is not None:     p.weight_kg = data.weight_kg
    if data.reorder_level is not None: p.reorder_level = data.reorder_level
    if data.price is not None:         p.price = data.price
    if data.status is not None:        p.is_active = (data.status == "active")
    db.commit()
    db.refresh(p)
    return _prod_out(p)


@router.delete("/{prod_id}")
def delete_product(prod_id: int, db: Session = Depends(get_db), _: User = Depends(require_user)):
    p = db.query(Product).filter(Product.id == prod_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="ไม่พบสินค้า")
    p.is_active = False
    db.commit()
    return {"message": "ลบสินค้าสำเร็จ"}
