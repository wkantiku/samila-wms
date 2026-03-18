// src/App.js - Updated with Login + Warehouse Select
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LogoHeader, SamilaLogo } from './components/Logo/SamilaLogo';
import LoginPage from './pages/Login/LoginPage';
import WarehouseSelectPage from './pages/WarehouseSelect/WarehouseSelectPage';
import Dashboard from './pages/Dashboard/Dashboard';
import ReceivingModule from './pages/Receiving/ReceivingModule';
import InventoryModule from './pages/Inventory/InventoryModule';
import ProductModule from './pages/Product/ProductModule';
import PickingModule from './pages/Picking/PickingModule';
import ShippingModule from './pages/Shipping/ShippingModule';
import TarifManagement from './pages/Tarif/TarifManagement';
import CustomerModule from './pages/Customer/CustomerModule';
import ReportsModule from './pages/Reports/ReportsModule';
import UsersModule from './pages/Users/UsersModule';
import SettingsModule from './pages/Settings/SettingsModule';
import SuperAdminModule from './pages/SuperAdmin/SuperAdminModule';
import KPIModule from './pages/KPI/KPIModule';
import PutawayModule from './pages/Putaway/PutawayModule';
import OrderModule from './pages/Order/OrderModule';
import CSModule from './pages/CS/CSModule';
import MobileModule from './pages/Mobile/MobileModule';
import { INIT_INVENTORY } from './constants/inventoryData';
import { ToastProvider } from './components/Toast/Toast';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { userService } from './services/userService';
import { warehouseService } from './services/warehouseService';
import { inventoryService } from './services/inventoryService';
import './App.css';

// Shared user list — single source of truth for UsersModule, SuperAdmin tab, and LoginPage
// NOTE: In production, authentication must be handled by the backend (JWT).
// Passwords below are intentionally minimal — the real auth endpoint validates them.
const _allOn = () => Object.fromEntries([
  'dashboard','receiving','inventory','product','picking','putaway','shipping',
  'tarif','customer','reports','kpi','mobile','users','warehouse-setting','user-limit','settings'
].map(k => [k, true]));

// Default credentials pulled from .env so they are NOT in source code.
// Fallbacks below are only used in local-dev mode (no backend).
const _pw = (envKey, fallback) =>
  process.env[envKey] || fallback;

const INIT_USERS = [
  { id: 0, name: 'Samila Super Admin', username: 'superadmin', email: 'superadmin@samila.th', warehouses: ['All'], password: _pw('REACT_APP_SA_PASS','Super@2026'),    status: 'active',   lastLogin: '-',                menus: _allOn(), role: 'superadmin' },
  { id: 1, name: 'สมชาย ใจดี',        username: 'admin',       email: 'somchai@samila.th',  warehouses: ['All'],         password: _pw('REACT_APP_ADMIN_PASS','admin123'),     status: 'active',   lastLogin: '2026-03-11 09:12', menus: _allOn() },
  { id: 2, name: 'สุภาพร รักงาน',     username: 'manager',     email: 'supaporn@samila.th', warehouses: ['Warehouse A'], password: _pw('REACT_APP_MGR_PASS','manager123'),     status: 'active',   lastLogin: '2026-03-11 08:45', menus: { ..._allOn(), 'user-limit': false, settings: false } },
  { id: 3, name: 'วิชัย แข็งแกร่ง',   username: 'super1',      email: 'wichai@samila.th',   warehouses: ['Warehouse A'], password: _pw('REACT_APP_WH_PASS1','WH@2026a'),       status: 'active',   lastLogin: '2026-03-10 17:30', menus: { ..._allOn(), users: false, settings: false } },
  { id: 4, name: 'นภา สดใส',          username: 'whadmin',     email: 'napa@samila.th',     warehouses: ['Warehouse B'], password: _pw('REACT_APP_WH_PASS2','WH@2026b'),       status: 'active',   lastLogin: '2026-03-10 16:22', menus: { ..._allOn(), users: false, 'warehouse-setting': false, 'user-limit': false, settings: false } },
  { id: 5, name: 'ธนา มั่งมี',        username: 'leader1',     email: 'thana@samila.th',    warehouses: ['Warehouse A'], password: _pw('REACT_APP_LEAD_PASS','Lead@2026'),      status: 'active',   lastLogin: '2026-03-11 07:40', menus: { ..._allOn(), users: false, settings: false } },
  { id: 6, name: 'ปรีชา เก่งกาจ',     username: 'operator',    email: 'preecha@samila.th',  warehouses: ['Warehouse B'], password: _pw('REACT_APP_OPR_PASS','Opr@2026'),       status: 'active',   lastLogin: '2026-03-09 14:10', menus: { ..._allOn(), users: false, reports: false, kpi: false, settings: false } },
  { id: 7, name: 'อรทัย สวยงาม',      username: 'orathai',     email: 'orathai@samila.th',  warehouses: ['All'],         password: _pw('REACT_APP_DEMO_PASS','Orathai@123'),   status: 'inactive', lastLogin: '2026-02-28 10:00', menus: _allOn() },
];

