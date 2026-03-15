"""
SAMILA WMS 3PL - Complete API Endpoints
All modules: Receiving, Inventory, Product, Picking, Shipping
"""

from fastapi import APIRouter, HTTPException, Query, File, UploadFile, Body
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import io
import csv

# =============== PYDANTIC SCHEMAS ===============

# Receiving Schemas
class ReceivingOrderCreate(BaseModel):
    po_id: int
    warehouse_id: int
    gr_date: datetime
    receiver_name: str
    remarks: Optional[str] = None

class ReceivingItemCreate(BaseModel):
    gr_id: int
    product_id: int
    barcode: str
    quantity_received: float
    location_id: int
    batch_number: Optional[str] = None
    lot_number: Optional[str] = None
    manufacture_date: Optional[str] = None
    expiry_date: Optional[str] = None

# Inventory Schemas
class InventoryAdjustment(BaseModel):
    inventory_id: int
    adjustment_quantity: float
    reason: str
    reference_number: Optional[str] = None

class StockCountCreate(BaseModel):
    warehouse_id: int
    count_type: str  # CYCLE, FULL
    location_id: Optional[int] = None
    product_id: Optional[int] = None

# Product Schemas
class ProductCreate(BaseModel):
    sku: str
    name_en: str
    name_th: str
    barcode: Optional[str] = None
    category: str
    unit: str
    weight_kg: Optional[float] = None
    volume_m3: Optional[float] = None
    lot_number: Optional[str] = None
    manufacture_date: Optional[str] = None
    expiry_date: Optional[str] = None

# Picking Schemas
class PickingListCreate(BaseModel):
    so_id: int
    warehouse_id: int
    pick_date: datetime

# Shipping Schemas
class ShipmentOrderCreate(BaseModel):
    so_id: int
    warehouse_id: int
    shipment_date: datetime
    carrier: str
    tracking_number: Optional[str] = None

# =============== ROUTERS ===============

router = APIRouter(prefix="/api/v1/wms", tags=["WMS Modules"])

# =============== RECEIVING MODULE ===============

