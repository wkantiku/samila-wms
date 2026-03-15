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
import './App.css';

function App() {
  const { t, i18n } = useTranslation();
  const [backendStatus, setBackendStatus] = useState('checking');
  const [backendData, setBackendData] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');

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
              <span className={`header-user-role role-${currentUser.role}`}>{currentUser.roleLabel}</span>
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
                    href="#product"
                    className={`nav-link ${activeMenu === 'product' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('product')}
                  >
                    🏷️ {t('menu.product') || 'Product'}
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
                    href="#putaway"
                    className={`nav-link ${activeMenu === 'putaway' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('putaway')}
                  >
                    🏷️ Putaway
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
                    href="#warehouse-setting"
                    className={`nav-link ${activeMenu === 'warehouse-setting' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('warehouse-setting')}
                  >
                    🏭 Warehouse
                  </a>
                </li>
                <li>
                  <a
                    href="#user-limit"
                    className={`nav-link ${activeMenu === 'user-limit' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('user-limit')}
                  >
                    🔢 User Limit
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
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="main-content main-content-dark">

          {/* Dynamic Page Rendering */}
          {activeMenu === 'dashboard'  && <Dashboard />}
          {activeMenu === 'receiving'  && <ReceivingModule />}
          {activeMenu === 'inventory'  && <InventoryModule />}
          {activeMenu === 'product'    && <ProductModule />}
          {activeMenu === 'picking'    && <PickingModule />}
          {activeMenu === 'shipping'   && <ShippingModule />}
          {activeMenu === 'tarif'      && <TarifManagement />}
          {activeMenu === 'customer'   && <CustomerModule />}
          {activeMenu === 'reports'    && <ReportsModule />}
          {activeMenu === 'users'             && <UsersModule />}
          {activeMenu === 'warehouse-setting' && <SettingsModule defaultTab="warehouse" />}
          {activeMenu === 'user-limit'        && <SettingsModule defaultTab="userlimit" />}
          {activeMenu === 'settings'          && <SettingsModule />}
          {activeMenu === 'kpi'        && <KPIModule />}
          {activeMenu === 'putaway'    && <PutawayModule />}

          {/* Default home content (hidden when module active) */}
          {!['dashboard','receiving','inventory','product','picking','putaway','shipping','tarif','customer','reports','users','warehouse-setting','user-limit','settings','kpi'].includes(activeMenu) && (
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
            <strong>BB Innovation</strong> © 2026 |
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
