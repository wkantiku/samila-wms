// src/App.js - Updated with Login + Warehouse Select
import React, { useState, useEffect } from 'react';
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
import KPIModule from './pages/KPI/KPIModule';
import PutawayModule from './pages/Putaway/PutawayModule';
import OrderModule from './pages/Order/OrderModule';
import CSModule from './pages/CS/CSModule';
import { INIT_INVENTORY } from './constants/inventoryData';
import './App.css';

function App() {
  const { t, i18n } = useTranslation();
  const [backendStatus, setBackendStatus] = useState('checking');
  const [backendData, setBackendData] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');

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

  // Auth & warehouse flow
  const [appState, setAppState]               = useState('login');
  const [currentUser, setCurrentUser]         = useState(null);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);

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
    setAppState('login');
    setActiveMenu('dashboard');
  };

  useEffect(() => {
    checkBackendHealth();
    fetchApiInfo();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
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
      const response = await fetch('http://localhost:8000/api/info');
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
      }
    } catch (error) {
      console.log('API info fetch error:', error);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // Show login / warehouse select pages
  if (appState === 'login')
    return <LoginPage onLogin={handleLogin} />;
  if (appState === 'select-warehouse')
    return <WarehouseSelectPage user={currentUser} onSelect={handleSelectWarehouse} onLogout={handleLogout} />;

  return (
    <div className="App">
      {/* Top Header with Logo */}
      <header className="top-header">
        <div className="header-logo-section">
          <LogoHeader showText={true} />
        </div>

        <div className="header-controls">
          {currentWarehouse && (
            <div className="header-warehouse-badge">
              🏭 <span>{currentWarehouse.name}</span>
              <span className="header-wh-loc">{currentWarehouse.province}</span>
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
                <li>
                  <a
                    href="#superadmin"
                    className={`nav-link ${activeMenu === 'superadmin' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('superadmin')}
                    style={{ color: activeMenu === 'superadmin' ? '#FFD700' : '#9b8caf' }}
                  >
                    👑 Super Admin
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="main-content main-content-dark">

          {/* Dynamic Page Rendering */}
          {activeMenu === 'dashboard'  && <Dashboard />}
          {activeMenu === 'receiving'  && <ReceivingModule onReceive={handleReceive} onPutaway={handlePutaway} receivingOrders={receivingOrders} setReceivingOrders={setReceivingOrders} />}
          {activeMenu === 'inventory'  && <InventoryModule inventory={inventory} setInventory={setInventory} />}
          {activeMenu === 'product'    && <ProductModule />}
          {activeMenu === 'picking'    && <PickingModule inventory={inventory} setInventory={setInventory} pickingOrders={pickingOrders} setPickingOrders={setPickingOrders} />}
          {activeMenu === 'shipping'   && <ShippingModule />}
          {activeMenu === 'tarif'      && <TarifManagement />}
          {activeMenu === 'customer'   && <CustomerModule />}
          {activeMenu === 'reports'    && <ReportsModule inventory={inventory} receivingOrders={receivingOrders} putawayRecords={putawayRecords} pickingOrders={pickingOrders} salesOrders={salesOrders} csCases={csCases} />}
          {activeMenu === 'users'             && <UsersModule />}
          {activeMenu === 'settings'    && <SettingsModule />}
          {activeMenu === 'superadmin'  && <SettingsModule defaultTab="superadmin" />}
          {activeMenu === 'kpi'        && <KPIModule />}
          {activeMenu === 'putaway'    && <PutawayModule records={putawayRecords} setRecords={setPutawayRecords} inventory={inventory} setInventory={setInventory} />}
          {activeMenu === 'order'      && <OrderModule orders={salesOrders} setOrders={setSalesOrders} inventory={inventory} />}
          {activeMenu === 'cs'         && <CSModule cases={csCases} setCases={setCsCases} />}

          {/* Default home content (hidden when module active) */}
          {!['dashboard','receiving','inventory','product','picking','putaway','order','cs','shipping','tarif','customer','reports','users','settings','superadmin','kpi'].includes(activeMenu) && (
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
              <a href="http://localhost:8000" target="_blank" rel="noopener noreferrer" className="link-btn backend-btn">
                🏠 BACKEND
              </a>
              <a href="http://localhost:8000/health" target="_blank" rel="noopener noreferrer" className="link-btn health-btn">
                💚 HEALTH
              </a>
              <a href="http://localhost:8000/api/docs" target="_blank" rel="noopener noreferrer" className="link-btn docs-btn">
                📚 API DOCS
              </a>
              <a href="http://localhost:8000/api/info" target="_blank" rel="noopener noreferrer" className="link-btn info-btn">
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
  );
}

export default App;
