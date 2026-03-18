"""
Pydantic schemas for Samila WMS API request/response validation
"""
from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


class _Base(BaseModel):
    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════
# Auth
# ══════════════════════════════════════════════════════════════
class LoginRequest(_Base):
    username: str
    password: str

class Token(_Base):
    access_token: str
    token_type: str
    user: Dict[str, Any]


# ══════════════════════════════════════════════════════════════
# Users
# ══════════════════════════════════════════════════════════════
class UserCreate(_Base):
    username: str
    email: Optional[str] = None
    name: str
    password: str
    role: str = "operator"
    warehouses: List[str] = []
    menus: Dict[str, Any] = {}
    status: str = "active"

class UserUpdate(_Base):
    email: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    warehouses: Optional[List[str]] = None
    menus: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    password: Optional[str] = None

class ChangePasswordRequest(_Base):
    old_password: str
    new_password: str

class UserOut(_Base):
    id: int
    username: str
    email: Optional[str] = None
    name: str
    role: str
    warehouses: List[str] = []
    menus: Dict[str, Any] = {}
    status: str
    last_login: Optional[datetime] = None


# ══════════════════════════════════════════════════════════════
# Warehouses
# ══════════════════════════════════════════════════════════════
class WarehouseCreate(_Base):
    code: str
    name: str
    name_th: Optional[str] = None
    location: Optional[str] = None
    province: Optional[str] = None
    phone: Optional[str] = None
    manager_name: Optional[str] = None
    companyNo: Optional[str] = "COMP-001"
    icon: Optional[str] = "🏭"
    active: bool = True

class WarehouseUpdate(_Base):
    name: Optional[str] = None
    name_th: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    manager_name: Optional[str] = None
    icon: Optional[str] = None
    active: Optional[bool] = None

class WarehouseOut(_Base):
    id: int
    code: str
    name: str
    name_th: Optional[str] = None
    location: Optional[str] = None
    active: bool = True
    icon: Optional[str] = "🏭"
    companyNo: Optional[str] = "COMP-001"


# ══════════════════════════════════════════════════════════════
# Customers
# ══════════════════════════════════════════════════════════════
class CustomerCreate(_Base):
    code: str
    name: str
    name_th: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    tax_id: Optional[str] = None
    credit_limit: float = 0
    payment_terms: Optional[str] = None
    status: str = "active"

class CustomerUpdate(_Base):
    name: Optional[str] = None
    name_th: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    credit_limit: Optional[float] = None
    status: Optional[str] = None

class CustomerOut(_Base):
    id: int
    code: str
    name: str
    name_th: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    credit_limit: float = 0
    status: str = "active"


# ══════════════════════════════════════════════════════════════
# Products
# ══════════════════════════════════════════════════════════════
class ProductCreate(_Base):
    sku: str
    barcode: Optional[str] = None
    name: str
    name_th: Optional[str] = None
    category: Optional[str] = None
    unit: str = "PCS"
    weight_kg: Optional[float] = None
    reorder_level: Optional[int] = None
    max_stock_level: Optional[int] = None
    price: Optional[float] = None
    status: str = "active"

class ProductUpdate(_Base):
    barcode: Optional[str] = None
    name: Optional[str] = None
    name_th: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    weight_kg: Optional[float] = None
    reorder_level: Optional[int] = None
    price: Optional[float] = None
    status: Optional[str] = None

class ProductOut(_Base):
    id: int
    sku: str
    barcode: Optional[str] = None
    name: str
    name_th: Optional[str] = None
    category: Optional[str] = None
    unit: str = "PCS"
    reorder_level: Optional[int] = None
    price: Optional[float] = None
    status: str = "active"


# ══════════════════════════════════════════════════════════════
# Inventory
# ══════════════════════════════════════════════════════════════
class InventoryReceive(_Base):
    sku: str
    barcode: Optional[str] = None
    product: str
    quantity: float
    mainUnit: str = "PCS"
    customer: Optional[str] = None
    supplier: Optional[str] = None
    location: str = "RECEIVING"
    grNumber: Optional[str] = None
    receivedDate: Optional[str] = None
    batNumber: Optional[str] = None
    lotNumber: Optional[str] = None
    expiryDate: Optional[str] = None
    warehouse_id: Optional[int] = None

