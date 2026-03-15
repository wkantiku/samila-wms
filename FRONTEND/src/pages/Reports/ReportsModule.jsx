import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ZONES, ZONE_OPTIONS } from '../../constants/zones';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { MAIN_UNIT_GROUPS as UNIT_GROUPS } from '../../constants/units';
import './ReportsModule.css';

/* ── Static demo data ── */
const revenueData = [
  { month: 'Oct', revenue: 182000, cost: 98000 },
  { month: 'Nov', revenue: 210000, cost: 112000 },
  { month: 'Dec', revenue: 245000, cost: 130000 },
  { month: 'Jan', revenue: 198000, cost: 105000 },
  { month: 'Feb', revenue: 227000, cost: 118000 },
  { month: 'Mar', revenue: 263000, cost: 138000 },
];

const throughputData = [
  { month: 'Oct', inbound: 1200, outbound: 1080 },
  { month: 'Nov', inbound: 1450, outbound: 1320 },
  { month: 'Dec', inbound: 1680, outbound: 1540 },
  { month: 'Jan', inbound: 1310, outbound: 1200 },
  { month: 'Feb', inbound: 1520, outbound: 1380 },
  { month: 'Mar', inbound: 1740, outbound: 1620 },
];

const customerRevenue = [
  { name: 'Nayong Hospital', value: 86000,  color: '#00E5FF' },
  { name: 'ThaiBev Co.',     value: 72000,  color: '#00CC88' },
  { name: 'SCG Logistics',   value: 54000,  color: '#FFD700' },
  { name: 'Lotus Express',   value: 31000,  color: '#FF8C42' },
  { name: 'CPF Thailand',    value: 14000,  color: '#9B7FFF' },
  { name: 'AIS Warehouse',   value: 6000,   color: '#FF6B6B' },
];

const customers = [
  { key: 'nayong',  name: 'Nayong Hospital',  code: 'NH-001', contact: 'คุณสมชาย',   phone: '074-611-001' },
  { key: 'thaibev', name: 'ThaiBev Co.',       code: 'TB-002', contact: 'คุณวิชัย',   phone: '02-785-5555' },
  { key: 'scg',     name: 'SCG Logistics',     code: 'SG-003', contact: 'คุณสุภาพร', phone: '02-586-2000' },
  { key: 'lotus',   name: 'Lotus Express',     code: 'LE-004', contact: 'คุณนภา',    phone: '02-833-5000' },
  { key: 'cpf',     name: 'CPF Thailand',      code: 'CP-005', contact: 'คุณธนา',    phone: '02-767-8000' },
  { key: 'ais',     name: 'AIS Warehouse',     code: 'AW-006', contact: 'คุณปรีชา',  phone: '02-029-5000' },
];

const reportCategories = [
  { key: 'inventory',    icon: '📦', label: 'Inventory Report',      color: '#00E5FF' },
  { key: 'receiving',    icon: '📥', label: 'Receiving Report',       color: '#00CC88' },
  { key: 'shipping',     icon: '🚚', label: 'Shipping Report',        color: '#FFD700' },
  { key: 'billing',      icon: '💰', label: 'Billing / Tarif Report', color: '#FF8C42' },
  { key: 'capacity',     icon: '🏭', label: 'Capacity Report',        color: '#9B7FFF' },
  { key: 'kpi',          icon: '📊', label: 'KPI / Performance',      color: '#FF6B6B' },
  { key: 'product',      icon: '🏷️', label: 'Product Report',         color: '#00BCD4' },
  { key: 'customer',     icon: '👥', label: 'Customer Summary',       color: '#4CAF50' },
  { key: 'nonmovement',  icon: '🔴', label: 'Non Movement Report',    color: '#FF4444' },
  { key: 'expiry',       icon: '⏰', label: 'Expiry Report',           color: '#FFD700' },
];

const recentReports = [
  { id: 1, name: 'Monthly Inventory – Nayong Hospital',    type: 'inventory',   date: '2026-03-11', size: '245 KB', format: 'pdf' },
  { id: 2, name: 'Billing Report – ThaiBev Co.',           type: 'billing',     date: '2026-03-10', size: '128 KB', format: 'pdf' },
  { id: 3, name: 'Non Movement Report – All Customers',    type: 'nonmovement', date: '2026-03-10', size: '98 KB',  format: 'pdf' },
  { id: 4, name: 'Delivery Performance – SCG Logistics',   type: 'kpi',         date: '2026-03-09', size: '89 KB',  format: 'pdf' },
  { id: 5, name: 'Stock Movement – Lotus Express',         type: 'inventory',   date: '2026-03-05', size: '312 KB', format: 'pdf' },
  { id: 6, name: 'Inbound/Outbound – CPF Thailand',        type: 'receiving',   date: '2026-03-04', size: '156 KB', format: 'pdf' },
  { id: 7, name: 'KPI Summary – AIS Warehouse',            type: 'kpi',         date: '2026-03-01', size: '74 KB',  format: 'pdf' },
  { id: 8, name: 'Expiry Report – All Customers',          type: 'expiry',      date: '2026-03-12', size: '112 KB', format: 'pdf' },
];

const typeColor = { inventory: '#00E5FF', billing: '#FF8C42', kpi: '#FF6B6B', receiving: '#00CC88', shipping: '#FFD700', capacity: '#9B7FFF', nonmovement: '#FF4444', expiry: '#FFD700' };