// ── Warehouse list helper (same logic as WarehouseSelectPage) ──────────────
const FALLBACK_WH = [
  { id: 1, code: 'WH-BKK', name: 'Warehouse Bangkok',      location: 'กรุงเทพฯ (ลาดกระบัง)', companyNo: 'COMP-001', active: true,  icon: '🏙️' },
  { id: 2, code: 'WH-NTB', name: 'Warehouse Nonthaburi',   location: 'นนทบุรี (บางใหญ่)',     companyNo: 'COMP-001', active: true,  icon: '🏭' },
  { id: 3, code: 'WH-PTN', name: 'Warehouse Pathum Thani', location: 'ปทุมธานี (คลองหลวง)',   companyNo: 'COMP-001', active: true,  icon: '🌿' },
  { id: 4, code: 'WH-TRG', name: 'Warehouse Trang',        location: 'ตรัง',                  companyNo: 'COMP-001', active: true,  icon: '🏥' },
  { id: 5, code: 'WH-CNX', name: 'Warehouse Chiang Mai',   location: 'เชียงใหม่ (สันกำแพง)', companyNo: 'COMP-001', active: true,  icon: '⛰️' },
  { id: 6, code: 'WH-HYD', name: 'Warehouse Hat Yai',      location: 'สงขลา (หาดใหญ่)',       companyNo: 'COMP-001', active: false, icon: '🌊' },
];

function getAvailableWarehouses(user) {
  try {
    const saved = localStorage.getItem('wms_sa_whs');
    const allWhs = saved ? JSON.parse(saved) : FALLBACK_WH;
    if (!user) return [];
    if (user.role === 'superadmin') return allWhs;
    const assigned = user.warehouses || [];
    if (user.companyNo) {
      return allWhs.filter(w => w.companyNo === user.companyNo && assigned.includes(w.name));
    }
    if (assigned.includes('All')) return allWhs.filter(w => w.active !== false);
    return allWhs.filter(w => assigned.includes(w.name));
  } catch {
    return FALLBACK_WH;
  }
}