class InventoryAdjust(_Base):
    sku: str
    quantity: float
    reason: str
    notes: Optional[str] = None
    warehouse_id: Optional[int] = None

class InventoryOut(_Base):
    id: int
    sku: str
    product: str
    barcode: Optional[str] = None
    location: str
    quantity: float
    available: float
    mainUnit: str = "PCS"
    customer: Optional[str] = None
    batNumber: Optional[str] = None
    lotNumber: Optional[str] = None
    expiryDate: Optional[str] = None
    minStock: Optional[float] = None
    status: str = "GOOD"


# ══════════════════════════════════════════════════════════════
# Receiving Orders
# ══════════════════════════════════════════════════════════════
class ReceivingCreate(_Base):
    sku: str
    barcode: Optional[str] = None
    product: str
    quantity: float
    mainUnit: str = "PCS"
    customer: Optional[str] = None
    supplier: Optional[str] = None
    location: str = "RECEIVING"
    batNumber: Optional[str] = None
    lotNumber: Optional[str] = None
    expiryDate: Optional[str] = None
    warehouse_id: Optional[int] = None

class ReceivingStatusUpdate(_Base):
    status: str


# ══════════════════════════════════════════════════════════════
# Sales Orders
# ══════════════════════════════════════════════════════════════
class OrderItemCreate(_Base):
    sku: str
    product: str
    qty: float
    unit: str = "PCS"
    price: Optional[float] = None

class OrderCreate(_Base):
    customer: str
    orderDate: Optional[str] = None
    dueDate: Optional[str] = None
    notes: Optional[str] = None
    items: List[OrderItemCreate] = []

class OrderStatusUpdate(_Base):
    status: str


# ══════════════════════════════════════════════════════════════
# Picking
# ══════════════════════════════════════════════════════════════
class PickingItemCreate(_Base):
    sku: str
    productName: str
    barcode: Optional[str] = None
    location: str
    toPick: float
    unit: str = "PCS"
    batNumber: Optional[str] = None
    lotNumber: Optional[str] = None

class PickingCreate(_Base):
    customer: str
    warehouse: str
    salesOrderId: Optional[int] = None
    items: List[PickingItemCreate] = []

class PickingConfirm(_Base):
    items: List[Dict[str, Any]] = []


# ══════════════════════════════════════════════════════════════
# Putaway
# ══════════════════════════════════════════════════════════════
class PutawayCreate(_Base):
    sku: str
    customer: str
    qty: float
    mainUnit: str = "PCS"
    fromLocation: str = "RECEIVING"
    toLocation: str
    grNumber: Optional[str] = None
    batNumber: Optional[str] = None
    lotNumber: Optional[str] = None


# ══════════════════════════════════════════════════════════════
# Shipping
# ══════════════════════════════════════════════════════════════
class ShippingCreate(_Base):
    soNumber: str
    carrier: str
    tracking: Optional[str] = None
    notes: Optional[str] = None
    items: List[Dict[str, Any]] = []

class ShippingStatusUpdate(_Base):
    status: str


# ══════════════════════════════════════════════════════════════
# Customer Service
# ══════════════════════════════════════════════════════════════
class CSCaseCreate(_Base):
    customer: str
    orderRef: Optional[str] = None
    category: str
    complaintType: Optional[str] = None
    priority: str = "Medium"
    subject: str
    detail: Optional[str] = None
    assignTo: Optional[str] = None
    dueDate: Optional[str] = None

class CSCaseUpdate(_Base):
    status: Optional[str] = None
    assignTo: Optional[str] = None
    rootCause: Optional[str] = None
    correctiveAction: Optional[str] = None
    preventiveAction: Optional[str] = None
    compensation: Optional[str] = None
    resolvedDate: Optional[str] = None

class CSNoteCreate(_Base):
    text: str
    type: str = "update"