/* ── Expiry demo data ── */
const allExpiryItems = [
  { sku: 'SKU-EX001', name: 'Product Alpha-1',   customer: 'Nayong Hospital',  warehouse: 'WH-BKK', location: 'A-01-2', qty: 50,  mainUnit: 'PCS', batNumber: 'BAT-A01', lotNumber: 'LOT-A01', mfgDate: '2024-03-01', expiryDate: '2026-02-28', daysLeft: -12, status: 'EXPIRED'  },
  { sku: 'SKU-EX002', name: 'Product Beta-3',    customer: 'ThaiBev Co.',      warehouse: 'WH-NTB', location: 'B-04-1', qty: 30,  mainUnit: 'BOX', batNumber: 'BAT-B03', lotNumber: 'LOT-B03', mfgDate: '2024-04-01', expiryDate: '2026-03-20', daysLeft: 8,   status: 'CRITICAL' },
  { sku: 'SKU-EX003', name: 'Product Gamma-2',   customer: 'SCG Logistics',    warehouse: 'WH-BKK', location: 'C-02-3', qty: 120, mainUnit: 'KG',  batNumber: 'BAT-C02', lotNumber: 'LOT-C02', mfgDate: '2025-01-15', expiryDate: '2026-03-30', daysLeft: 18,  status: 'CRITICAL' },
  { sku: 'SKU-EX004', name: 'Product Delta-5',   customer: 'Lotus Express',    warehouse: 'WH-PTN', location: 'D-03-1', qty: 75,  mainUnit: 'BTL', batNumber: 'BAT-D05', lotNumber: 'LOT-D05', mfgDate: '2025-02-01', expiryDate: '2026-04-15', daysLeft: 34,  status: 'WARNING'  },
  { sku: 'SKU-EX005', name: 'Product Epsilon-1', customer: 'CPF Thailand',     warehouse: 'WH-NTB', location: 'A-06-2', qty: 200, mainUnit: 'PCS', batNumber: 'BAT-E01', lotNumber: 'LOT-E01', mfgDate: '2025-03-01', expiryDate: '2026-04-30', daysLeft: 49,  status: 'WARNING'  },
  { sku: 'SKU-EX006', name: 'Product Zeta-7',    customer: 'AIS Warehouse',    warehouse: 'WH-BKK', location: 'B-05-1', qty: 90,  mainUnit: 'BAG', batNumber: 'BAT-Z07', lotNumber: 'LOT-Z07', mfgDate: '2025-04-01', expiryDate: '2026-05-25', daysLeft: 74,  status: 'CAUTION'  },
  { sku: 'SKU-EX007', name: 'Product Eta-2',     customer: 'Nayong Hospital',  warehouse: 'WH-CNX', location: 'E-02-3', qty: 45,  mainUnit: 'PCS', batNumber: 'BAT-H02', lotNumber: 'LOT-H02', mfgDate: '2024-06-01', expiryDate: '2026-03-25', daysLeft: 13,  status: 'CRITICAL' },
  { sku: 'SKU-EX008', name: 'Product Theta-4',   customer: 'ThaiBev Co.',      warehouse: 'WH-BKK', location: 'A-09-1', qty: 160, mainUnit: 'BTL', batNumber: 'BAT-T04', lotNumber: 'LOT-T04', mfgDate: '2025-05-01', expiryDate: '2026-06-10', daysLeft: 90,  status: 'CAUTION'  },
  { sku: 'SKU-EX009', name: 'Product Iota-3',    customer: 'SCG Logistics',    warehouse: 'WH-PTN', location: 'F-01-2', qty: 60,  mainUnit: 'PCS', batNumber: 'BAT-I03', lotNumber: 'LOT-I03', mfgDate: '2024-02-01', expiryDate: '2026-03-05', daysLeft: -7,  status: 'EXPIRED'  },
  { sku: 'SKU-EX010', name: 'Product Kappa-6',   customer: 'Lotus Express',    warehouse: 'WH-BKK', location: 'C-04-1', qty: 80,  mainUnit: 'BOX', batNumber: 'BAT-K06', lotNumber: 'LOT-K06', mfgDate: '2025-06-01', expiryDate: '2026-06-01', daysLeft: 81,  status: 'CAUTION'  },
];

/* ── Non-Movement demo data (received >= 6 months ago, no outbound movement) ── */
const NON_MOVE_THRESHOLD_MONTHS = 6;
const allNonMovementItems = [
  { sku: 'SKU-NM001', name: 'Product Omega',      customer: 'Nayong Hospital',  warehouse: 'WH-BKK', location: 'A-05-3', qty: 120, unit: 'กล่อง', receivedDate: '2025-07-15', ageMonths: 8,  value: '฿36,000'  },
  { sku: 'SKU-NM002', name: 'Product Sigma',      customer: 'ThaiBev Co.',      warehouse: 'WH-NTB', location: 'B-03-1', qty: 85,  unit: 'ลัง',   receivedDate: '2025-06-20', ageMonths: 9,  value: '฿42,500'  },
  { sku: 'SKU-NM003', name: 'Product Theta',      customer: 'SCG Logistics',    warehouse: 'WH-BKK', location: 'C-02-2', qty: 200, unit: 'ชิ้น',  receivedDate: '2025-05-10', ageMonths: 10, value: '฿20,000'  },
  { sku: 'SKU-NM004', name: 'Product Lambda',     customer: 'Lotus Express',    warehouse: 'WH-PTN', location: 'D-01-1', qty: 60,  unit: 'กล่อง', receivedDate: '2025-08-01', ageMonths: 7,  value: '฿15,000'  },
  { sku: 'SKU-NM005', name: 'Product Kappa',      customer: 'CPF Thailand',     warehouse: 'WH-NTB', location: 'A-04-2', qty: 45,  unit: 'ลัง',   receivedDate: '2025-04-25', ageMonths: 11, value: '฿22,500'  },
  { sku: 'SKU-NM006', name: 'Product Zeta',       customer: 'AIS Warehouse',    warehouse: 'WH-BKK', location: 'B-06-3', qty: 300, unit: 'ชิ้น',  receivedDate: '2025-03-18', ageMonths: 12, value: '฿30,000'  },
  { sku: 'SKU-NM007', name: 'Product Eta',        customer: 'Nayong Hospital',  warehouse: 'WH-BKK', location: 'A-07-1', qty: 75,  unit: 'กล่อง', receivedDate: '2025-08-30', ageMonths: 6,  value: '฿18,750'  },
  { sku: 'SKU-NM008', name: 'Product Mu',         customer: 'ThaiBev Co.',      warehouse: 'WH-CNX', location: 'E-01-1', qty: 150, unit: 'ลัง',   receivedDate: '2025-06-01', ageMonths: 9,  value: '฿75,000'  },
  { sku: 'SKU-NM009', name: 'Product Nu',         customer: 'SCG Logistics',    warehouse: 'WH-PTN', location: 'F-02-4', qty: 90,  unit: 'ชิ้น',  receivedDate: '2025-07-22', ageMonths: 8,  value: '฿9,000'   },
  { sku: 'SKU-NM010', name: 'Product Xi',         customer: 'Lotus Express',    warehouse: 'WH-BKK', location: 'C-03-2', qty: 40,  unit: 'กล่อง', receivedDate: '2025-05-05', ageMonths: 10, value: '฿12,000'  },
];

