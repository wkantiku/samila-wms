/* ── Static demo data & PDF row builder — extracted to reduce main file size ── */

export const revenueData = [
  { month: 'Oct', revenue: 182000, cost: 98000 },
  { month: 'Nov', revenue: 210000, cost: 112000 },
  { month: 'Dec', revenue: 245000, cost: 130000 },
  { month: 'Jan', revenue: 198000, cost: 105000 },
  { month: 'Feb', revenue: 227000, cost: 118000 },
  { month: 'Mar', revenue: 263000, cost: 138000 },
];

export const throughputData = [
  { month: 'Oct', inbound: 1200, outbound: 1080 },
  { month: 'Nov', inbound: 1450, outbound: 1320 },
  { month: 'Dec', inbound: 1680, outbound: 1540 },
  { month: 'Jan', inbound: 1310, outbound: 1200 },
  { month: 'Feb', inbound: 1520, outbound: 1380 },
  { month: 'Mar', inbound: 1740, outbound: 1620 },
];

export const customerRevenue = [
  { name: 'Nayong Hospital', value: 86000, color: '#00E5FF' },
  { name: 'ThaiBev Co.',     value: 72000, color: '#00CC88' },
  { name: 'SCG Logistics',   value: 54000, color: '#FFD700' },
  { name: 'Lotus Express',   value: 31000, color: '#FF8C42' },
  { name: 'CPF Thailand',    value: 14000, color: '#9B7FFF' },
  { name: 'AIS Warehouse',   value: 6000,  color: '#FF6B6B' },
];

export const customers = [
  { key: 'nayong',  name: 'Nayong Hospital', code: 'NH-001', contact: 'คุณสมชาย',  phone: '074-611-001' },
  { key: 'thaibev', name: 'ThaiBev Co.',      code: 'TB-002', contact: 'คุณวิชัย',  phone: '02-785-5555' },
  { key: 'scg',     name: 'SCG Logistics',    code: 'SG-003', contact: 'คุณสุภาพร', phone: '02-586-2000' },
  { key: 'lotus',   name: 'Lotus Express',    code: 'LE-004', contact: 'คุณนภา',   phone: '02-833-5000' },
  { key: 'cpf',     name: 'CPF Thailand',     code: 'CP-005', contact: 'คุณธนา',   phone: '02-767-8000' },
  { key: 'ais',     name: 'AIS Warehouse',    code: 'AW-006', contact: 'คุณปรีชา', phone: '02-029-5000' },
];

export const reportCategories = [
  { key: 'inventory',   icon: '📦', label: 'Inventory Report',      color: '#00E5FF' },
  { key: 'receiving',   icon: '📥', label: 'Receiving Report',       color: '#00CC88' },
  { key: 'shipping',    icon: '🚚', label: 'Shipping Report',        color: '#FFD700' },
  { key: 'billing',     icon: '💰', label: 'Billing / Tarif Report', color: '#FF8C42' },
  { key: 'capacity',    icon: '🏭', label: 'Capacity Report',        color: '#9B7FFF' },
  { key: 'kpi',         icon: '📊', label: 'KPI / Performance',      color: '#FF6B6B' },
  { key: 'product',     icon: '🏷️', label: 'Product Report',         color: '#00BCD4' },
  { key: 'customer',    icon: '👥', label: 'Customer Summary',       color: '#4CAF50' },
  { key: 'nonmovement', icon: '🔴', label: 'Non Movement Report',    color: '#FF4444' },
  { key: 'expiry',      icon: '⏰', label: 'Expiry Report',          color: '#FFD700' },
];

export const recentReports = [
  { id: 1, name: 'Monthly Inventory – Nayong Hospital',  type: 'inventory',   date: '2026-03-11', size: '245 KB', format: 'pdf' },
  { id: 2, name: 'Billing Report – ThaiBev Co.',         type: 'billing',     date: '2026-03-10', size: '128 KB', format: 'pdf' },
  { id: 3, name: 'Non Movement Report – All Customers',  type: 'nonmovement', date: '2026-03-10', size: '98 KB',  format: 'pdf' },
  { id: 4, name: 'Delivery Performance – SCG Logistics', type: 'kpi',         date: '2026-03-09', size: '89 KB',  format: 'pdf' },
  { id: 5, name: 'Stock Movement – Lotus Express',       type: 'inventory',   date: '2026-03-05', size: '312 KB', format: 'pdf' },
  { id: 6, name: 'Inbound/Outbound – CPF Thailand',      type: 'receiving',   date: '2026-03-04', size: '156 KB', format: 'pdf' },
  { id: 7, name: 'KPI Summary – AIS Warehouse',          type: 'kpi',         date: '2026-03-01', size: '74 KB',  format: 'pdf' },
  { id: 8, name: 'Expiry Report – All Customers',        type: 'expiry',      date: '2026-03-12', size: '112 KB', format: 'pdf' },
];

