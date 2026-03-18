// src/i18n/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import thTranslations from './locales/th.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      th: { translation: thTranslations }
    },
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

// src/i18n/locales/en.json
{
  "app": {
    "name": "SAMILA WMS",
    "subtitle": "Warehouse Management System",
    "tagline": "Innovation for Excellence"
  },
  "menu": {
    "dashboard": "Dashboard",
    "receiving": "Receiving",
    "inventory": "Inventory",
    "product": "Product",
    "picking": "Picking",
    "shipping": "Shipping",
    "tarif": "Tarif Management",
    "reports": "Reports",
    "settings": "Settings",
    "users": "Users"
  },
  "receiving": {
    "title": "Receiving Module",
    "newOrder": "New Receiving Order",
    "grNumber": "GR Number",
    "poNumber": "PO Number",
    "supplier": "Supplier",
    "date": "Date",
    "receiver": "Receiver",
    "items": "Items",
    "status": "Status",
    "scanItem": "Scan Item Barcode",
    "quantity": "Quantity",
    "location": "Location",
    "qc": "Quality Check",
    "complete": "Complete",
    "importExcel": "Import from Excel",
    "exportPDF": "Export to PDF"
  },
  "inventory": {
    "title": "Inventory Module",
    "list": "Inventory List",
    "sku": "SKU",
    "product": "Product",
    "warehouse": "Warehouse",
    "quantity": "Quantity",
    "available": "Available",
    "reserved": "Reserved",
    "location": "Location",
    "status": "Status",
    "adjust": "Adjust Stock",
    "stockCount": "Stock Count",
    "movement": "Movement History",
    "export": "Export List"
  },
  "product": {
    "title": "Product Module",
    "list": "Product List",
    "sku": "SKU",
    "barcode": "Barcode",
    "name": "Product Name",
    "category": "Category",
    "unit": "Unit",
    "price": "Price",
    "create": "Create Product",
    "import": "Import Products",
    "export": "Export Products"
  },
  "picking": {
    "title": "Picking Module",
    "pickList": "Picking List",
    "soNumber": "SO Number",
    "items": "Items",
    "scanItem": "Scan Item",
    "location": "Location",
    "quantity": "Quantity",
    "toPick": "To Pick",
    "picked": "Picked",
    "complete": "Complete Picking"
  },
  "shipping": {
    "title": "Shipping Module",
    "shipment": "Shipment",
    "soNumber": "SO Number",
    "carrier": "Carrier",
    "tracking": "Tracking Number",
    "weight": "Weight",
    "pallets": "Pallets",
    "delivery": "Delivery Address",
    "pack": "Pack Items",
    "ship": "Ship",
    "track": "Track Shipment"
  },
  "buttons": {
    "create": "Create",
    "save": "Save",
    "cancel": "Cancel",
    "edit": "Edit",
    "delete": "Delete",
    "import": "Import",
    "export": "Export",
    "complete": "Complete",
    "scan": "Scan",
    "submit": "Submit",
    "print": "Print"
  },
  "messages": {
    "success": "Success",
    "error": "Error",
    "warning": "Warning",
    "confirm": "Confirm",
    "delete": "Are you sure?",
    "saved": "Saved successfully",
    "imported": "Imported successfully",
    "exported": "Exported successfully"
  }
}

// src/i18n/locales/th.json
{
  "app": {
    "name": "SAMILA WMS",
    "subtitle": "ระบบจัดการคลังสินค้า",
    "tagline": "นวัตกรรมเพื่อความเป็นเลิศ"
  },
  "menu": {
    "dashboard": "แดชบอร์ด",
    "receiving": "การรับสินค้า",
    "inventory": "สินค้าคงคลัง",
    "product": "สินค้า",
    "picking": "การคัดเลือก",
    "shipping": "การส่งสินค้า",
    "tarif": "การจัดการอัตราค่าบริการ",
    "reports": "รายงาน",
    "settings": "ตั้งค่า",
    "users": "ผู้ใช้งาน"
  },
  "receiving": {
    "title": "โมดูลการรับสินค้า",
    "newOrder": "ใบรับสินค้าใหม่",
    "grNumber": "หมายเลข GR",
    "poNumber": "หมายเลข PO",
    "supplier": "ผู้ส่ง",
    "date": "วันที่",
    "receiver": "ผู้รับ",
    "items": "รายการ",
    "status": "สถานะ",
    "scanItem": "สแกนบาร์โค้ดสินค้า",
    "quantity": "จำนวน",
    "location": "ตำแหน่ง",
    "qc": "ตรวจสอบคุณภาพ",
    "complete": "เสร็จสิ้น",
    "importExcel": "นำเข้าจาก Excel",
    "exportPDF": "ส่งออกเป็น PDF"
  },
  "inventory": {
    "title": "โมดูลสินค้าคงคลัง",
    "list": "รายการสินค้าคงคลัง",
    "sku": "รหัส SKU",
    "product": "สินค้า",
    "warehouse": "คลังสินค้า",
    "quantity": "จำนวน",
    "available": "คงเหลือ",
    "reserved": "จองแล้ว",
    "location": "ตำแหน่ง",
    "status": "สถานะ",
    "adjust": "ปรับปรุงสต็อก",
    "stockCount": "นับสต็อก",
    "movement": "ประวัติการเคลื่อนที่",
    "export": "ส่งออกรายการ"
  },
  "product": {
    "title": "โมดูลสินค้า",
    "list": "รายการสินค้า",
    "sku": "รหัส SKU",
    "barcode": "บาร์โค้ด",
    "name": "ชื่อสินค้า",
    "category": "หมวดหมู่",
    "unit": "หน่วย",
    "price": "ราคา",
    "create": "สร้างสินค้า",
    "import": "นำเข้าสินค้า",
    "export": "ส่งออกสินค้า"
  },
  "picking": {
    "title": "โมดูลการคัดเลือก",
    "pickList": "รายการคัดเลือก",
    "soNumber": "หมายเลข SO",
    "items": "รายการ",
    "scanItem": "สแกนสินค้า",
    "location": "ตำแหน่ง",
    "quantity": "จำนวน",
    "toPick": "ต้องคัดเลือก",
    "picked": "คัดเลือกแล้ว",
    "complete": "เสร็จสิ้นการคัดเลือก"
  },
  "shipping": {
    "title": "โมดูลการส่งสินค้า",
    "shipment": "การส่งสินค้า",
    "soNumber": "หมายเลข SO",
    "carrier": "บริษัทขนส่ง",
    "tracking": "หมายเลขติดตาม",
    "weight": "น้ำหนัก",
    "pallets": "พาเลท",
    "delivery": "ที่อยู่ส่งมอบ",
    "pack": "บรรจุสินค้า",
    "ship": "ส่งสินค้า",
    "track": "ติดตามสินค้า"
  },
  "buttons": {
    "create": "สร้าง",
    "save": "บันทึก",
    "cancel": "ยกเลิก",
    "edit": "แก้ไข",
    "delete": "ลบ",
    "import": "นำเข้า",
    "export": "ส่งออก",
    "complete": "เสร็จสิ้น",
    "scan": "สแกน",
    "submit": "ส่ง",
    "print": "พิมพ์"
  },
  "messages": {
    "success": "สำเร็จ",
    "error": "ข้อผิดพลาด",
    "warning": "คำเตือน",
    "confirm": "ยืนยัน",
    "delete": "คุณแน่ใจหรือไม่?",
    "saved": "บันทึกสำเร็จ",
    "imported": "นำเข้าสำเร็จ",
    "exported": "ส่งออกสำเร็จ"
  }
}