/* ── PDF Preview Data Generator ── */
function buildReportRows(type, _customerKey) {
  if (type === 'inventory') return {
    cols: ['SKU', 'ชื่อสินค้า', 'คลัง', 'Location', 'Qty', 'Available', 'Reserved', 'BAT No.', 'Lot No.', 'MFG Date', 'Expiry Date', 'สถานะ'],
    rows: [
      ['SKU001', 'Product Alpha',   'Warehouse A', 'A-01-1', 500, 400, 100, 'BAT-001', 'LOT-001', '2025-01-15', '2027-01-15', 'GOOD'],
      ['SKU002', 'Product Beta',    'Warehouse A', 'A-02-1', 320, 280,  40, 'BAT-002', 'LOT-002', '2025-02-01', '2027-02-01', 'GOOD'],
      ['SKU003', 'Product Gamma',   'Warehouse B', 'B-01-1', 150, 150,   0, 'BAT-003', 'LOT-003', '2025-03-01', '2027-03-01', 'GOOD'],
      ['SKU004', 'Product Delta',   'Warehouse A', 'A-03-2',  80,  60,  20, 'BAT-004', 'LOT-004', '2025-04-01', '2026-04-01', 'LOW'],
      ['SKU005', 'Product Epsilon', 'Warehouse B', 'B-02-1', 210, 200,  10, 'BAT-005', 'LOT-005', '2025-05-01', '2027-05-01', 'GOOD'],
    ],
  };
  if (type === 'billing') return {
    cols: ['Invoice No.', 'รายการ', 'จำนวน', 'ราคา/หน่วย', 'รวม (฿)'],
    rows: [
      ['INV-2026-0311', 'ค่าบริการรับสินค้า (GR)',       450, '฿25.00',  '฿11,250'],
      ['INV-2026-0311', 'ค่าบริการจัดส่ง (Shipping)',    380, '฿35.00',  '฿13,300'],
      ['INV-2026-0311', 'ค่าพื้นที่คลัง (Storage)',       30, '฿850.00', '฿25,500'],
      ['INV-2026-0311', 'ค่า Value-Added Service',         12, '฿200.00',  '฿2,400'],
      ['INV-2026-0311', 'ค่าบริการ Labeling',            200, '฿8.00',   '฿1,600'],
    ],
    footer: 'ยอดรวม: ฿54,050  |  VAT 7%: ฿3,784  |  ยอดสุทธิ: ฿57,834',
  };
  if (type === 'shipping') return {
    cols: ['Shipment No.', 'วันที่จัดส่ง', 'ปลายทาง', 'น้ำหนัก (kg)', 'พาหนะ', 'สถานะ'],
    rows: [
      ['SH-2026-0891', '2026-03-11', 'กรุงเทพฯ',    125, 'รถกระบะ 4 ล้อ', 'ส่งแล้ว'],
      ['SH-2026-0887', '2026-03-10', 'นนทบุรี',      88, 'มอเตอร์ไซค์',   'ส่งแล้ว'],
      ['SH-2026-0882', '2026-03-09', 'สมุทรปราการ', 340, 'รถบรรทุก 6 ล้อ','ส่งแล้ว'],
      ['SH-2026-0878', '2026-03-08', 'ปทุมธานี',    210, 'รถกระบะ 4 ล้อ', 'ส่งแล้ว'],
      ['SH-2026-0872', '2026-03-07', 'อยุธยา',      560, 'รถบรรทุก 10 ล้อ','ส่งแล้ว'],
    ],
  };
  if (type === 'receiving') return {
    cols: ['GR No.', 'วันที่รับ', 'Supplier', 'SKU', 'จำนวนที่สั่ง', 'จำนวนที่รับ', 'BAT No.', 'Lot No.', 'MFG Date', 'Expiry Date', 'หมายเหตุ'],
    rows: [
      ['GR-2026-0201', '2026-03-11', 'ABC Supply',  'SKU001', 500, 500, 'BAT-001', 'LOT-001', '2025-01-15', '2027-01-15', '-'],
      ['GR-2026-0198', '2026-03-10', 'XYZ Trading', 'SKU003', 200, 195, 'BAT-003', 'LOT-003', '2025-03-01', '2027-03-01', 'ชำรุด 5 ชิ้น'],
      ['GR-2026-0195', '2026-03-09', 'ABC Supply',  'SKU002', 300, 300, 'BAT-002', 'LOT-002', '2025-02-01', '2027-02-01', '-'],
      ['GR-2026-0192', '2026-03-08', 'DEF Import',  'SKU004', 100,  80, 'BAT-004', 'LOT-004', '2025-04-01', '2026-04-01', 'รอตรวจสอบ 20'],
      ['GR-2026-0190', '2026-03-07', 'XYZ Trading', 'SKU005', 250, 250, 'BAT-005', 'LOT-005', '2025-05-01', '2027-05-01', '-'],
    ],
  };
  if (type === 'kpi') return {
    cols: ['KPI Metric', 'เป้าหมาย', 'ผลจริง', 'สถานะ'],
    rows: [
      ['Delivery Reliability',  '95%', '86.65%', '⚠️ ต่ำกว่าเป้า'],
      ['Order Accuracy',        '99%', '98.2%',  '✅ ผ่าน'],
      ['Complaint Rate',        '<5%', '11.07%', '❌ เกินเป้า'],
      ['Inventory Accuracy',    '99%', '99.5%',  '✅ ผ่าน'],
      ['On-time GR Processing', '90%', '94.3%',  '✅ ผ่าน'],
      ['Throughput (Outbound)', '1500',  '1620',  '✅ ผ่าน'],
    ],
  };
  if (type === 'capacity') return {
    cols: ['คลังสินค้า', 'ความจุ (ลัง)', 'ใช้งาน', 'คงเหลือ', '%ใช้งาน', 'สถานะ'],
    rows: [
      ['Warehouse A', '5,000', '3,200', '1,800', '64%', '✅ ปกติ'],
      ['Warehouse B', '3,000', '1,800', '1,200', '60%', '✅ ปกติ'],
      ['Warehouse C', '8,000', '2,100', '5,900', '26%', '✅ ปกติ'],
    ],
  };
  if (type === 'product') return {
    cols: ['SKU', 'ชื่อสินค้า', 'หมวดหมู่', 'BAT No.', 'Lot No.', 'MFG Date', 'Expiry Date', 'ยอดเคลื่อนไหว/เดือน', 'มูลค่า (฿)', 'ABC Class'],
    rows: [
      ['SKU001', 'Product Alpha',   'Medical',    'BAT-001', 'LOT-001', '2025-01-15', '2027-01-15', 450, '฿112,500', 'A'],
      ['SKU002', 'Product Beta',    'General',    'BAT-002', 'LOT-002', '2025-02-01', '2027-02-01', 280, '฿56,000',  'A'],
      ['SKU003', 'Product Gamma',   'Food',       'BAT-003', 'LOT-003', '2025-03-01', '2027-03-01', 195, '฿38,025',  'B'],
      ['SKU004', 'Product Delta',   'Electronic', 'BAT-004', 'LOT-004', '2025-04-01', '2026-04-01',  60, '฿18,000',  'C'],
      ['SKU005', 'Product Epsilon', 'Medical',    'BAT-005', 'LOT-005', '2025-05-01', '2027-05-01', 210, '฿63,000',  'B'],
    ],
  };
  if (type === 'nonmovement') return {
    cols: ['SKU', 'ชื่อสินค้า', 'ลูกค้า', 'คลัง', 'Location', 'จำนวน', 'วันที่รับเข้า', 'อายุ (เดือน)', 'มูลค่า'],
    rows: allNonMovementItems.map(i => [i.sku, i.name, i.customer, i.warehouse, i.location, `${i.qty} ${i.unit}`, i.receivedDate, `${i.ageMonths} เดือน`, i.value]),
    footer: `รวม ${allNonMovementItems.length} รายการ | สินค้าค้างสต็อก ≥ ${NON_MOVE_THRESHOLD_MONTHS} เดือน`,
  };
  if (type === 'expiry') return {
    cols: ['SKU', 'ชื่อสินค้า', 'ลูกค้า', 'คลัง', 'Location', 'Qty', 'BAT No.', 'Lot No.', 'MFG Date', 'Expiry Date', 'คงเหลือ (วัน)', 'สถานะ'],
    rows: allExpiryItems.map(i => [i.sku, i.name, i.customer, i.warehouse, i.location, `${i.qty} ${i.mainUnit}`, i.batNumber, i.lotNumber, i.mfgDate, i.expiryDate, i.daysLeft < 0 ? 'หมดอายุแล้ว' : `${i.daysLeft} วัน`, i.status]),
    footer: `รวม ${allExpiryItems.length} รายการ | EXPIRED + CRITICAL + WARNING + CAUTION`,
  };
  /* customer summary */
  return {
    cols: ['รายการ', 'มีนาคม 2026', 'กุมภาพันธ์ 2026', 'เปลี่ยนแปลง'],
    rows: [
      ['รายการ Inbound',     '450', '390', '+15.4%'],
      ['รายการ Outbound',    '380', '340', '+11.8%'],
      ['ยอดเรียกเก็บ (฿)',  '57,834', '52,100', '+11.0%'],
      ['Complaint',              '2', '5',   '-60.0%'],
      ['On-time Delivery',  '96.8%', '94.2%', '+2.6%'],
    ],
  };
}