export const typeColor = {
  inventory: '#00E5FF', billing: '#FF8C42', kpi: '#FF6B6B',
  receiving: '#00CC88', shipping: '#FFD700', capacity: '#9B7FFF',
  nonmovement: '#FF4444', expiry: '#FFD700',
};

/* ── Demo expiry data (fallback when live inventory has none) ── */
export const demoExpiryItems = [
  { sku: 'SKU-EX001', name: 'Product Alpha-1',   customer: 'Nayong Hospital', warehouse: 'WH-BKK', location: 'A-01-2', qty: 50,  mainUnit: 'PCS', batNumber: 'BAT-A01', lotNumber: 'LOT-A01', mfgDate: '2024-03-01', expiryDate: '2026-02-28', daysLeft: -12, status: 'EXPIRED'  },
  { sku: 'SKU-EX002', name: 'Product Beta-3',    customer: 'ThaiBev Co.',     warehouse: 'WH-NTB', location: 'B-04-1', qty: 30,  mainUnit: 'BOX', batNumber: 'BAT-B03', lotNumber: 'LOT-B03', mfgDate: '2024-04-01', expiryDate: '2026-03-20', daysLeft: 8,   status: 'CRITICAL' },
  { sku: 'SKU-EX003', name: 'Product Gamma-2',   customer: 'SCG Logistics',   warehouse: 'WH-BKK', location: 'C-02-3', qty: 120, mainUnit: 'KG',  batNumber: 'BAT-C02', lotNumber: 'LOT-C02', mfgDate: '2025-01-15', expiryDate: '2026-03-30', daysLeft: 18,  status: 'CRITICAL' },
  { sku: 'SKU-EX004', name: 'Product Delta-5',   customer: 'Lotus Express',   warehouse: 'WH-PTN', location: 'D-03-1', qty: 75,  mainUnit: 'BTL', batNumber: 'BAT-D05', lotNumber: 'LOT-D05', mfgDate: '2025-02-01', expiryDate: '2026-04-15', daysLeft: 34,  status: 'WARNING'  },
  { sku: 'SKU-EX005', name: 'Product Epsilon-1', customer: 'CPF Thailand',    warehouse: 'WH-NTB', location: 'A-06-2', qty: 200, mainUnit: 'PCS', batNumber: 'BAT-E01', lotNumber: 'LOT-E01', mfgDate: '2025-03-01', expiryDate: '2026-04-30', daysLeft: 49,  status: 'WARNING'  },
  { sku: 'SKU-EX006', name: 'Product Zeta-7',    customer: 'AIS Warehouse',   warehouse: 'WH-BKK', location: 'B-05-1', qty: 90,  mainUnit: 'BAG', batNumber: 'BAT-Z07', lotNumber: 'LOT-Z07', mfgDate: '2025-04-01', expiryDate: '2026-05-25', daysLeft: 74,  status: 'CAUTION'  },
  { sku: 'SKU-EX007', name: 'Product Eta-2',     customer: 'Nayong Hospital', warehouse: 'WH-CNX', location: 'E-02-3', qty: 45,  mainUnit: 'PCS', batNumber: 'BAT-H02', lotNumber: 'LOT-H02', mfgDate: '2024-06-01', expiryDate: '2026-03-25', daysLeft: 13,  status: 'CRITICAL' },
  { sku: 'SKU-EX008', name: 'Product Theta-4',   customer: 'ThaiBev Co.',     warehouse: 'WH-BKK', location: 'A-09-1', qty: 160, mainUnit: 'BTL', batNumber: 'BAT-T04', lotNumber: 'LOT-T04', mfgDate: '2025-05-01', expiryDate: '2026-06-10', daysLeft: 90,  status: 'CAUTION'  },
  { sku: 'SKU-EX009', name: 'Product Iota-3',    customer: 'SCG Logistics',   warehouse: 'WH-PTN', location: 'F-01-2', qty: 60,  mainUnit: 'PCS', batNumber: 'BAT-I03', lotNumber: 'LOT-I03', mfgDate: '2024-02-01', expiryDate: '2026-03-05', daysLeft: -7,  status: 'EXPIRED'  },
  { sku: 'SKU-EX010', name: 'Product Kappa-6',   customer: 'Lotus Express',   warehouse: 'WH-BKK', location: 'C-04-1', qty: 80,  mainUnit: 'BOX', batNumber: 'BAT-K06', lotNumber: 'LOT-K06', mfgDate: '2025-06-01', expiryDate: '2026-06-01', daysLeft: 81,  status: 'CAUTION'  },
];

