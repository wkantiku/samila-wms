"""
SAMILA WMS 3PL - Complete Database Schema Design
Comprehensive data model for warehouse operations
"""

import os
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text,
    Boolean, Enum, Table, Numeric, Date, Time, JSON
)
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://samila:samila123@localhost:5432/samila_wms")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# =============== MASTER DATA MODELS ===============

class Supplier(Base):
    """Supplier/Vendor Information"""
    __tablename__ = 'suppliers'
    
    id = Column(Integer, primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    name_en = Column(String(255), nullable=False)
    name_th = Column(String(255), nullable=False)
    contact_person = Column(String(100))
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(Text)
    city = Column(String(100))
    postal_code = Column(String(10))
    tax_id = Column(String(20))
    payment_terms = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")


class Customer(Base):
    """Customer Information"""
    __tablename__ = 'customers'
    
    id = Column(Integer, primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    name_en = Column(String(255), nullable=False)
    name_th = Column(String(255), nullable=False)
    contact_person = Column(String(100))
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(Text)
    city = Column(String(100))
    postal_code = Column(String(10))
    tax_id = Column(String(20))
    credit_limit = Column(Float, default=0)
    payment_terms = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sales_orders = relationship("SalesOrder", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")


class Warehouse(Base):
    """Warehouse Locations"""
    __tablename__ = 'warehouses'
    
    id = Column(Integer, primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    name_en = Column(String(255), nullable=False)
    name_th = Column(String(255), nullable=False)
    address = Column(Text)
    city = Column(String(100))
    phone = Column(String(20))
    manager_name = Column(String(100))
    total_capacity = Column(Float)  # m3
    max_pallet_capacity = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    locations = relationship("Location", back_populates="warehouse")


class Location(Base):
    """Storage Locations within Warehouse"""
    __tablename__ = 'locations'
    
    id = Column(Integer, primary_key=True)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    zone = Column(String(10))  # A, B, C, etc
    aisle = Column(String(10))  # 01, 02, etc
    shelf = Column(String(10))  # 1, 2, 3, etc
    bin = Column(String(10))    # A, B, C, etc
    capacity = Column(Float)     # m3 capacity
    location_type = Column(String(50))  # PALLET, SHELF, RACKING
    is_active = Column(Boolean, default=True)
    
    # Relationships
    warehouse = relationship("Warehouse", back_populates="locations")
    inventory = relationship("Inventory", back_populates="location")


class Product(Base):
    """Product Master Data"""
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True)
    sku = Column(String(50), unique=True, nullable=False)
    barcode = Column(String(50), unique=True)
    name_en = Column(String(255), nullable=False)
    name_th = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    unit = Column(String(20))  # PCS, BOX, PALLET, KG, LITER
    weight_kg = Column(Float)
    volume_m3 = Column(Float)
    reorder_level = Column(Integer)
    max_stock_level = Column(Integer)
    lead_time_days = Column(Integer)
    price = Column(Numeric(12, 2))
    lot_number = Column(String(50))
    manufacture_date = Column(Date)
    expiry_date = Column(Date)
    supplier_id = Column(Integer, ForeignKey('suppliers.id'))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    inventory_items = relationship("Inventory", back_populates="product")
    receiving_items = relationship("ReceivingItem", back_populates="product")
    shipment_items = relationship("ShipmentItem", back_populates="product")


# =============== RECEIVING MODULE MODELS ===============

class PurchaseOrder(Base):
    """Purchase Order from Supplier"""
    __tablename__ = 'purchase_orders'
    
    id = Column(Integer, primary_key=True)
    supplier_id = Column(Integer, ForeignKey('suppliers.id'), nullable=False)
    po_number = Column(String(50), unique=True, nullable=False)
    po_date = Column(DateTime, nullable=False)
    expected_delivery_date = Column(DateTime)
    total_items = Column(Integer)
    total_amount = Column(Numeric(12, 2))
    status = Column(String(50), default='PENDING')  # PENDING, CONFIRMED, PARTIAL_RECEIVED, RECEIVED, CANCELLED
    remarks = Column(Text)
    created_by = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    supplier = relationship("Supplier", back_populates="purchase_orders")
    line_items = relationship("PurchaseOrderItem", back_populates="purchase_order")
    receiving_orders = relationship("ReceivingOrder", back_populates="purchase_order")


class PurchaseOrderItem(Base):
    """Purchase Order Line Items"""
    __tablename__ = 'purchase_order_items'
    
    id = Column(Integer, primary_key=True)
    po_id = Column(Integer, ForeignKey('purchase_orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    line_number = Column(Integer)
    quantity_ordered = Column(Float, nullable=False)
    unit_price = Column(Numeric(12, 2))
    line_amount = Column(Numeric(12, 2))
    
    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="line_items")


class ReceivingOrder(Base):
    """Goods Receiving Documents"""
    __tablename__ = 'receiving_orders'
    
    id = Column(Integer, primary_key=True)
    po_id = Column(Integer, ForeignKey('purchase_orders.id'), nullable=False)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    gr_number = Column(String(50), unique=True, nullable=False)
    gr_date = Column(DateTime, nullable=False)
    total_items_received = Column(Integer)
    total_pallets = Column(Integer)
    receiver_name = Column(String(100))
    receiver_phone = Column(String(20))
    remarks = Column(Text)
    status = Column(String(50), default='RECEIVING')  # RECEIVING, QC, PUTAWAY, COMPLETED, CANCELLED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="receiving_orders")
    receiving_items = relationship("ReceivingItem", back_populates="receiving_order")


class ReceivingItem(Base):
    """Receiving Line Items with Barcode"""
    __tablename__ = 'receiving_items'
    
    id = Column(Integer, primary_key=True)
    gr_id = Column(Integer, ForeignKey('receiving_orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    barcode = Column(String(50))
    quantity_received = Column(Float, nullable=False)
    quantity_accepted = Column(Float)
    quantity_rejected = Column(Float, default=0)
    rejection_reason = Column(String(255))
    location_id = Column(Integer, ForeignKey('locations.id'))
    serial_number = Column(String(50))
    batch_number = Column(String(50))
    lot_number = Column(String(50))
    manufacture_date = Column(Date)
    expiry_date = Column(Date)
    qc_status = Column(String(50))  # PENDING, PASS, FAIL
    qc_date = Column(DateTime)
    qc_by = Column(String(100))
    received_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    receiving_order = relationship("ReceivingOrder", back_populates="receiving_items")
    product = relationship("Product", back_populates="receiving_items")


# =============== INVENTORY MODULE MODELS ===============

class Inventory(Base):
    """Product Inventory Levels"""
    __tablename__ = 'inventory'

    id = Column(Integer, primary_key=True)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=True)
    location_id = Column(Integer, ForeignKey('locations.id'))
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    batch_number = Column(String(50))
    lot_number = Column(String(50))
    serial_number = Column(String(50))
    quantity_on_hand = Column(Float, default=0)
    quantity_reserved = Column(Float, default=0)
    quantity_available = Column(Float, default=0)
    customer = Column(String(255))          # customer name (flat, no FK)
    received_date = Column(DateTime)
    manufacture_date = Column(Date)
    expiry_date = Column(Date)
    last_count_date = Column(DateTime)
    status = Column(String(50), default='GOOD')  # GOOD, DAMAGED, EXPIRED, HOLD
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    warehouse = relationship("Warehouse")
    location = relationship("Location", back_populates="inventory")
    product = relationship("Product", back_populates="inventory_items")
    movements = relationship("InventoryMovement", back_populates="inventory")


class InventoryMovement(Base):
    """Inventory Transaction History"""
    __tablename__ = 'inventory_movements'
    
    id = Column(Integer, primary_key=True)
    inventory_id = Column(Integer, ForeignKey('inventory.id'), nullable=False)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    location_from = Column(Integer, ForeignKey('locations.id'))
    location_to = Column(Integer, ForeignKey('locations.id'))
    movement_type = Column(String(50))  # RECEIVING, PUTAWAY, PICKING, TRANSFER, ADJUSTMENT, RETURN
    quantity = Column(Float, nullable=False)
    reference_number = Column(String(50))
    reference_type = Column(String(50))  # GR, SO, TRANSFER, etc
    movement_date = Column(DateTime, nullable=False)
    moved_by = Column(String(100))
    remarks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    inventory = relationship("Inventory", back_populates="movements")


class StockCount(Base):
    """Cycle Count Records"""
    __tablename__ = 'stock_counts'
    
    id = Column(Integer, primary_key=True)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    count_number = Column(String(50), unique=True, nullable=False)
    count_date = Column(DateTime, nullable=False)
    location_id = Column(Integer, ForeignKey('locations.id'))
    product_id = Column(Integer, ForeignKey('products.id'))
    count_type = Column(String(50))  # CYCLE, FULL, PARTIAL
    system_quantity = Column(Float)
    physical_quantity = Column(Float)
    variance = Column(Float)
    counted_by = Column(String(100))
    verified_by = Column(String(100))
    status = Column(String(50))  # COUNTING, VERIFIED, POSTED
    remarks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


# =============== SALES & PICKING MODULE MODELS ===============

class SalesOrder(Base):
    """Sales Orders from Customer"""
    __tablename__ = 'sales_orders'

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=True)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=True)
    so_number = Column(String(50), unique=True, nullable=False)
    so_date = Column(DateTime, nullable=False)
    requested_delivery_date = Column(DateTime)
    total_items = Column(Integer)
    total_amount = Column(Numeric(12, 2))
    status = Column(String(50), default='NEW')  # NEW, CONFIRMED, PICKING, PACKED, SHIPPED, CANCELLED
    priority = Column(String(50))  # NORMAL, URGENT, EXPEDITED
    delivery_address = Column(Text)
    remarks = Column(Text)
    created_by = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    customer = relationship("Customer", back_populates="sales_orders")
    line_items = relationship("SalesOrderItem", back_populates="sales_order")
    picking_lists = relationship("PickingList", back_populates="sales_order")
    shipments = relationship("ShipmentOrder", back_populates="sales_order")


class SalesOrderItem(Base):
    """Sales Order Line Items"""
    __tablename__ = 'sales_order_items'
    
    id = Column(Integer, primary_key=True)
    so_id = Column(Integer, ForeignKey('sales_orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=True)
    product_name = Column(String(255))      # flat name for display
    unit = Column(String(20), default='PCS')
    line_number = Column(Integer)
    quantity_ordered = Column(Float, nullable=False)
    quantity_allocated = Column(Float, default=0)
    quantity_picked = Column(Float, default=0)
    quantity_shipped = Column(Float, default=0)
    unit_price = Column(Numeric(12, 2))
    line_amount = Column(Numeric(12, 2))

    # Relationships
    sales_order = relationship("SalesOrder", back_populates="line_items")
    product = relationship("Product", foreign_keys=[product_id])


class PickingList(Base):
    """Picking Instructions"""
    __tablename__ = 'picking_lists'
    
    id = Column(Integer, primary_key=True)
    so_id = Column(Integer, ForeignKey('sales_orders.id'), nullable=True)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=True)
    pick_number = Column(String(50), unique=True, nullable=False)
    pick_date = Column(DateTime, nullable=False)
    customer_name = Column(String(255))     # flat name for display
    total_items = Column(Integer)
    status = Column(String(50), default='PENDING')  # PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    picked_by = Column(String(100))
    verified_by = Column(String(100))
    created_by = Column(String(100))
    completed_at = Column(DateTime)
    pick_start_time = Column(DateTime)
    pick_end_time = Column(DateTime)
    remarks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sales_order = relationship("SalesOrder", back_populates="picking_lists")
    pick_items = relationship("PickingItem", back_populates="picking_list")


class PickingItem(Base):
    """Individual Picking Tasks"""
    __tablename__ = 'picking_items'
    
    id = Column(Integer, primary_key=True)
    pick_id = Column(Integer, ForeignKey('picking_lists.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=True)
    product_name = Column(String(255))      # flat name
    from_location = Column(String(100))
    unit = Column(String(20), default='PCS')
    lot_number = Column(String(50))
    location_id = Column(Integer, ForeignKey('locations.id'))
    batch_number = Column(String(50))
    serial_number = Column(String(50))
    barcode = Column(String(50))
    quantity_to_pick = Column(Float, nullable=False)
    quantity_picked = Column(Float, default=0)
    pick_status = Column(String(50), default='PENDING')  # PENDING, PICKED, VERIFIED
    picked_at = Column(DateTime)
    verified_at = Column(DateTime)
    
    # Relationships
    picking_list = relationship("PickingList", back_populates="pick_items")


# =============== SHIPPING MODULE MODELS ===============

class ShipmentOrder(Base):
    """Shipment Orders"""
    __tablename__ = 'shipment_orders'
    
    id = Column(Integer, primary_key=True)
    so_id = Column(Integer, ForeignKey('sales_orders.id'), nullable=False)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    shipment_number = Column(String(50), unique=True, nullable=False)
    shipment_date = Column(DateTime)
    carrier = Column(String(100))
    tracking_number = Column(String(50))
    vehicle_number = Column(String(50))
    driver_name = Column(String(100))
    driver_phone = Column(String(20))
    total_weight_kg = Column(Float)
    total_volume_m3 = Column(Float)
    total_pallets = Column(Integer)
    status = Column(String(50), default='PREPARED')  # PREPARED, PACKED, SHIPPED, IN_TRANSIT, DELIVERED, RETURNED
    delivery_date = Column(DateTime)
    delivery_address = Column(Text)
    delivery_contact = Column(String(100))
    delivery_phone = Column(String(20))
    remarks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sales_order = relationship("SalesOrder", back_populates="shipments")
    shipment_items = relationship("ShipmentItem", back_populates="shipment")


class ShipmentItem(Base):
    """Shipment Line Items"""
    __tablename__ = 'shipment_items'
    
    id = Column(Integer, primary_key=True)
    shipment_id = Column(Integer, ForeignKey('shipment_orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    batch_number = Column(String(50))
    serial_number = Column(String(50))
    barcode = Column(String(50))
    quantity_shipped = Column(Float, nullable=False)
    quantity_delivered = Column(Float)
    quantity_returned = Column(Float, default=0)
    box_number = Column(String(50))
    pallet_number = Column(String(50))
    
    # Relationships
    shipment = relationship("ShipmentOrder", back_populates="shipment_items")
    product = relationship("Product", back_populates="shipment_items")


class ReturnOrder(Base):
    """Return/RMA Orders"""
    __tablename__ = 'return_orders'
    
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=False)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    return_number = Column(String(50), unique=True, nullable=False)
    return_date = Column(DateTime, nullable=False)
    original_so_number = Column(String(50))
    total_items = Column(Integer)
    reason = Column(String(255))
    status = Column(String(50))  # RECEIVED, QC, ACCEPTED, REJECTED, RESTOCKED
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    return_items = relationship("ReturnItem", back_populates="return_order")


class ReturnItem(Base):
    """Return Line Items"""
    __tablename__ = 'return_items'
    
    id = Column(Integer, primary_key=True)
    return_id = Column(Integer, ForeignKey('return_orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity_returned = Column(Float, nullable=False)
    condition = Column(String(50))  # GOOD, DAMAGED, DEFECTIVE
    qc_result = Column(String(50))  # ACCEPTED, REJECTED
    restocking_location = Column(Integer, ForeignKey('locations.id'))
    
    # Relationships
    return_order = relationship("ReturnOrder", back_populates="return_items")


# =============== BILLING & INVOICING MODELS ===============

class Invoice(Base):
    """Invoices"""
    __tablename__ = 'invoices'
    
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=False)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    invoice_number = Column(String(50), unique=True, nullable=False)
    invoice_date = Column(DateTime, nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)
    tax_percentage = Column(Float, default=7)
    tax_amount = Column(Numeric(12, 2), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    discount_amount = Column(Numeric(12, 2), default=0)
    status = Column(String(50), default='PENDING')  # PENDING, PAID, OVERDUE, CANCELLED
    due_date = Column(DateTime)
    paid_date = Column(DateTime)
    remarks = Column(Text)
    created_by = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    customer = relationship("Customer", back_populates="invoices")
    line_items = relationship("InvoiceLineItem", back_populates="invoice")
    payments = relationship("PaymentRecord", back_populates="invoice")


class InvoiceLineItem(Base):
    """Invoice Line Items"""
    __tablename__ = 'invoice_line_items'
    
    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey('invoices.id'), nullable=False)
    service_type = Column(String(50), nullable=False)  # INBOUND, STORAGE, OUTBOUND, VAS, SPECIAL
    description = Column(String(500), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    rate = Column(Numeric(12, 2), nullable=False)
    line_amount = Column(Numeric(12, 2), nullable=False)
    reference_id = Column(Integer)
    reference_type = Column(String(50))  # GR, SO, SHIPMENT, etc
    
    # Relationships
    invoice = relationship("Invoice", back_populates="line_items")


# =============== AUDIT & TRACKING MODELS ===============

class AuditLog(Base):
    """System Audit Trail"""
    __tablename__ = 'audit_logs'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    user_name = Column(String(100))
    module = Column(String(50))  # RECEIVING, INVENTORY, PICKING, SHIPPING
    action = Column(String(50))  # CREATE, UPDATE, DELETE, IMPORT, EXPORT
    document_type = Column(String(50))  # GR, SO, PICK, SHIPMENT
    document_id = Column(String(50))
    old_value = Column(JSON)
    new_value = Column(JSON)
    remarks = Column(Text)
    ip_address = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)


class UserActivity(Base):
    """User Activity Tracking"""
    __tablename__ = 'user_activities'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    user_name = Column(String(100))
    device_type = Column(String(50))  # WEB, ANDROID, IOS
    action = Column(String(100))
    document_number = Column(String(50))
    location = Column(String(100))
    quantity = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)


# =============== SYSTEM CONFIGURATION ===============

class SystemConfig(Base):
    """System Configuration Settings"""
    __tablename__ = 'system_config'
    
    id = Column(Integer, primary_key=True)
    config_key = Column(String(100), unique=True, nullable=False)
    config_value = Column(Text)
    description = Column(String(500))
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LanguageSetting(Base):
    """Multi-language Support"""
    __tablename__ = 'language_settings'
    
    id = Column(Integer, primary_key=True)
    language_code = Column(String(10), unique=True, nullable=False)  # en, th
    language_name = Column(String(50))
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)


class Translation(Base):
    """Translation Strings"""
    __tablename__ = 'translations'
    
    id = Column(Integer, primary_key=True)
    key = Column(String(255), nullable=False)
    language_code = Column(String(10), nullable=False)
    value = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