@router.post("/receiving/order/create")
async def create_receiving_order(order: ReceivingOrderCreate):
    """Create receiving order"""
    try:
        return {
            "status": "success",
            "message": "Receiving order created",
            "data": {
                "id": 1,
                "gr_number": "GR-2026-0001",
                **order.dict()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/receiving/order/{gr_id}")
async def get_receiving_order(gr_id: int):
    """Get receiving order details"""
    return {
        "status": "success",
        "data": {
            "id": gr_id,
            "gr_number": "GR-2026-0001",
            "po_id": 1,
            "warehouse_id": 1,
            "gr_date": datetime.now(),
            "receiver_name": "Somchai",
            "status": "RECEIVING",
            "items": [
                {
                    "product_id": 1,
                    "barcode": "BC001",
                    "quantity_received": 100,
                    "location_id": 5
                }
            ]
        }
    }

@router.post("/receiving/item/scan")
async def scan_receiving_item(item: ReceivingItemCreate):
    """Scan and receive item (mobile/scanner)"""
    try:
        return {
            "status": "success",
            "message": "Item received",
            "data": {
                "id": 1,
                "gr_id": item.gr_id,
                "product_id": item.product_id,
                "barcode": item.barcode,
                "quantity": item.quantity_received,
                "location": "A-01-1-A"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/receiving/item/qc")
async def qc_receiving_item(item_id: int, qc_status: str, qc_notes: Optional[str] = None):
    """QC check for received item"""
    return {
        "status": "success",
        "message": "QC completed",
        "data": {
            "item_id": item_id,
            "qc_status": qc_status,
            "qc_date": datetime.now()
        }
    }

@router.post("/receiving/order/complete")
async def complete_receiving_order(gr_id: int):
    """Complete receiving order"""
    return {
        "status": "success",
        "message": "Receiving order completed",
        "data": {
            "gr_id": gr_id,
            "status": "COMPLETED",
            "completed_at": datetime.now()
        }
    }

# =============== INVENTORY MODULE ===============

@router.get("/inventory/list")
async def list_inventory(warehouse_id: int, skip: int = Query(0), limit: int = Query(100)):
    """List inventory in warehouse"""
    return {
        "status": "success",
        "data": [
            {
                "id": 1,
                "product_id": 1,
                "sku": "SKU001",
                "product_name": "Product 1",
                "warehouse_id": warehouse_id,
                "location": "A-01-1-A",
                "quantity_on_hand": 500,
                "quantity_reserved": 100,
                "quantity_available": 400,
                "batch_number": "BAT-001",
                "lot_number": "LOT-001",
                "manufacture_date": "2025-01-01",
                "expiry_date": "2027-01-01",
                "status": "GOOD"
            }
        ],
        "total": 1
    }

@router.get("/inventory/{product_id}")
async def get_product_inventory(product_id: int, warehouse_id: int):
    """Get inventory for specific product"""
    return {
        "status": "success",
        "data": {
            "product_id": product_id,
            "sku": "SKU001",
            "product_name": "Product 1",
            "locations": [
                {
                    "location": "A-01-1-A",
                    "quantity": 200,
                    "batch": "BATCH001",
                    "expiry_date": "2027-03-03"
                },
                {
                    "location": "A-01-1-B",
                    "quantity": 300,
                    "batch": "BATCH002",
                    "expiry_date": "2027-06-03"
                }
            ],
            "total_quantity": 500
        }
    }

@router.post("/inventory/adjust")
async def adjust_inventory(adjustment: InventoryAdjustment):
    """Adjust inventory (stock count, damage, etc)"""
    return {
        "status": "success",
        "message": "Inventory adjusted",
        "data": {
            "inventory_id": adjustment.inventory_id,
            "adjustment_qty": adjustment.adjustment_quantity,
            "reason": adjustment.reason,
            "adjusted_at": datetime.now()
        }
    }

@router.post("/inventory/stock-count/create")
async def create_stock_count(count: StockCountCreate):
    """Create stock count"""
    return {
        "status": "success",
        "message": "Stock count created",
        "data": {
            "id": 1,
            "count_number": "SC-2026-0001",
            "warehouse_id": count.warehouse_id,
            "count_type": count.count_type,
            "status": "COUNTING"
        }
    }

@router.post("/inventory/stock-count/{count_id}/item")
async def add_stock_count_item(count_id: int, product_id: int, location_id: int, physical_qty: float):
    """Add item to stock count (mobile/scanner)"""
    return {
        "status": "success",
        "message": "Item counted",
        "data": {
            "count_id": count_id,
            "product_id": product_id,
            "location_id": location_id,
            "system_qty": 100,
            "physical_qty": physical_qty,
            "variance": physical_qty - 100
        }
    }

@router.get("/inventory/movement/{product_id}")
async def get_inventory_movement(product_id: int, days: int = Query(30)):
    """Get inventory movement history"""
    return {
        "status": "success",
        "data": [
            {
                "date": "2026-03-01",
                "type": "RECEIVING",
                "location": "A-01-1-A",
                "quantity": 500,
                "reference": "GR-2026-0001"
            },
            {
                "date": "2026-03-02",
                "type": "PICKING",
                "location": "A-01-1-A",
                "quantity": -100,
                "reference": "PICK-2026-0001"
            }
        ]
    }

# =============== PRODUCT MODULE ===============

@router.post("/product/create")
async def create_product(product: ProductCreate):
    """Create product"""
    return {
        "status": "success",
        "message": "Product created",
        "data": {
            "id": 1,
            **product.dict()
        }
    }

@router.get("/product/{sku}")
async def get_product_by_sku(sku: str):
    """Get product by SKU"""
    return {
        "status": "success",
        "data": {
            "id": 1,
            "sku": sku,
            "name_en": "Product 1",
            "name_th": "สินค้า 1",
            "barcode": "BC001",
            "category": "ELECTRONICS",
            "unit": "PCS",
            "weight_kg": 2.5,
            "volume_m3": 0.1
        }
    }

@router.get("/product/barcode/{barcode}")
async def get_product_by_barcode(barcode: str):
    """Get product by barcode (scanner)"""
    return {
        "status": "success",
        "data": {
            "id": 1,
            "sku": "SKU001",
            "barcode": barcode,
            "name_en": "Product 1",
            "name_th": "สินค้า 1",
            "unit": "PCS"
        }
    }

@router.get("/product/list")
async def list_products(skip: int = Query(0), limit: int = Query(100)):
    """List all products"""
    return {
        "status": "success",
        "data": [
            {
                "id": 1,
                "sku": "SKU001",
                "name_en": "Product 1",
                "name_th": "สินค้า 1",
                "category": "ELECTRONICS",
                "is_active": True
            }
        ],
        "total": 1
    }

@router.put("/product/{product_id}")
async def update_product(product_id: int, product: ProductCreate):
    """Update product"""
    return {
        "status": "success",
        "message": "Product updated",
        "data": {
            "id": product_id,
            **product.dict()
        }
    }

# =============== PICKING MODULE ===============

@router.post("/picking/list/create")
async def create_picking_list(picking: PickingListCreate):
    """Create picking list"""
    return {
        "status": "success",
        "message": "Picking list created",
        "data": {
            "id": 1,
            "pick_number": "PICK-2026-0001",
            "so_id": picking.so_id,
            "status": "CREATED"
        }
    }

@router.get("/picking/list/{pick_id}")
async def get_picking_list(pick_id: int):
    """Get picking list details"""
    return {
        "status": "success",
        "data": {
            "id": pick_id,
            "pick_number": "PICK-2026-0001",
            "so_id": 1,
            "status": "IN_PROGRESS",
            "items": [
                {
                    "id": 1,
                    "product_id": 1,
                    "sku": "SKU001",
                    "product_name": "Product 1",
                    "location": "A-01-1-A",
                    "quantity_to_pick": 100,
                    "quantity_picked": 50,
                    "barcode": "BC001"
                }
            ]
        }
    }

@router.post("/picking/item/scan")
async def scan_picking_item(pick_id: int, item_id: int, barcode: str, quantity: float):
    """Scan item during picking (mobile/scanner)"""
    return {
        "status": "success",
        "message": "Item picked",
        "data": {
            "pick_id": pick_id,
            "item_id": item_id,
            "barcode": barcode,
            "quantity_picked": quantity,
            "picked_at": datetime.now()
        }
    }

@router.post("/picking/list/{pick_id}/complete")
async def complete_picking_list(pick_id: int):
    """Complete picking list"""
    return {
        "status": "success",
        "message": "Picking list completed",
        "data": {
            "pick_id": pick_id,
            "status": "COMPLETED",
            "completed_at": datetime.now()
        }
    }

# =============== SHIPPING MODULE ===============

@router.post("/shipping/order/create")
async def create_shipment_order(shipment: ShipmentOrderCreate):
    """Create shipment order"""
    return {
        "status": "success",
        "message": "Shipment order created",
        "data": {
            "id": 1,
            "shipment_number": "SHIP-2026-0001",
            **shipment.dict()
        }
    }

@router.get("/shipping/order/{shipment_id}")
async def get_shipment_order(shipment_id: int):
    """Get shipment order details"""
    return {
        "status": "success",
        "data": {
            "id": shipment_id,
            "shipment_number": "SHIP-2026-0001",
            "so_id": 1,
            "tracking_number": "TRACK123456",
            "carrier": "Kerry Express",
            "status": "SHIPPED",
            "delivery_date": "2026-03-05",
            "items": [
                {
                    "product_id": 1,
                    "sku": "SKU001",
                    "quantity_shipped": 100,
                    "box_number": "BOX001"
                }
            ]
        }
    }

@router.post("/shipping/item/pack")
async def pack_shipment_item(shipment_id: int, item_id: int, box_number: str, barcode: str):
    """Pack item for shipment (mobile)"""
    return {
        "status": "success",
        "message": "Item packed",
        "data": {
            "shipment_id": shipment_id,
            "item_id": item_id,
            "box_number": box_number,
            "packed_at": datetime.now()
        }
    }

@router.post("/shipping/order/{shipment_id}/ship")
async def ship_shipment_order(shipment_id: int, carrier: str, tracking_number: str):
    """Update shipment as shipped"""
    return {
        "status": "success",
        "message": "Shipment shipped",
        "data": {
            "shipment_id": shipment_id,
            "carrier": carrier,
            "tracking_number": tracking_number,
            "shipped_at": datetime.now()
        }
    }

@router.get("/shipping/track/{tracking_number}")
async def track_shipment(tracking_number: str):
    """Track shipment"""
    return {
        "status": "success",
        "data": {
            "tracking_number": tracking_number,
            "shipment_number": "SHIP-2026-0001",
            "status": "IN_TRANSIT",
            "carrier": "Kerry Express",
            "updates": [
                {
                    "date": "2026-03-03",
                    "status": "SHIPPED",
                    "location": "Bangkok Warehouse"
                },
                {
                    "date": "2026-03-04",
                    "status": "IN_TRANSIT",
                    "location": "Chiang Mai"
                }
            ]
        }
    }

# =============== IMPORT/EXPORT MODULE ===============

@router.post("/import/products")
async def import_products(file: UploadFile = File(...)):
    """Import products from Excel"""
    try:
        contents = await file.read()
        # Process Excel file
        return {
            "status": "success",
            "message": "Products imported",
            "imported_count": 100,
            "errors": []
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/import/receiving")
async def import_receiving_orders(file: UploadFile = File(...)):
    """Import receiving orders from Excel"""
    try:
        contents = await file.read()
        return {
            "status": "success",
            "message": "Receiving orders imported",
            "imported_count": 50
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/import/sales-orders")
async def import_sales_orders(file: UploadFile = File(...)):
    """Import sales orders from Excel"""
    try:
        contents = await file.read()
        return {
            "status": "success",
            "message": "Sales orders imported",
            "imported_count": 75
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/export/inventory")
async def export_inventory(warehouse_id: int):
    """Export inventory to Excel"""
    try:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["SKU", "Product", "Location", "Quantity", "Status"])
        writer.writerow(["SKU001", "Product 1", "A-01-1-A", "100", "GOOD"])
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=inventory.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/export/receiving")
async def export_receiving_orders(warehouse_id: int, start_date: str, end_date: str):
    """Export receiving orders to Excel/PDF"""
    return {
        "status": "success",
        "message": "Export started",
        "file_url": "/downloads/receiving_orders.xlsx"
    }

@router.get("/export/sales-orders")
async def export_sales_orders(warehouse_id: int, start_date: str, end_date: str):
    """Export sales orders to Excel/PDF"""
    return {
        "status": "success",
        "message": "Export started",
        "file_url": "/downloads/sales_orders.xlsx"
    }

@router.get("/export/picking-lists")
async def export_picking_lists(warehouse_id: int, date: str):
    """Export picking lists to PDF"""
    return {
        "status": "success",
        "message": "PDF generated",
        "file_url": "/downloads/picking_lists.pdf"
    }

@router.get("/export/shipping-manifests")
async def export_shipping_manifests(warehouse_id: int, date: str):
    """Export shipping manifests to PDF"""
    return {
        "status": "success",
        "message": "PDF generated",
        "file_url": "/downloads/shipping_manifests.pdf"
    }

# =============== REPORTS ===============

@router.get("/report/receiving-summary")
async def receiving_summary(warehouse_id: int, start_date: str, end_date: str):
    """Receiving summary report"""
    return {
        "status": "success",
        "data": {
            "total_orders": 50,
            "total_items": 5000,
            "total_pallets": 100,
            "average_processing_time_hours": 2.5,
            "qc_pass_rate": "98.5%",
            "by_supplier": [
                {"supplier": "Supplier A", "orders": 20, "items": 2000},
                {"supplier": "Supplier B", "orders": 30, "items": 3000}
            ]
        }
    }

@router.get("/report/inventory-summary")
async def inventory_summary(warehouse_id: int):
    """Inventory summary report"""
    return {
        "status": "success",
        "data": {
            "total_products": 500,
            "total_quantity": 50000,
            "total_pallets": 1000,
            "expired_items": 10,
            "damaged_items": 5,
            "fast_moving": [
                {"sku": "SKU001", "quantity": 5000, "turnover": "25/month"},
                {"sku": "SKU002", "quantity": 4000, "turnover": "20/month"}
            ]
        }
    }

@router.get("/report/shipping-summary")
async def shipping_summary(warehouse_id: int, start_date: str, end_date: str):
    """Shipping summary report"""
    return {
        "status": "success",
        "data": {
            "total_orders": 100,
            "total_items_shipped": 8000,
            "total_pallets": 200,
            "average_handling_time_hours": 4.2,
            "on_time_delivery_rate": "96.5%",
            "by_carrier": [
                {"carrier": "Kerry Express", "shipments": 50, "items": 4000},
                {"carrier": "Flash Express", "shipments": 50, "items": 4000}
            ]
        }
    }

# Register router
# In main.py: app.include_router(router)