export const NON_MOVE_THRESHOLD_MONTHS = 6;
export const allNonMovementItems = [
  { sku: 'SKU-NM001', name: 'Product Omega',  customer: 'Nayong Hospital', warehouse: 'WH-BKK', location: 'A-05-3', qty: 120, unit: 'กล่อง', receivedDate: '2025-07-15', ageMonths: 8,  value: '฿36,000'  },
  { sku: 'SKU-NM002', name: 'Product Sigma',  customer: 'ThaiBev Co.',     warehouse: 'WH-NTB', location: 'B-03-1', qty: 85,  unit: 'ลัง',   receivedDate: '2025-06-20', ageMonths: 9,  value: '฿42,500'  },
  { sku: 'SKU-NM003', name: 'Product Theta',  customer: 'SCG Logistics',   warehouse: 'WH-BKK', location: 'C-02-2', qty: 200, unit: 'ชิ้น',  receivedDate: '2025-05-10', ageMonths: 10, value: '฿20,000'  },
  { sku: 'SKU-NM004', name: 'Product Lambda', customer: 'Lotus Express',   warehouse: 'WH-PTN', location: 'D-01-1', qty: 60,  unit: 'กล่อง', receivedDate: '2025-08-01', ageMonths: 7,  value: '฿15,000'  },
  { sku: 'SKU-NM005', name: 'Product Kappa',  customer: 'CPF Thailand',    warehouse: 'WH-NTB', location: 'A-04-2', qty: 45,  unit: 'ลัง',   receivedDate: '2025-04-25', ageMonths: 11, value: '฿22,500'  },
  { sku: 'SKU-NM006', name: 'Product Zeta',   customer: 'AIS Warehouse',   warehouse: 'WH-BKK', location: 'B-06-3', qty: 300, unit: 'ชิ้น',  receivedDate: '2025-03-18', ageMonths: 12, value: '฿30,000'  },
  { sku: 'SKU-NM007', name: 'Product Eta',    customer: 'Nayong Hospital', warehouse: 'WH-BKK', location: 'A-07-1', qty: 75,  unit: 'กล่อง', receivedDate: '2025-08-30', ageMonths: 6,  value: '฿18,750'  },
  { sku: 'SKU-NM008', name: 'Product Mu',     customer: 'ThaiBev Co.',     warehouse: 'WH-CNX', location: 'E-01-1', qty: 150, unit: 'ลัง',   receivedDate: '2025-06-01', ageMonths: 9,  value: '฿75,000'  },
  { sku: 'SKU-NM009', name: 'Product Nu',     customer: 'SCG Logistics',   warehouse: 'WH-PTN', location: 'F-02-4', qty: 90,  unit: 'ชิ้น',  receivedDate: '2025-07-22', ageMonths: 8,  value: '฿9,000'   },
  { sku: 'SKU-NM010', name: 'Product Xi',     customer: 'Lotus Express',   warehouse: 'WH-BKK', location: 'C-03-2', qty: 40,  unit: 'กล่อง', receivedDate: '2025-05-05', ageMonths: 10, value: '฿12,000'  },
];