/* ── PDF Preview Component ── */
function PdfPreviewModal({ report, customer, dateFrom, dateTo, onClose }) {
  const printRef = useRef();
  const cust = customers.find(c => c.key === customer);
  const catInfo = reportCategories.find(r => r.key === report.type);
  const tableData = buildReportRows(report.type, customer);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>${report.name}</title>
      <style>
        body { font-family: 'Sarabun', Arial, sans-serif; margin: 0; padding: 24px; color: #222; font-size: 12px; }
        .doc-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0d7ea8; padding-bottom: 12px; margin-bottom: 18px; }
        .doc-logo { font-size: 20px; font-weight: 800; color: #0d7ea8; }
        .doc-title { font-size: 16px; font-weight: 700; margin: 8px 0 4px; }
        .doc-sub { font-size: 11px; color: #666; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f5f8fa; border: 1px solid #dce6eb; border-radius: 4px; padding: 12px 14px; margin-bottom: 16px; }
        .info-label { font-size: 10px; color: #888; text-transform: uppercase; }
        .info-val { font-size: 12px; font-weight: 600; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        th { background: #0d7ea8; color: white; padding: 8px 10px; text-align: left; font-size: 11px; }
        td { padding: 7px 10px; border-bottom: 1px solid #e8eef2; font-size: 11px; }
        tr:nth-child(even) td { background: #f5f8fa; }
        .footer-note { font-size: 10px; color: #888; border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px; }
        .total-row { font-weight: 700; color: #0d7ea8; font-size: 12px; margin-top: 8px; }
        .sign-area { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
        .sign-box { border-top: 1px solid #999; padding-top: 6px; font-size: 11px; color: #555; text-align: center; }
      </style>
      </head><body>
      <div class="doc-header">
        <div>
          <div class="doc-logo">SAMILA 3PL</div>
          <div style="font-size:10px;color:#888;">SAMILA 3PL Co., Ltd. | 123 Logistics Park, Bangkok 10400<br/>Tel: 02-123-4567 | Tax ID: 0107559000123</div>
        </div>
        <div style="text-align:right;">
          <div class="doc-title">${report.name}</div>
          <div class="doc-sub">รายงานวันที่: ${new Date().toLocaleDateString('th-TH')}</div>
          <div class="doc-sub">Doc No.: RPT-${Date.now().toString().slice(-6)}</div>
        </div>
      </div>
      <div class="info-grid">
        <div><div class="info-label">ลูกค้า</div><div class="info-val">${cust?.name || '-'}</div></div>
        <div><div class="info-label">รหัสลูกค้า</div><div class="info-val">${cust?.code || '-'}</div></div>
        <div><div class="info-label">ช่วงวันที่</div><div class="info-val">${dateFrom} ถึง ${dateTo}</div></div>
        <div><div class="info-label">ประเภทรายงาน</div><div class="info-val">${catInfo?.label || report.name}</div></div>
      </div>
      <table>
        <thead><tr>${tableData.cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${tableData.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
      ${tableData.footer ? `<div class="total-row">${tableData.footer}</div>` : ''}
      <div class="footer-note">รายงานนี้สร้างโดยระบบ BB Innovation อัตโนมัติ | วันที่พิมพ์: ${new Date().toLocaleString('th-TH')}</div>
      <div class="sign-area">
        <div class="sign-box">ผู้จัดทำ<br/><br/>______________________<br/>วันที่ ____________</div>
        <div class="sign-box">ผู้อนุมัติ<br/><br/>______________________<br/>วันที่ ____________</div>
      </div>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  return (
    <div className="pdf-overlay" onClick={onClose}>
      <div className="pdf-modal" onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div className="pdf-modal-header">
          <div className="pdf-modal-title">
            <span className="pdf-badge">PDF Preview</span>
            <span>{report.name}</span>
          </div>
          <div className="pdf-modal-actions">
            <button className="pdf-print-btn" onClick={handlePrint}>🖨️ Print / Save PDF</button>
            <button className="pdf-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Document Preview */}
        <div className="pdf-scroll-area" ref={printRef}>
          <div className="pdf-doc">

            {/* Doc Header */}
            <div className="pdf-doc-header">
              <div className="pdf-doc-company">
                <div className="pdf-doc-logo">SAMILA 3PL</div>
                <div className="pdf-doc-addr">123 Logistics Park, Bangkok 10400<br />Tel: 02-123-4567 | Tax ID: 0107559000123</div>
              </div>
              <div className="pdf-doc-title-block">
                <div className="pdf-doc-rpt-title">{catInfo?.icon} {catInfo?.label || report.name}</div>
                <div className="pdf-doc-rpt-date">วันที่สร้าง: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div className="pdf-doc-rpt-date">Doc No.: RPT-{Date.now().toString().slice(-6)}</div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="pdf-info-grid">
              <div className="pdf-info-cell">
                <div className="pdf-info-label">ลูกค้า</div>
                <div className="pdf-info-val">{cust?.name}</div>
              </div>
              <div className="pdf-info-cell">
                <div className="pdf-info-label">รหัสลูกค้า</div>
                <div className="pdf-info-val">{cust?.code}</div>
              </div>
              <div className="pdf-info-cell">
                <div className="pdf-info-label">ผู้ติดต่อ</div>
                <div className="pdf-info-val">{cust?.contact}</div>
              </div>
              <div className="pdf-info-cell">
                <div className="pdf-info-label">ช่วงวันที่</div>
                <div className="pdf-info-val">{dateFrom} – {dateTo}</div>
              </div>
            </div>

            {/* Data Table */}
            <table className="pdf-table">
              <thead>
                <tr>
                  <th className="pdf-th-num">#</th>
                  {tableData.cols.map((col, i) => <th key={i}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 1 ? 'pdf-tr-alt' : ''}>
                    <td className="pdf-td-num">{ri + 1}</td>
                    {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>

            {tableData.footer && (
              <div className="pdf-total-row">{tableData.footer}</div>
            )}

            {/* Summary stats */}
            <div className="pdf-summary-row">
              <div className="pdf-summary-cell">
                <div className="pdf-summary-label">จำนวนแถว</div>
                <div className="pdf-summary-val">{tableData.rows.length} รายการ</div>
              </div>
              <div className="pdf-summary-cell">
                <div className="pdf-summary-label">สร้างโดย</div>
                <div className="pdf-summary-val">BB Innovation Auto</div>
              </div>
              <div className="pdf-summary-cell">
                <div className="pdf-summary-label">วันที่พิมพ์</div>
                <div className="pdf-summary-val">{new Date().toLocaleString('th-TH')}</div>
              </div>
            </div>

            {/* Signature */}
            <div className="pdf-sign-area">
              <div className="pdf-sign-box">
                <div className="pdf-sign-line"></div>
                <div className="pdf-sign-label">ผู้จัดทำ</div>
                <div className="pdf-sign-date">วันที่ ___________</div>
              </div>
              <div className="pdf-sign-box">
                <div className="pdf-sign-line"></div>
                <div className="pdf-sign-label">ผู้ตรวจสอบ</div>
                <div className="pdf-sign-date">วันที่ ___________</div>
              </div>
              <div className="pdf-sign-box">
                <div className="pdf-sign-line"></div>
                <div className="pdf-sign-label">ผู้อนุมัติ</div>
                <div className="pdf-sign-date">วันที่ ___________</div>
              </div>
            </div>

            <div className="pdf-footer-note">
              รายงานนี้สร้างโดยระบบ BB Innovation อัตโนมัติ — ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Customer Search Combobox ── */
function CustomerCombobox({ value, onChange }) {
  const [inputVal, setInputVal]   = useState('');
  const [open, setOpen]           = useState(false);
  const [focused, setFocused]     = useState(false);
  const wrapRef                   = useRef();

  const selected = customers.find(c => c.key === value);

  // close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setFocused(false);
        // restore display value if nothing selected
        if (!value) setInputVal('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [value]);

  const filtered = inputVal.trim() === ''
    ? customers
    : customers.filter(c =>
        c.name.toLowerCase().includes(inputVal.toLowerCase()) ||
        c.code.toLowerCase().includes(inputVal.toLowerCase())
      );

  const handleSelect = (c) => {
    onChange(c.key);
    setInputVal('');
    setOpen(false);
    setFocused(false);
  };

  const handleInputChange = (e) => {
    setInputVal(e.target.value);
    onChange('');        // clear selection when typing
    setOpen(true);
  };

  const handleFocus = () => {
    setFocused(true);
    setOpen(true);
  };

  const handleClear = () => {
    onChange('');
    setInputVal('');
    setOpen(false);
  };

  const displayValue = focused ? inputVal : (selected ? `${selected.name}  [${selected.code}]` : inputVal);

  return (
    <div className="cbox-wrap" ref={wrapRef}>
      <div className={`cbox-input-row ${open ? 'open' : ''} ${selected && !focused ? 'has-value' : ''}`}>
        <span className="cbox-icon">🔍</span>
        <input
          className="cbox-input"
          type="text"
          placeholder="พิมพ์ชื่อลูกค้า หรือ รหัสลูกค้า..."
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          autoComplete="off"
        />
        {(selected || inputVal) && (
          <button className="cbox-clear" onClick={handleClear} type="button">✕</button>
        )}
        <span className="cbox-arrow">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="cbox-dropdown">
          {filtered.length === 0 ? (
            <div className="cbox-empty">ไม่พบลูกค้า "{inputVal}"</div>
          ) : (
            filtered.map(c => (
              <div
                key={c.key}
                className={`cbox-option ${value === c.key ? 'active' : ''}`}
                onMouseDown={() => handleSelect(c)}
              >
                <span className="cbox-opt-avatar">{c.name[0]}</span>
                <div className="cbox-opt-body">
                  <div className="cbox-opt-name">{c.name}</div>
                  <div className="cbox-opt-meta">{c.code} &nbsp;·&nbsp; {c.contact} &nbsp;·&nbsp; {c.phone}</div>
                </div>
                {value === c.key && <span className="cbox-check">✓</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
function ReportsModule() {
  const { t } = useTranslation();
  const [customer, setCustomer]           = useState('');
  const [selectedType, setSelectedType]   = useState(null);
  const [generating, setGenerating]       = useState(false);
  const [pdfReport, setPdfReport]         = useState(null);
  const [dateFrom, setDateFrom]           = useState('2026-03-01');
  const [dateTo, setDateTo]               = useState('2026-03-31');
  const [nmFilter, setNmFilter]           = useState('all');   // non-movement customer filter
  const [nmMinMonths, setNmMinMonths]     = useState(6);       // minimum idle months
  const [nmUnitFilter, setNmUnitFilter]   = useState('');      // unit filter
  const [exFilter, setExFilter]           = useState('all');   // expiry customer filter
  const [exStatusFilter, setExStatusFilter] = useState('all'); // expiry status filter
  const [zoneFilter, setZoneFilter]       = useState('');      // zone filter

  const canSelectType  = !!customer;
  const canGenerate    = !!customer && !!selectedType;

  const handleGenerate = () => {
    if (!canGenerate) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      const cat = reportCategories.find(r => r.key === selectedType);
      const cust = customers.find(c => c.key === customer);
      setPdfReport({
        type: selectedType,
        name: `${cat?.label} – ${cust?.name}`,
      });
    }, 1200);
  };

  const handleReset = () => {
    setSelectedType(null);
    setPdfReport(null);
    setGenerating(false);
  };

  return (
    <div className="wms-module reports-module">

      {/* Header */}
      <div className="module-header">
        <div className="header-left">
          <h1>📈 {t('reports.title')}</h1>
          <p>{t('reports.subtitle')}</p>
        </div>
      </div>

      {/* ── KPI Summary ── */}
      <div className="report-kpi-row">
        {[
          { label: 'รายได้เดือนนี้',      value: '฿263,000', change: '+15.8%', up: true,  icon: '💰' },
          { label: 'รายการ Inbound',      value: '1,740',    change: '+14.5%', up: true,  icon: '📥' },
          { label: 'รายการ Outbound',     value: '1,620',    change: '+17.4%', up: true,  icon: '📤' },
          { label: 'Complaint Rate',      value: '11.07%',   change: '-22.1%', up: true,  icon: '⚠️' },
          { label: 'Delivery Reliability', value: '86.65%',  change: '+7.2%',  up: true,  icon: '🚚' },
          { label: 'รายงานที่สร้างแล้ว',  value: '48',       change: 'เดือนนี้', up: null, icon: '📄' },
        ].map((k, i) => (
          <div key={i} className="rpt-kpi-card">
            <div className="rpt-kpi-icon">{k.icon}</div>
            <div className="rpt-kpi-body">
              <div className="rpt-kpi-label">{k.label}</div>
              <div className="rpt-kpi-value">{k.value}</div>
              <div className={`rpt-kpi-change ${k.up === true ? 'up' : k.up === false ? 'down' : 'neutral'}`}>{k.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row (compact, 3 side-by-side) ── */}
      <div className="reports-charts-row">

        <div className="rpt-chart-card">
          <div className="rpt-card-title">Revenue vs Cost <span className="rpt-card-sub">฿ / 6 เดือน</span></div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={9}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#8eafc0', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fill: '#8eafc0', fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ background: '#0a2030', border: '1px solid rgba(0,188,212,0.3)', borderRadius: 6, fontSize: 11 }} formatter={v => `฿${v.toLocaleString()}`} labelStyle={{ color: '#a0c8dc' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#00A8CC" radius={[2,2,0,0]} />
              <Bar dataKey="cost"    name="Cost"    fill="rgba(255,107,107,0.5)" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rpt-chart-card">
          <div className="rpt-card-title">In / Out Throughput <span className="rpt-card-sub">6 เดือน</span></div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={throughputData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#8eafc0', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8eafc0', fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ background: '#0a2030', border: '1px solid rgba(0,188,212,0.3)', borderRadius: 6, fontSize: 11 }} labelStyle={{ color: '#a0c8dc' }} />
              <Line type="monotone" dataKey="inbound"  stroke="#00E5FF" strokeWidth={1.5} dot={false} name="Inbound" />
              <Line type="monotone" dataKey="outbound" stroke="#00CC88" strokeWidth={1.5} dot={false} name="Outbound" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rpt-chart-card">
          <div className="rpt-card-title">Revenue by Customer <span className="rpt-card-sub">มี.ค. 2026</span></div>
          <div className="customer-rev-list">
            {customerRevenue.map(c => {
              const pct = Math.round((c.value / customerRevenue[0].value) * 100);
              return (
                <div key={c.name} className="crev-row">
                  <div className="crev-row-top">
                    <span className="crev-name">
                      <span className="crev-dot" style={{ background: c.color }}></span>
                      {c.name}
                    </span>
                    <span className="crev-value">฿{(c.value/1000).toFixed(0)}k</span>
                  </div>
                  <div className="crev-bar-wrap">
                    <div className="crev-bar-bg">
                      <div className="crev-bar-fill" style={{ width: `${pct}%`, background: c.color }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Bottom: Generator + Recent ── */}
      <div className="reports-bottom-grid">

        {/* Report Generator */}
        <div className="rpt-generator-card">
          <div className="rpt-card-title">👥 Report by Customer</div>

          {!generating && !pdfReport && (<>

            {/* STEP 1: Customer */}
            <div className="gen-step">
              <div className="gen-step-label">
                <span className="gen-step-num">1</span> {t('reports.selectCustomer')} <span className="gen-step-required">*</span>
              </div>
              <CustomerCombobox
                value={customer}
                onChange={(key) => { setCustomer(key); if (!key) setSelectedType(null); }}
              />
              {customer && (() => {
                const c = customers.find(x => x.key === customer);
                return (
                  <div className="cbox-selected-info">
                    <span className="csi-avatar">{c.name[0]}</span>
                    <span className="csi-name">{c.name}</span>
                    <span className="csi-sep">·</span>
                    <span className="csi-code">{c.code}</span>
                    <span className="csi-sep">·</span>
                    <span className="csi-contact">{c.contact}</span>
                  </div>
                );
              })()}
            </div>

            {/* STEP 2: Report Type */}
            <div className={`gen-step ${!canSelectType ? 'gen-step-disabled' : ''}`}>
              <div className="gen-step-label">
                <span className="gen-step-num">2</span> {t('reports.selectReport')}
                {!canSelectType && <span className="gen-step-hint"> ← เลือกลูกค้าก่อน</span>}
              </div>
              <div className="rpt-cat-grid">
                {reportCategories.map(r => (
                  <div
                    key={r.key}
                    className={`rpt-cat-item ${selectedType === r.key ? 'selected' : ''} ${!canSelectType ? 'rpt-cat-locked' : ''}`}
                    onClick={() => canSelectType && setSelectedType(r.key)}
                    style={selectedType === r.key ? { borderColor: r.color, background: `${r.color}15` } : {}}
                  >
                    <span className="rpt-cat-icon">{r.icon}</span>
                    <span className="rpt-cat-label">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 3: Date range + Zone */}
            <div className={`gen-step ${!canSelectType ? 'gen-step-disabled' : ''}`}>
              <div className="gen-step-label"><span className="gen-step-num">3</span> ช่วงวันที่ &amp; Zone</div>
              <div className="rpt-filters" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 8 }}>
                <div className="rpt-filter-group">
                  <label>{t('reports.dateFrom')}</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} disabled={!canSelectType} />
                </div>
                <div className="rpt-filter-group">
                  <label>{t('reports.dateTo')}</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} disabled={!canSelectType} />
                </div>
              </div>
              <div className="rpt-filter-group">
                <label>🗺️ Zone (ไม่บังคับ)</label>
                <select
                  value={zoneFilter}
                  onChange={e => setZoneFilter(e.target.value)}
                  disabled={!canSelectType}
                  style={{ padding:'8px 10px', background:'rgba(0,20,40,0.8)', border:'1px solid rgba(0,229,255,0.3)', borderRadius:6, color: zoneFilter ? '#00E5FF' : '#5a8fa8', fontSize:12, fontWeight:600, width:'100%' }}
                >
                  <option value="">ทุก Zone</option>
                  {ZONES.map(z => <option key={z.id} value={z.id}>{z.label} — {z.description}</option>)}
                </select>
              </div>
            </div>

            <button
              className={`generate-btn ${!canGenerate ? 'disabled' : ''}`}
              onClick={handleGenerate}
              disabled={!canGenerate}
              style={{ marginTop: '14px' }}
            >
              {!customer ? `← ${t('reports.selectCustomer')}` : !selectedType ? `← ${t('reports.selectReport')}` : `📄 ${t('reports.preview')}`}
            </button>
          </>)}

          {generating && (
            <div className="rpt-generating">
              <div className="rpt-spinner"></div>
              <div className="rpt-gen-text">กำลังประมวลผล...</div>
              <div className="rpt-gen-sub">กรุณารอสักครู่</div>
            </div>
          )}

          {pdfReport && !generating && (
            <div className="rpt-done">
              <div className="rpt-done-icon">✓</div>
              <div className="rpt-done-title">PDF พร้อมแสดงผล!</div>
              <div className="rpt-done-card">
                <div className="rpt-done-name">{pdfReport.name}</div>
                <div className="rpt-done-meta">
                  <span>📅 {dateFrom} – {dateTo}</span>
                  <span className="fmt-badge">PDF</span>
                </div>
              </div>
              <div className="rpt-done-actions">
                <button className="dl-btn" onClick={() => setPdfReport({ ...pdfReport, show: true })}>
                  👁️ ดู PDF Preview
                </button>
                <button className="again-btn" onClick={handleReset}>🔄 สร้างใหม่</button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="rpt-recent-card">
          <div className="rpt-card-title">🕐 {t('reports.recent')}</div>
          <div className="recent-list">
            {recentReports.map(r => (
              <div key={r.id} className="recent-row">
                <div className="recent-icon" style={{ color: typeColor[r.type] || '#7aafc8' }}>
                  {r.type === 'inventory' ? '📦' : r.type === 'billing' ? '💰' : r.type === 'kpi' ? '📊' : r.type === 'receiving' ? '📥' : r.type === 'shipping' ? '🚚' : r.type === 'nonmovement' ? '🔴' : '📄'}
                </div>
                <div className="recent-body">
                  <div className="recent-name">{r.name}</div>
                  <div className="recent-meta">{r.date} · {r.size}</div>
                </div>
                <div className="recent-actions">
                  <span className="fmt-tag pdf">PDF</span>
                  <button className="dl-mini" title="ดู PDF">👁</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Expiry Report ── */}
      <div className="nm-report-card" style={{ borderColor: 'rgba(255,215,0,0.25)', marginBottom: 20 }}>
        <div className="nm-report-header">
          <div className="nm-report-title-row">
            <span className="nm-report-icon">⏰</span>
            <div>
              <div className="nm-report-title">Expiry Report</div>
              <div className="nm-report-sub">สินค้าใกล้หมดอายุและหมดอายุแล้ว — EXPIRED / CRITICAL (&lt;30 วัน) / WARNING (&lt;60 วัน) / CAUTION (&lt;90 วัน)</div>
            </div>
          </div>
          <div className="nm-report-controls">
            <div className="nm-ctrl-group">
              <label>ลูกค้า</label>
              <select value={exFilter} onChange={e => setExFilter(e.target.value)}>
                <option value="all">ทั้งหมด</option>
                {customers.map(c => <option key={c.key} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="nm-ctrl-group">
              <label>สถานะ</label>
              <select value={exStatusFilter} onChange={e => setExStatusFilter(e.target.value)}>
                <option value="all">ทั้งหมด</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="CRITICAL">CRITICAL (&lt;30 วัน)</option>
                <option value="WARNING">WARNING (&lt;60 วัน)</option>
                <option value="CAUTION">CAUTION (&lt;90 วัน)</option>
              </select>
            </div>
            <button className="nm-print-btn" style={{ background: 'rgba(255,215,0,0.15)', borderColor: 'rgba(255,215,0,0.4)', color: '#FFD700' }} onClick={() => {
              const filtered = allExpiryItems.filter(i => (exFilter === 'all' || i.customer === exFilter) && (exStatusFilter === 'all' || i.status === exStatusFilter));
              const w = window.open('', '_blank');
              w.document.write(`<html><head><title>Expiry Report</title>
              <style>
                body{font-family:Arial,sans-serif;margin:0;padding:24px;font-size:12px;color:#222;}
                h2{color:#b8860b;margin-bottom:4px;}
                .sub{color:#666;font-size:11px;margin-bottom:16px;}
                table{width:100%;border-collapse:collapse;margin-bottom:12px;}
                th{background:#b8860b;color:white;padding:8px 10px;text-align:left;font-size:11px;}
                td{padding:7px 10px;border-bottom:1px solid #eee;font-size:11px;}
                tr:nth-child(even) td{background:#fafafa;}
                .expired{color:#c00;font-weight:700;}
                .critical{color:#e65100;font-weight:700;}
                .warning{color:#f57f17;font-weight:600;}
                .caution{color:#827717;}
                .footer{font-size:10px;color:#888;border-top:1px solid #ddd;padding-top:8px;margin-top:8px;}
              </style></head><body>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #b8860b;padding-bottom:10px;margin-bottom:16px;">
                <div><div style="font-size:20px;font-weight:800;color:#b8860b;">SAMILA 3PL</div>
                <div style="font-size:10px;color:#888;">SAMILA 3PL Co., Ltd. | Tel: 02-123-4567</div></div>
                <div style="text-align:right;"><h2 style="margin:0;">⏰ Expiry Report</h2>
                <div style="font-size:11px;color:#666;">วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}</div></div>
              </div>
              <table><thead><tr><th>#</th><th>SKU</th><th>ชื่อสินค้า</th><th>ลูกค้า</th><th>คลัง</th><th>Location</th><th>Qty</th><th>BAT No.</th><th>Lot No.</th><th>MFG Date</th><th>Expiry Date</th><th>คงเหลือ (วัน)</th><th>สถานะ</th></tr></thead>
              <tbody>${filtered.map((i,idx) => `<tr><td>${idx+1}</td><td>${i.sku}</td><td>${i.name}</td><td>${i.customer}</td><td>${i.warehouse}</td><td>${i.location}</td><td>${i.qty} ${i.mainUnit}</td><td>${i.batNumber}</td><td>${i.lotNumber}</td><td>${i.mfgDate}</td><td>${i.expiryDate}</td><td class="${i.status.toLowerCase()}">${i.daysLeft < 0 ? 'หมดอายุแล้ว' : i.daysLeft + ' วัน'}</td><td class="${i.status.toLowerCase()}">${i.status}</td></tr>`).join('')}
              </tbody></table>
              <div class="footer">รวม ${filtered.length} รายการ | สร้างโดยระบบ BB Innovation | ${new Date().toLocaleString('th-TH')}</div>
              </body></html>`);
              w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
            }}>🖨️ พิมพ์ PDF</button>
          </div>
        </div>

        {(() => {
          const filtered = allExpiryItems.filter(i =>
            (exFilter === 'all' || i.customer === exFilter) &&
            (exStatusFilter === 'all' || i.status === exStatusFilter)
          );
          const expiredCount  = filtered.filter(i => i.status === 'EXPIRED').length;
          const criticalCount = filtered.filter(i => i.status === 'CRITICAL').length;
          const warningCount  = filtered.filter(i => i.status === 'WARNING').length;
          const cautionCount  = filtered.filter(i => i.status === 'CAUTION').length;
          const statusStyle = { EXPIRED: { color: '#FF4444', bg: 'rgba(255,68,68,0.15)' }, CRITICAL: { color: '#FF8C42', bg: 'rgba(255,140,66,0.15)' }, WARNING: { color: '#FFD700', bg: 'rgba(255,215,0,0.15)' }, CAUTION: { color: '#00CC88', bg: 'rgba(0,204,136,0.15)' } };
          return (
            <>
              <div className="nm-summary-row">
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#FF4444' }}>{expiredCount}</span><span className="nm-stat-lbl">EXPIRED</span></div>
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#FF8C42' }}>{criticalCount}</span><span className="nm-stat-lbl">CRITICAL (&lt;30 วัน)</span></div>
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#FFD700' }}>{warningCount}</span><span className="nm-stat-lbl">WARNING (&lt;60 วัน)</span></div>
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#00CC88' }}>{cautionCount}</span><span className="nm-stat-lbl">CAUTION (&lt;90 วัน)</span></div>
              </div>
              <div className="nm-table-wrap">
                <table className="nm-table">
                  <thead>
                    <tr>
                      <th>#</th><th>SKU</th><th>ชื่อสินค้า</th><th>ลูกค้า</th>
                      <th>คลัง / Location</th><th>Qty</th><th>BAT No.</th><th>Lot No.</th>
                      <th>MFG Date</th><th>Expiry Date</th><th>คงเหลือ (วัน)</th><th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, i) => {
                      const s = statusStyle[item.status] || {};
                      return (
                        <tr key={item.sku} className={i % 2 === 1 ? 'nm-tr-alt' : ''}>
                          <td className="nm-td-num">{i + 1}</td>
                          <td><span className="nm-sku">{item.sku}</span></td>
                          <td className="nm-td-name">{item.name}</td>
                          <td className="nm-td-cust">{item.customer}</td>
                          <td><span className="nm-wh">{item.warehouse}</span> <span className="nm-loc">{item.location}</span></td>
                          <td>{item.qty} <span className="nm-unit">{item.mainUnit}</span></td>
                          <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#00E5FF' }}>{item.batNumber}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#00CC88' }}>{item.lotNumber}</td>
                          <td className="nm-td-date">{item.mfgDate}</td>
                          <td className="nm-td-date" style={{ color: '#FFD700' }}>{item.expiryDate}</td>
                          <td>
                            <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                              {item.daysLeft < 0 ? 'หมดอายุแล้ว' : `${item.daysLeft} วัน`}
                            </span>
                          </td>
                          <td>
                            <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr><td colSpan={12} className="nm-empty">✅ ไม่พบสินค้าในเงื่อนไขที่เลือก</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}
      </div>

      {/* ── Non Movement Report ── */}
      <div className="nm-report-card">
        <div className="nm-report-header">
          <div className="nm-report-title-row">
            <span className="nm-report-icon">🔴</span>
            <div>
              <div className="nm-report-title">Non Movement Report</div>
              <div className="nm-report-sub">สินค้าที่ไม่มีการเคลื่อนไหว (ตั้งแต่วันรับสินค้าเข้า)</div>
            </div>
          </div>
          <div className="nm-report-controls">
            <div className="nm-ctrl-group">
              <label>ลูกค้า</label>
              <select value={nmFilter} onChange={e => setNmFilter(e.target.value)}>
                <option value="all">ทั้งหมด</option>
                {customers.map(c => <option key={c.key} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="nm-ctrl-group">
              <label>ขั้นต่ำ (เดือน)</label>
              <select value={nmMinMonths} onChange={e => setNmMinMonths(+e.target.value)}>
                <option value={6}>6 เดือนขึ้นไป</option>
                <option value={9}>9 เดือนขึ้นไป</option>
                <option value={12}>12 เดือนขึ้นไป</option>
              </select>
            </div>
            <div className="nm-ctrl-group">
              <label>หน่วยนับ (Unit)</label>
              <select value={nmUnitFilter} onChange={e => setNmUnitFilter(e.target.value)}>
                <option value="">ทุกหน่วย</option>
                {UNIT_GROUPS.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <button className="nm-print-btn" onClick={() => {
              const filtered = allNonMovementItems.filter(i => (nmFilter === 'all' || i.customer === nmFilter) && i.ageMonths >= nmMinMonths && (!nmUnitFilter || i.unit === nmUnitFilter));
              const w = window.open('', '_blank');
              w.document.write(`<html><head><title>Non Movement Report</title>
              <style>
                body{font-family:Arial,sans-serif;margin:0;padding:24px;font-size:12px;color:#222;}
                h2{color:#c00;margin-bottom:4px;}
                .sub{color:#666;font-size:11px;margin-bottom:16px;}
                table{width:100%;border-collapse:collapse;margin-bottom:12px;}
                th{background:#c00;color:white;padding:8px 10px;text-align:left;font-size:11px;}
                td{padding:7px 10px;border-bottom:1px solid #eee;font-size:11px;}
                tr:nth-child(even) td{background:#fafafa;}
                .age-high{color:#c00;font-weight:700;}
                .footer{font-size:10px;color:#888;border-top:1px solid #ddd;padding-top:8px;margin-top:8px;}
              </style></head><body>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #c00;padding-bottom:10px;margin-bottom:16px;">
                <div><div style="font-size:20px;font-weight:800;color:#c00;">SAMILA 3PL</div>
                <div style="font-size:10px;color:#888;">SAMILA 3PL Co., Ltd. | Tel: 02-123-4567</div></div>
                <div style="text-align:right;"><h2 style="margin:0;">🔴 Non Movement Report</h2>
                <div style="font-size:11px;color:#666;">สินค้าค้างสต็อก ≥ ${nmMinMonths} เดือน | วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}</div></div>
              </div>
              <table><thead><tr><th>#</th><th>SKU</th><th>ชื่อสินค้า</th><th>ลูกค้า</th><th>คลัง</th><th>Location</th><th>จำนวน</th><th>วันที่รับเข้า</th><th>อายุ (เดือน)</th><th>มูลค่า</th></tr></thead>
              <tbody>${filtered.map((i,idx) => `<tr><td>${idx+1}</td><td>${i.sku}</td><td>${i.name}</td><td>${i.customer}</td><td>${i.warehouse}</td><td>${i.location}</td><td>${i.qty} ${i.unit}</td><td>${i.receivedDate}</td><td class="age-high">${i.ageMonths} เดือน</td><td>${i.value}</td></tr>`).join('')}
              </tbody></table>
              <div class="footer">รวม ${filtered.length} รายการ | สร้างโดยระบบ BB Innovation | ${new Date().toLocaleString('th-TH')}</div>
              </body></html>`);
              w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
            }}>🖨️ พิมพ์ PDF</button>
          </div>
        </div>

        {(() => {
          const filtered = allNonMovementItems.filter(i => (nmFilter === 'all' || i.customer === nmFilter) && i.ageMonths >= nmMinMonths && (!nmUnitFilter || i.unit === nmUnitFilter));
          const totalValue = filtered.reduce((s, i) => s + parseFloat(i.value.replace(/[฿,]/g,'')), 0);
          return (
            <>
              <div className="nm-summary-row">
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#FF4444' }}>{filtered.length}</span><span className="nm-stat-lbl">รายการค้างสต็อก</span></div>
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#FFD700' }}>{nmMinMonths}+</span><span className="nm-stat-lbl">เดือน (ขั้นต่ำ)</span></div>
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#FF8C42' }}>฿{totalValue.toLocaleString()}</span><span className="nm-stat-lbl">มูลค่ารวม</span></div>
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#9B7FFF' }}>{[...new Set(filtered.map(i => i.warehouse))].length}</span><span className="nm-stat-lbl">คลังสินค้า</span></div>
              </div>

              <div className="nm-table-wrap">
                <table className="nm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>SKU</th>
                      <th>ชื่อสินค้า</th>
                      <th>ลูกค้า</th>
                      <th>คลัง / Location</th>
                      <th>จำนวน</th>
                      <th>วันที่รับเข้า</th>
                      <th>อายุ (เดือน)</th>
                      <th>มูลค่า</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, i) => (
                      <tr key={item.sku} className={i % 2 === 1 ? 'nm-tr-alt' : ''}>
                        <td className="nm-td-num">{i + 1}</td>
                        <td><span className="nm-sku">{item.sku}</span></td>
                        <td className="nm-td-name">{item.name}</td>
                        <td className="nm-td-cust">{item.customer}</td>
                        <td><span className="nm-wh">{item.warehouse}</span> <span className="nm-loc">{item.location}</span></td>
                        <td>{item.qty} <span className="nm-unit">{item.unit}</span></td>
                        <td className="nm-td-date">{item.receivedDate}</td>
                        <td>
                          <span className={`nm-age-badge ${item.ageMonths >= 12 ? 'age-critical' : item.ageMonths >= 9 ? 'age-high' : 'age-medium'}`}>
                            {item.ageMonths} เดือน
                          </span>
                        </td>
                        <td className="nm-td-value">{item.value}</td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={9} className="nm-empty">✅ ไม่พบสินค้าค้างสต็อกในเงื่อนไขที่เลือก</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}
      </div>

      {/* PDF Preview Modal */}
      {pdfReport?.show && (
        <PdfPreviewModal
          report={pdfReport}
          customer={customer}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onClose={() => setPdfReport(p => ({ ...p, show: false }))}
        />
      )}
    </div>
  );
}

export default ReportsModule;