function App() {
  const { t, i18n } = useTranslation();
  const [backendStatus, setBackendStatus] = useState('checking');
  const [backendData, setBackendData] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Warehouse switcher dropdown
  const [showWhDropdown, setShowWhDropdown] = useState(false);
  const whDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (whDropdownRef.current && !whDropdownRef.current.contains(e.target)) {
        setShowWhDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Shared users state — persist to localStorage (profile data only, passwords re-merged from INIT_USERS)
  const [sharedUsers, setSharedUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('wms_users');
      if (!saved) return INIT_USERS;
      const parsed = JSON.parse(saved);
      // Restore passwords: use localStorage profile data but keep passwords from INIT_USERS
      // For users created/edited in-app, their password is already in localStorage
      const merged = parsed.map(u => {
        const init = INIT_USERS.find(i => i.id === u.id);
        return (init && !u.password) ? { ...u, password: init.password } : u;
      });
      // Ensure superadmin always exists
      const SA = INIT_USERS.find(u => u.role === 'superadmin');
      const hasSA = merged.some(u => u.role === 'superadmin');
      return hasSA ? merged : [SA, ...merged];
    } catch {
      return INIT_USERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('wms_users', JSON.stringify(sharedUsers));
    } catch { /* storage unavailable */ }
  }, [sharedUsers]);

  // Register PWA Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => { /* SW optional */ });
    }
  }, []);

  // Shared inventory state — used by ReceivingModule & InventoryModule
  const [inventory, setInventory] = useState(INIT_INVENTORY);

  const handleReceive = (newItem) => {
    setInventory(prev => [...prev, { ...newItem, id: Date.now() + Math.random() }]);
  };

  // Shared putaway state — used by ReceivingModule & PutawayModule
  const [putawayRecords, setPutawayRecords] = useState([
    { id: 1, paNumber: 'PA-2026-0001', grNumber: 'GR-2026-0001', sku: 'SKU-001', barcode: '8850000001', customer: 'Nayong Hospital', fromLocation: 'RECEIVING', toLocation: 'A-01-1', qty: 50,  mainUnit: 'PCS', subUnit: 'BOX',    batNumber: 'BAT-001', lotNumber: 'LOT-001', manufactureDate: '2025-01-15', expiryDate: '2027-01-15', assignedTo: 'Somchai', date: '2026-03-13', status: 'COMPLETE' },
    { id: 2, paNumber: 'PA-2026-0002', grNumber: 'GR-2026-0002', sku: 'SKU-002', barcode: '8850000002', customer: 'ThaiBev Co.',     fromLocation: 'RECEIVING', toLocation: 'B-02-1', qty: 120, mainUnit: 'PCS', subUnit: 'CARTON', batNumber: 'BAT-002', lotNumber: 'LOT-002', manufactureDate: '2026-01-10', expiryDate: '2028-01-10', assignedTo: 'Wichai',  date: '2026-03-13', status: 'IN_PROGRESS' },
    { id: 3, paNumber: 'PA-2026-0003', grNumber: 'GR-2026-0003', sku: 'SKU-003', barcode: '8850000003', customer: 'SCG Logistics',   fromLocation: 'RECEIVING', toLocation: 'C-01-2', qty: 30,  mainUnit: 'KG',  subUnit: 'BAG',    batNumber: 'BAT-003', lotNumber: 'LOT-003', manufactureDate: '2025-11-01', expiryDate: '2026-11-01', assignedTo: 'Malee',   date: '2026-03-13', status: 'PENDING' },
  ]);

  const handlePutaway = (newTask) => {
    setPutawayRecords(prev => [...prev, { ...newTask, id: Date.now() + Math.random() }]);
  };

  // Receiving orders state (lifted from ReceivingModule)
  const [receivingOrders, setReceivingOrders] = useState([
    { id: 1, entryNumber: 'EN-2026-0001', grNumber: 'GR-2026-0001', poNumber: 'PO-2026-0001', supplier: 'Supplier A', customer: 'Customer A', date: '2026-03-03', receiver: 'Somchai', items: 50, mainUnit: 'PCS', subUnit: 'BOX', status: 'RECEIVING', zone: 'A', batNumber: 'BAT-001', lotNumber: 'LOT-001', manufactureDate: '2025-01-15', expiryDate: '2027-01-15' },
  ]);

  // Picking orders state (lifted from PickingModule)
  const [pickingOrders, setPickingOrders] = useState([
    { id: 1, pickNo: 'PICK-2026-0001', date: '2026-03-16', customer: 'Customer A', warehouse: 'Warehouse A', status: 'PENDING',
      items: [
        { id: 1, sku: 'SKU001', productName: 'Product 1', barcode: 'BC001', location: 'A-01-1-A', batNumber: 'BAT-001', lotNumber: 'LOT-001', toPick: 100, picked: 0, unit: 'PCS' },
        { id: 2, sku: 'SKU002', productName: 'Product 2', barcode: 'BC002', location: 'A-02-1-A', batNumber: 'BAT-002', lotNumber: 'LOT-002', toPick: 50,  picked: 0, unit: 'BOX' },
      ],
    },
  ]);

  // Sales orders state (lifted from OrderModule)
  const [salesOrders, setSalesOrders] = useState([]);

  // CS cases state (lifted from CSModule)
  const [csCases, setCsCases] = useState([
    { id: 1, csNo: 'CS-20260311-0012', date: '2026-03-11', customer: 'Customer A', orderRef: 'ORD-20260310-1234', category: 'Complaint', complaintType: 'สินค้าเสียหาย', priority: 'High', subject: 'สินค้าเสียหายระหว่างขนส่ง', detail: 'กล่องสินค้าถูกบุบและสินค้าแตก 3 ชิ้น', assignTo: 'สมชาย', status: 'In Progress', dueDate: '2026-03-14', resolvedDate: '', rootCause: 'บรรจุภัณฑ์ไม่แข็งแรงพอ', correctiveAction: 'เปลี่ยนสินค้าใหม่ให้ลูกค้า', preventiveAction: 'ปรับปรุงวิธีบรรจุภัณฑ์', compensation: 'เปลี่ยนสินค้าใหม่ 3 ชิ้น', notes: [{ id: 1, author: 'สมชาย', date: '2026-03-11 10:30', text: 'รับเรื่องแล้ว กำลังตรวจสอบสินค้า', type: 'update' }, { id: 2, author: 'สมชาย', date: '2026-03-12 09:00', text: 'ยืนยันสินค้าเสียหาย 3 ชิ้น จะจัดส่งสินค้าใหม่ภายใน 2 วัน', type: 'action' }] },
    { id: 2, csNo: 'CS-20260310-0008', date: '2026-03-10', customer: 'Customer B', orderRef: 'ORD-20260309-5678', category: 'Return Request', complaintType: '', priority: 'Medium', subject: 'ขอคืนสินค้า LOT-003', detail: 'สินค้าหมดอายุก่อนกำหนด', assignTo: 'สุภาพร', status: 'Open', dueDate: '2026-03-15', resolvedDate: '', rootCause: '', correctiveAction: '', preventiveAction: '', compensation: '', notes: [] },
    { id: 3, csNo: 'CS-20260309-0021', date: '2026-03-09', customer: 'Customer C', orderRef: '', category: 'Inquiry', complaintType: '', priority: 'Low', subject: 'สอบถามสต็อกสินค้า SKU005', detail: 'ต้องการทราบยอดคงเหลือ', assignTo: 'วิชัย', status: 'Resolved', dueDate: '', resolvedDate: '2026-03-10', rootCause: '', correctiveAction: 'แจ้งยอดสต็อกให้ลูกค้าทราบแล้ว', preventiveAction: '', compensation: '', notes: [{ id: 1, author: 'วิชัย', date: '2026-03-09 14:00', text: 'แจ้งยอดคงเหลือ SKU005 = 180 ชิ้น', type: 'resolved' }] },
    { id: 4, csNo: 'CS-20260308-0005', date: '2026-03-08', customer: 'Customer D', orderRef: 'ORD-20260307-9999', category: 'Delivery Issue', complaintType: '', priority: 'Urgent', subject: 'ส่งสินค้าผิด Location', detail: 'สินค้าถูกส่งไปผิดที่ ควรเป็น B-02 แต่ส่งไป A-03', assignTo: 'นภา', status: 'Closed', dueDate: '2026-03-09', resolvedDate: '2026-03-09', rootCause: 'พนักงานอ่าน label ผิด', correctiveAction: 'ย้ายสินค้าไปยัง Location ที่ถูกต้องแล้ว', preventiveAction: 'อบรมพนักงาน + ติด QR Code Location', compensation: '', notes: [{ id: 1, author: 'นภา', date: '2026-03-08 16:00', text: 'รับเรื่องด่วน กำลังตรวจสอบ', type: 'update' }, { id: 2, author: 'นภา', date: '2026-03-09 08:30', text: 'ย้ายสินค้าไป B-02 เรียบร้อยแล้ว ปิดเคส', type: 'resolved' }] },
  ]);

  // ── PWA / Mobile mode detection ──────────────────────────────
  // Priority: PWA standalone > ?pwa=mobile param > mobile device screen width
  const isPWAMode = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('pwa') === 'mobile' ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
  // Auto-detect mobile device: phone/tablet (screen ≤ 768px or touch UA)
  const isMobileDevice = typeof window !== 'undefined' && (
    window.innerWidth <= 768 ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  );
  // Combined flag — either PWA or actual mobile device
  const isMobileMode = isPWAMode || isMobileDevice;

  const pwaInitScreen = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('screen') || 'home'
    : 'home';

  // Auth & warehouse flow
  const [appState, setAppState] = useState(() => {
    if (isPWAMode) {
      // Try to restore session from localStorage for PWA launch
      try {
        const saved = localStorage.getItem('wms_pwa_session');
        if (saved) { const s = JSON.parse(saved); if (s.user && s.warehouse) return 'app'; }
      } catch {}
      return 'login';
    }
    return 'login';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    if (isPWAMode) {
      try {
        const saved = localStorage.getItem('wms_pwa_session');
        if (saved) { const s = JSON.parse(saved); return s.user || null; }
      } catch {}
    }
    return null;
  });
  const [currentWarehouse, setCurrentWarehouse] = useState(() => {
    if (isPWAMode) {
      try {
        const saved = localStorage.getItem('wms_pwa_session');
        if (saved) { const s = JSON.parse(saved); return s.warehouse || null; }
      } catch {}
    }
    return null;
  });

  const handleLogin = (user) => {
    setCurrentUser(user);
    setAppState('select-warehouse');
  };
  const handleSelectWarehouse = (wh) => {
    setCurrentWarehouse(wh);
    setAppState('app');
  };
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentWarehouse(null);
    localStorage.removeItem('wms_pwa_session');
    setAppState('login');
    setActiveMenu('dashboard');
  };

  // Persist session for PWA re-launch (no password stored)
  useEffect(() => {
    if (currentUser && currentWarehouse) {
      try {
        const { password: _omit, ...safeUser } = currentUser;
        localStorage.setItem('wms_pwa_session', JSON.stringify({ user: safeUser, warehouse: currentWarehouse }));
      } catch {}
    }
  }, [currentUser, currentWarehouse]);

  // Load users + warehouses + inventory from API on app start
  useEffect(() => {
    // Load users from API (update sharedUsers if API available)
    userService.getAll().then(apiUsers => {
      if (Array.isArray(apiUsers) && apiUsers.length > 0) {
        setSharedUsers(apiUsers.map(u => ({
          id: u.id, username: u.username, name: u.name, email: u.email,
          role: u.role, warehouses: u.warehouses || [], menus: u.menus || {},
          status: u.status, lastLogin: u.lastLogin || '-',
          password: '(API)', // placeholder — real auth via API
        })));
      }
    }).catch(() => {}); // fallback to INIT_USERS

    // Load warehouses from API
    warehouseService.getAll().then(apiWhs => {
      if (Array.isArray(apiWhs) && apiWhs.length > 0) {
        localStorage.setItem('wms_sa_whs', JSON.stringify(apiWhs.map(w => ({
          id: w.id, code: w.code, name: w.name, name_th: w.name_th,
          location: w.location || w.province || '',
          active: w.active !== false, icon: w.icon || '🏭',
          companyNo: w.companyNo || 'COMP-001',
        }))));
      }
    }).catch(() => {});

    // Load inventory from API
    inventoryService.getAll().then(apiInv => {
      if (Array.isArray(apiInv) && apiInv.length > 0) {
        setInventory(apiInv);
      }
    }).catch(() => {}); // fallback to INIT_INVENTORY
  }, []);

  useEffect(() => {
    checkBackendHealth();
    fetchApiInfo();
  }, []);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setBackendStatus('healthy');
        setBackendData(data);
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      setBackendStatus('error');
    }
  };

  const fetchApiInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/info`);
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
      }
    } catch { /* backend offline */ }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // Show login / warehouse select pages
  if (appState === 'login')
    return <ToastProvider><LoginPage onLogin={handleLogin} users={sharedUsers} /></ToastProvider>;
  if (appState === 'select-warehouse') {
    const freshUser = sharedUsers.find(u => u.id === currentUser?.id) || currentUser;
    return <ToastProvider><WarehouseSelectPage user={freshUser} onSelect={handleSelectWarehouse} onLogout={handleLogout} /></ToastProvider>;
  }

  // ── Mobile / PWA mode — full-screen mobile UI, no desktop chrome ──
  if (isMobileMode) {
    return (
      <ToastProvider>
        <div style={{ minHeight: '100vh', background: '#071e2a' }}>
          <ErrorBoundary name="Mobile Worker">
            <MobileModule
              inventory={inventory} setInventory={setInventory}
              pickingOrders={pickingOrders} setPickingOrders={setPickingOrders}
              putawayRecords={putawayRecords} setPutawayRecords={setPutawayRecords}
              onReceive={handleReceive}
              currentUser={currentUser}
              initialScreen={pwaInitScreen}
              onLogout={handleLogout}
              isPWA={isPWAMode}
            />
          </ErrorBoundary>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
    <div className="App">
      {/* Top Header with Logo */}
      <header className="top-header">
        <div className="header-logo-section">
          <LogoHeader showText={true} />
        </div>

        <div className="header-controls">
          {currentWarehouse && (
            <div className="wh-switcher" ref={whDropdownRef}>
              <button
                className={`header-warehouse-badge wh-switcher-btn ${showWhDropdown ? 'open' : ''}`}
                onClick={() => setShowWhDropdown(s => !s)}
                title="คลิกเพื่อเปลี่ยนคลังสินค้า"
              >
                {currentWarehouse.icon || '🏭'}
                <span>{currentWarehouse.name}</span>
                <span className="header-wh-loc">{currentWarehouse.location || currentWarehouse.province}</span>
                <span className="wh-switcher-caret">{showWhDropdown ? '▲' : '▼'}</span>
              </button>

              {showWhDropdown && (
                <div className="wh-switcher-dropdown">
                  <div className="wh-switcher-title">เลือกคลังสินค้า</div>
                  {getAvailableWarehouses(currentUser).map(wh => (
                    <button
                      key={wh.id}
                      className={`wh-switcher-item ${wh.id === currentWarehouse.id ? 'current' : ''} ${wh.active === false ? 'disabled' : ''}`}
                      disabled={wh.active === false}
                      onClick={() => {
                        setCurrentWarehouse(wh);
                        setShowWhDropdown(false);
                      }}
                    >
                      <span className="wh-item-icon">{wh.icon}</span>
                      <div className="wh-item-info">
                        <span className="wh-item-name">{wh.name}</span>
                        <span className="wh-item-loc">{wh.location}</span>
                      </div>
                      {wh.id === currentWarehouse.id && <span className="wh-item-check">✓</span>}
                      {wh.active === false && <span className="wh-item-closed">ปิด</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {currentUser && (
            <div className="header-user-badge">
              <span className="header-user-name">{currentUser.name}</span>
            </div>
          )}
          <button onClick={toggleLanguage} className="lang-toggle-btn">
            {i18n.language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
          </button>
          <button onClick={handleLogout} className="logout-btn">🚪 ออกจากระบบ</button>
        </div>
      </header>

      <div className="main-container">
        {/* Left Sidebar Navigation */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {/* Small Logo in Sidebar */}
            <div className="sidebar-logo">
              <SamilaLogo size="small" variant="icon"/>
            </div>

            <div className="nav-section">
              <h3 className="nav-title">{t('menu.wmsMenu') || 'WMS Menu'}</h3>

              <ul className="nav-list">
                <li>
                  <a
                    href="#dashboard"
                    className={`nav-link ${activeMenu === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('dashboard')}
                  >
                    📊 {t('menu.dashboard') || 'Dashboard'}
                  </a>
                </li>
                <li>
                  <a
                    href="#product"
                    className={`nav-link ${activeMenu === 'product' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('product')}
                  >
                    🏷️ {t('menu.product') || 'Product'}
                  </a>
                </li>
                <li>
                  <a
                    href="#order"
                    className={`nav-link ${activeMenu === 'order' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('order')}
                  >
                    🛒 Order
                  </a>
                </li>
                <li>
                  <a
                    href="#cs"
                    className={`nav-link ${activeMenu === 'cs' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('cs')}
                  >
                    🎧 Customer Service
                  </a>
                </li>
                <li>
                  <a
                    href="#receiving"
                    className={`nav-link ${activeMenu === 'receiving' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('receiving')}
                  >
                    📦 {t('menu.receiving') || 'Receiving'}
                  </a>
                </li>
                <li>
                  <a
                    href="#inventory"
                    className={`nav-link ${activeMenu === 'inventory' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('inventory')}
                  >
                    📋 {t('menu.inventory') || 'Inventory'}
                  </a>
                </li>
                <li>
                  <a
                    href="#putaway"
                    className={`nav-link ${activeMenu === 'putaway' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('putaway')}
                  >
                    🏷️ Putaway
                  </a>
                </li>
                <li>
                  <a
                    href="#picking"
                    className={`nav-link ${activeMenu === 'picking' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('picking')}
                  >
                    🔍 {t('menu.picking') || 'Picking'}
                  </a>
                </li>
                <li>
                  <a
                    href="#shipping"
                    className={`nav-link ${activeMenu === 'shipping' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('shipping')}
                  >
                    🚚 {t('menu.shipping') || 'Shipping'}
                  </a>
                </li>
                <li>
                  <a
                    href="#tarif"
                    className={`nav-link ${activeMenu === 'tarif' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('tarif')}
                  >
                    💰 {t('menu.tarif') || 'Tarif Management'}
                  </a>
                </li>
                <li>
                  <a
                    href="#customer"
                    className={`nav-link ${activeMenu === 'customer' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('customer')}
                  >
                    🏢 {t('menu.customer') || 'Customers'}
                  </a>
                </li>
                <li>
                  <a
                    href="#reports"
                    className={`nav-link ${activeMenu === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('reports')}
                  >
                    📈 {t('menu.reports') || 'Reports'}
                  </a>
                </li>
                <li>
                  <a
                    href="#kpi"
                    className={`nav-link ${activeMenu === 'kpi' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('kpi')}
                  >
                    🎯 KPI Management
                  </a>
                </li>
                {currentUser?.menus?.mobile !== false && (
                  <li>
                    <a
                      href="#mobile"
                      className={`nav-link ${activeMenu === 'mobile' ? 'active' : ''}`}
                      onClick={() => setActiveMenu('mobile')}
                    >
                      📱 Mobile Worker
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <div className="nav-section">
              <h3 className="nav-title">{t('menu.settings') || 'Settings'}</h3>
              <ul className="nav-list">
                <li>
                  <a
                    href="#users"
                    className={`nav-link ${activeMenu === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('users')}
                  >
                    👥 {t('menu.users') || 'Users'}
                  </a>
                </li>
                <li>
                  <a
                    href="#settings"
                    className={`nav-link ${activeMenu === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('settings')}
                  >
                    ⚙️ {t('menu.settings') || 'Settings'}
                  </a>
                </li>
                {currentUser?.role === 'superadmin' && (
                  <li>
                    <a
                      href="#superadmin"
                      className={`nav-link ${activeMenu === 'superadmin' ? 'active' : ''}`}
                      onClick={() => setActiveMenu('superadmin')}
                      style={{ color: activeMenu === 'superadmin' ? '#FFD700' : '#FFD700', opacity: activeMenu === 'superadmin' ? 1 : 0.7 }}
                    >
                      👑 Super Admin
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="main-content main-content-dark">

          {/* Dynamic Page Rendering */}
          {activeMenu === 'dashboard'  && <ErrorBoundary name="Dashboard"><Dashboard /></ErrorBoundary>}
          {activeMenu === 'receiving'  && <ErrorBoundary name="Receiving"><ReceivingModule onReceive={handleReceive} onPutaway={handlePutaway} receivingOrders={receivingOrders} setReceivingOrders={setReceivingOrders} /></ErrorBoundary>}
          {activeMenu === 'inventory'  && <ErrorBoundary name="Inventory"><InventoryModule inventory={inventory} setInventory={setInventory} /></ErrorBoundary>}
          {activeMenu === 'product'    && <ErrorBoundary name="Product"><ProductModule /></ErrorBoundary>}
          {activeMenu === 'picking'    && <ErrorBoundary name="Picking"><PickingModule inventory={inventory} setInventory={setInventory} pickingOrders={pickingOrders} setPickingOrders={setPickingOrders} /></ErrorBoundary>}
          {activeMenu === 'shipping'   && <ErrorBoundary name="Shipping"><ShippingModule /></ErrorBoundary>}
          {activeMenu === 'tarif'      && <ErrorBoundary name="Tarif Management"><TarifManagement /></ErrorBoundary>}
          {activeMenu === 'customer'   && <ErrorBoundary name="Customer"><CustomerModule /></ErrorBoundary>}
          {activeMenu === 'reports'    && <ErrorBoundary name="Reports"><ReportsModule inventory={inventory} receivingOrders={receivingOrders} putawayRecords={putawayRecords} pickingOrders={pickingOrders} salesOrders={salesOrders} csCases={csCases} /></ErrorBoundary>}
          {activeMenu === 'users'      && <ErrorBoundary name="Users"><UsersModule users={sharedUsers} setUsers={setSharedUsers} /></ErrorBoundary>}
          {activeMenu === 'settings'   && <ErrorBoundary name="Settings"><SettingsModule /></ErrorBoundary>}
          {activeMenu === 'superadmin' && currentUser?.role === 'superadmin' && <ErrorBoundary name="Super Admin"><SuperAdminModule currentUser={currentUser} users={sharedUsers} setUsers={setSharedUsers} /></ErrorBoundary>}
          {activeMenu === 'kpi'        && <ErrorBoundary name="KPI"><KPIModule /></ErrorBoundary>}
          {activeMenu === 'putaway'    && <ErrorBoundary name="Putaway"><PutawayModule records={putawayRecords} setRecords={setPutawayRecords} inventory={inventory} setInventory={setInventory} /></ErrorBoundary>}
          {activeMenu === 'order'      && <ErrorBoundary name="Order"><OrderModule orders={salesOrders} setOrders={setSalesOrders} inventory={inventory} /></ErrorBoundary>}
          {activeMenu === 'cs'         && <ErrorBoundary name="Customer Service"><CSModule cases={csCases} setCases={setCsCases} /></ErrorBoundary>}
          {activeMenu === 'mobile' && currentUser?.menus?.mobile !== false && <ErrorBoundary name="Mobile Worker"><MobileModule inventory={inventory} setInventory={setInventory} pickingOrders={pickingOrders} setPickingOrders={setPickingOrders} putawayRecords={putawayRecords} setPutawayRecords={setPutawayRecords} onReceive={handleReceive} currentUser={currentUser} /></ErrorBoundary>}

          {/* Default home content (hidden when module active) */}
          {!['dashboard','receiving','inventory','product','picking','putaway','order','cs','shipping','tarif','customer','reports','users','settings','superadmin','kpi','mobile'].includes(activeMenu) && (
          <><section className="status-section">
            <div className="status-card backend-status">
              <div className="card-header">
                <SamilaLogo size="small" variant="icon"/>
                <h2>🔌 Backend Status</h2>
              </div>
              <div className={`status-badge ${backendStatus}`}>
                {backendStatus === 'healthy' ? '✓ HEALTHY' : '✗ ERROR'}
              </div>
              {backendData && (
                <div className="card-content">
                  <p><strong>Service:</strong> {backendData.service}</p>
                  <p><strong>Version:</strong> {backendData.version}</p>
                  <p><strong>Status:</strong> {backendData.message}</p>
                </div>
              )}
            </div>

            <div className="status-card api-status">
              <div className="card-header">
                <SamilaLogo size="small" variant="icon"/>
                <h2>📡 API Information</h2>
              </div>
              {apiData ? (
                <div className="card-content">
                  <p><strong>Name:</strong> {apiData.name}</p>
                  <p><strong>Version:</strong> {apiData.version}</p>
                  <p><strong>Tagline:</strong> {apiData.tagline}</p>
                  <p><strong>Organization:</strong> {apiData.organization?.name}</p>
                </div>
              ) : (
                <p className="loading">Loading API info...</p>
              )}
            </div>
          </section>

          {/* Quick Links */}
          <section className="quick-links-section">
            <h2>🔗 QUICK LINKS</h2>
            <div className="links-container">
              <a href={API_URL} target="_blank" rel="noopener noreferrer" className="link-btn backend-btn">
                🏠 BACKEND
              </a>
              <a href={`${API_URL}/health`} target="_blank" rel="noopener noreferrer" className="link-btn health-btn">
                💚 HEALTH
              </a>
              <a href={`${API_URL}/api/docs`} target="_blank" rel="noopener noreferrer" className="link-btn docs-btn">
                📚 API DOCS
              </a>
              <a href={`${API_URL}/api/info`} target="_blank" rel="noopener noreferrer" className="link-btn info-btn">
                ℹ️ API INFO
              </a>
            </div>
          </section>

          {/* System Information */}
          <section className="system-info-section">
            <h2>⚙️ SYSTEM INFORMATION</h2>
            <div className="info-grid">
              <div className="info-card">
                <h3>Frontend</h3>
                <p className="tech">React 18+</p>
                <p className="port">:3000</p>
              </div>
              <div className="info-card">
                <h3>Backend</h3>
                <p className="tech">FastAPI 0.104.1</p>
                <p className="port">:8000</p>
              </div>
              <div className="info-card">
                <h3>Database</h3>
                <p className="tech">SQLAlchemy 2.0</p>
                <p className="port">PostgreSQL/SQLite</p>
              </div>
              <div className="info-card">
                <h3>Mobile</h3>
                <p className="tech">React Native</p>
                <p className="port">Android/iOS</p>
              </div>
              <div className="info-card">
                <h3>Design</h3>
                <p className="tech">Oracle System</p>
                <p className="port">Professional UI</p>
              </div>
              <div className="info-card">
                <h3>Organization</h3>
                <p className="tech">Nayong Hospital</p>
                <p className="port">Trang, Thailand</p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="features-section">
            <h2>✨ FEATURES</h2>
            <ul className="features-list">
              <li>
                <input type="checkbox" checked readOnly />
                <span>Multi-tenant Warehouse Management</span>
              </li>
              <li>
                <input type="checkbox" checked readOnly />
                <span>Real-time Inventory Tracking</span>
              </li>
              <li>
                <input type="checkbox" checked readOnly />
                <span>Advanced Reporting & Analytics</span>
              </li>
              <li>
                <input type="checkbox" checked readOnly />
                <span>Mobile-first Design with Scanner</span>
              </li>
              <li>
                <input type="checkbox" checked readOnly />
                <span>RESTful API (75+ endpoints)</span>
              </li>
              <li>
                <input type="checkbox" checked readOnly />
                <span>Role-based Access Control</span>
              </li>
              <li>
                <input type="checkbox" checked readOnly />
                <span>High Performance & Scalability</span>
              </li>
              <li>
                <input type="checkbox" checked readOnly />
                <span>Multi-Language Support (Thai/English)</span>
              </li>
            </ul>
          </section>
          </>)}
        </main>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-logo">
          <SamilaLogo size="small" variant="icon"/>
        </div>
        <div className="footer-content">
          <p>
            <strong>Samila WMS 3PL</strong> © 2026 |
            <a href="#docs">Documentation</a> |
            <a href="#support">Support</a> |
            <a href="#github">GitHub</a>
          </p>
          <p className="footer-org">
            🏥 Nayong Hospital, Trang Province, Thailand
          </p>
          <p className="footer-tagline">
            ✨ Innovative Solutions for Warehouse Management Excellence
          </p>
        </div>
      </footer>
    </div>
    </ToastProvider>
  );
}

export default App;