/* ── PDF row data generator ── */
export function buildReportRows(type, _customerKey) {
  if (type === 'inventory') return {
    cols: ['SKU', 'Product Name', 'คลัง', 'Location', 'Qty', 'Available', 'BAT No.', 'Lot No.', 'MFG Date', 'Expiry Date', 'สถานะ'],
    rows: [
      ['SKU001', 'Product Alpha',   'Warehouse A', 'A-01-1', 500, 400, 'BAT-001', 'LOT-001', '2025-01-15', '2027-01-15', 'GOOD'],
      ['SKU002', 'Product Beta',    'Warehouse A', 'A-02-1', 320, 280, 'BAT-002', 'LOT-002', '2025-02-01', '2027-02-01', 'GOOD'],
      ['SKU003', 'Product Gamma',   'Warehouse B', 'B-01-1', 150, 150, 'BAT-003', 'LOT-003', '2025-03-01', '2027-03-01', 'GOOD'],
      ['SKU004', 'Product Delta',   'Warehouse A', 'A-03-2',  80,  60, 'BAT-004', 'LOT-004', '2025-04-01', '2026-04-01', 'LOW'],
      ['SKU005', 'Product Epsilon', 'Warehouse B', 'B-02-1', 210, 200, 'BAT-005', 'LOT-005', '2025-05-01', '2027-05-01', 'GOOD'],
    ],
  };
  if (type === 'billing') return {
    cols: ['Invoice No.', 'รายการ', 'จำนวน', 'ราคา/หน่วย', 'รวม (฿)'],
    rows: [
      ['INV-2026-0311', 'ค่าบริการรับสินค้า (GR)',    450, '฿25.00',  '฿11,250'],
      ['INV-2026-0311', 'ค่าบริการจัดส่ง (Shipping)', 380, '฿35.00',  '฿13,300'],
      ['INV-2026-0311', 'ค่าพื้นที่คลัง (Storage)',    30, '฿850.00', '฿25,500'],
      ['INV-2026-0311', 'ค่า Value-Added Service',      12, '฿200.00',  '฿2,400'],
      ['INV-2026-0311', 'ค่าบริการ Labeling',          200, '฿8.00',   '฿1,600'],
    ],
    footer: 'ยอดรวม: ฿54,050  |  VAT 7%: ฿3,784  |  ยอดสุทธิ: ฿57,834',
  };
  if (type === 'shipping') return {
    cols: ['Shipment No.', 'วันที่จัดส่ง', 'ปลายทาง', 'น้ำหนัก (kg)', 'พาหนะ', 'สถานะ'],
    rows: [
      ['SH-2026-0891', '2026-03-11', 'กรุงเทพฯ',    125, 'รถกระบะ 4 ล้อ',   'ส่งแล้ว'],
      ['SH-2026-0887', '2026-03-10', 'นนทบุรี',      88, 'มอเตอร์ไซค์',     'ส่งแล้ว'],
      ['SH-2026-0882', '2026-03-09', 'สมุทรปราการ', 340, 'รถบรรทุก 6 ล้อ',  'ส่งแล้ว'],
      ['SH-2026-0878', '2026-03-08', 'ปทุมธานี',    210, 'รถกระบะ 4 ล้อ',   'ส่งแล้ว'],
      ['SH-2026-0872', '2026-03-07', 'อยุธยา',      560, 'รถบรรทุก 10 ล้อ', 'ส่งแล้ว'],
    ],
  };
  if (type === 'receiving') return {
    cols: ['GR No.', 'วันที่รับ', 'Supplier', 'Product', 'สั่ง', 'รับ', 'BAT No.', 'Lot No.', 'MFG', 'Expiry', 'หมายเหตุ'],
    rows: [
      ['GR-2026-0201', '2026-03-11', 'ABC Supply',  'SKU001', 500, 500, 'BAT-001', 'LOT-001', '2025-01-15', '2027-01-15', '-'],
      ['GR-2026-0198', '2026-03-10', 'XYZ Trading', 'SKU003', 200, 195, 'BAT-003', 'LOT-003', '2025-03-01', '2027-03-01', 'ชำรุด 5'],
      ['GR-2026-0195', '2026-03-09', 'ABC Supply',  'SKU002', 300, 300, 'BAT-002', 'LOT-002', '2025-02-01', '2027-02-01', '-'],
      ['GR-2026-0192', '2026-03-08', 'DEF Import',  'SKU004', 100,  80, 'BAT-004', 'LOT-004', '2025-04-01', '2026-04-01', 'รอตรวจ 20'],
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
      ['Throughput (Outbound)', '1500', '1620',   '✅ ผ่าน'],
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
    cols: ['SKU', 'Product', 'หมวดหมู่', 'BAT No.', 'Lot No.', 'MFG', 'Expiry', 'เคลื่อนไหว/เดือน', 'มูลค่า', 'ABC'],
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
    cols: ['SKU', 'ชื่อสินค้า', 'ลูกค้า', 'คลัง', 'Location', 'Qty', 'BAT No.', 'Lot No.', 'MFG', 'Expiry', 'คงเหลือ (วัน)', 'สถานะ'],
    rows: demoExpiryItems.map(i => [i.sku, i.name, i.customer, i.warehouse, i.location, `${i.qty} ${i.mainUnit}`, i.batNumber, i.lotNumber, i.mfgDate, i.expiryDate, i.daysLeft < 0 ? 'หมดอายุแล้ว' : `${i.daysLeft} วัน`, i.status]),
    footer: `รวม ${demoExpiryItems.length} รายการ | EXPIRED + CRITICAL + WARNING + CAUTION`,
  };
  return {
    cols: ['รายการ', 'มีนาคม 2026', 'กุมภาพันธ์ 2026', 'เปลี่ยนแปลง'],
    rows: [
      ['รายการ Inbound',    '450', '390', '+15.4%'],
      ['รายการ Outbound',   '380', '340', '+11.8%'],
      ['ยอดเรียกเก็บ (฿)', '57,834', '52,100', '+11.0%'],
      ['Complaint',             '2', '5',   '-60.0%'],
      ['On-time Delivery',  '96.8%', '94.2%', '+2.6%'],
    ],
  };
}
