import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SettingsModule.css';

const warehouses = [
  { id: 1, name: 'Warehouse Bangkok',       code: 'WH-BKK', province: 'กรุงเทพฯ',   address: '123 Logistics Park, ลาดกระบัง กรุงเทพฯ 10520', type: 'General + Cold Chain', zones: 8,  staff: 24, icon: '🏙️', capacity: 5000, used: 3200, active: true  },
  { id: 2, name: 'Warehouse Nonthaburi',    code: 'WH-NTB', province: 'นนทบุรี',     address: '88 Industrial Zone, บางใหญ่ นนทบุรี 11140',    type: 'General',              zones: 5,  staff: 12, icon: '🏭', capacity: 3000, used: 1800, active: true  },
  { id: 3, name: 'Warehouse Pathum Thani', code: 'WH-PTN', province: 'ปทุมธานี',    address: '55 Free Trade Zone, คลองหลวง ปทุมธานี 12120',   type: 'Distribution Center',  zones: 12, staff: 35, icon: '🏗️', capacity: 8000, used: 2100, active: true  },
  { id: 4, name: 'Warehouse Trang',         code: 'WH-TRG', province: 'ตรัง',         address: '12 Port Logistics, เมือง ตรัง 92000',           type: 'General',              zones: 4,  staff: 10, icon: '🌴', capacity: 2000, used: 800,  active: true  },
  { id: 5, name: 'Warehouse Chiang Mai',    code: 'WH-CNX', province: 'เชียงใหม่',   address: '77 Northern Hub, เมือง เชียงใหม่ 50000',        type: 'General + Hazmat',     zones: 6,  staff: 18, icon: '⛰️', capacity: 4000, used: 1200, active: true  },
  { id: 6, name: 'Warehouse Hat Yai',       code: 'WH-HYD', province: 'สงขลา',        address: '45 Southern Gate, หาดใหญ่ สงขลา 90110',         type: 'General',              zones: 3,  staff: 8,  icon: '🌊', capacity: 1500, used: 0,    active: false },
];

const emptyWhForm = { name: '', code: '', province: '', address: '', type: 'General', zones: '', staff: '', icon: '🏭', capacity: '', active: true };

const tabs = [
  { key: 'general',     label: '⚙️ ทั่วไป' },
  { key: 'warehouse',   label: '🏭 คลังสินค้า' },
  { key: 'permissions', label: '🔐 กำหนดสิทธิ์' },
  { key: 'userlimit',   label: '👥 User Limit' },
  { key: 'notification',label: '🔔 การแจ้งเตือน' },
  { key: 'backup',      label: '💾 Backup & Log' },
];

const ALL_PAGES = [
  { key: 'dashboard',         label: '📊 Dashboard' },
  { key: 'receiving',         label: '📦 Receiving' },
  { key: 'inventory',         label: '📋 Inventory' },
  { key: 'product',           label: '🏷️ Product' },
  { key: 'picking',           label: '🔍 Picking' },
  { key: 'putaway',           label: '📌 Putaway' },
  { key: 'shipping',          label: '🚚 Shipping' },
  { key: 'tarif',             label: '💰 Tarif Management' },
  { key: 'customer',          label: '🏢 Customer' },
  { key: 'reports',           label: '📈 Reports' },
  { key: 'kpi',               label: '🎯 KPI Management' },
  { key: 'users',             label: '👥 Users' },
  { key: 'warehouse-setting', label: '🏭 Warehouse' },
  { key: 'user-limit',        label: '🔢 User Limit' },
  { key: 'settings',          label: '⚙️ Settings' },
];

const defaultAdminAccess = Object.fromEntries(ALL_PAGES.map(p => [p.key, true]));

const defaultUserLimits = {
  total:          { limit: 50,  label: 'Total Users',      color: '#00E5FF' },
  admin:          { limit: 2,   label: 'Admin',            color: '#FF6B6B' },
  manager:        { limit: 5,   label: 'Manager',          color: '#FFD700' },
  supervisor:     { limit: 8,   label: 'Supervisor',       color: '#FF8C42' },
  warehouse_admin:{ limit: 10,  label: 'Warehouse Admin',  color: '#9B7FFF' },
  leader:         { limit: 10,  label: 'Leader',           color: '#00BCD4' },
  operator:       { limit: 50,  label: 'Operator',         color: '#00CC88' },
};

const MODULES = [
  { key: 'dashboard',  label: '📊 Dashboard' },
  { key: 'receiving',  label: '📦 Receiving' },
  { key: 'inventory',  label: '📋 Inventory' },
  { key: 'product',    label: '🏷️ Product' },
  { key: 'picking',    label: '🔍 Picking' },
  { key: 'shipping',   label: '🚚 Shipping' },
  { key: 'tarif',      label: '💰 Tarif' },
  { key: 'reports',    label: '📈 Reports' },
  { key: 'users',      label: '👥 Users' },
  { key: 'settings',   label: '⚙️ Settings' },
];

const ROLES = [
  { key: 'admin',          label: 'Admin',          color: '#FF6B6B', desc: 'เข้าถึงทุกส่วนของระบบ' },
  { key: 'manager',        label: 'Manager',        color: '#FFD700', desc: 'จัดการงานปฏิบัติการทั้งหมด' },
  { key: 'supervisor',     label: 'Supervisor',     color: '#FF8C42', desc: 'ดูแลควบคุมการปฏิบัติงาน' },
  { key: 'warehouse_admin',label: 'Warehouse Admin',color: '#9B7FFF', desc: 'จัดการคลังสินค้า' },
  { key: 'leader',         label: 'Leader',         color: '#00BCD4', desc: 'หัวหน้าทีมปฏิบัติการ' },
  { key: 'operator',       label: 'Operator',       color: '#00CC88', desc: 'ปฏิบัติงานประจำวัน' },
];

const defaultPermissions = {
  admin:          { dashboard:true,  receiving:true,  inventory:true,  product:true,  picking:true,  shipping:true,  tarif:true,  reports:true,  users:true,  settings:true  },
  manager:        { dashboard:true,  receiving:true,  inventory:true,  product:true,  picking:true,  shipping:true,  tarif:true,  reports:true,  users:false, settings:false },
  supervisor:     { dashboard:true,  receiving:true,  inventory:true,  product:true,  picking:true,  shipping:true,  tarif:false, reports:true,  users:false, settings:false },
  warehouse_admin:{ dashboard:true,  receiving:true,  inventory:true,  product:true,  picking:false, shipping:false, tarif:false, reports:true,  users:false, settings:true  },
  leader:         { dashboard:true,  receiving:true,  inventory:true,  product:false, picking:true,  shipping:true,  tarif:false, reports:false, users:false, settings:false },
  operator:       { dashboard:true,  receiving:true,  inventory:true,  product:false, picking:true,  shipping:true,  tarif:false, reports:false, users:false, settings:false },
};

const initEmployees = [
  { id: 'EMP001', firstName: 'สมชาย',  lastName: 'ใจดี',    role: 'admin',          username: 'somchai',   password: '' },
  { id: 'EMP002', firstName: 'วิชัย',   lastName: 'สุวรรณ',  role: 'manager',        username: 'wichai',    password: '' },
  { id: 'EMP003', firstName: 'สุภาพร', lastName: 'รักดี',   role: 'supervisor',     username: 'supaporn',  password: '' },
  { id: 'EMP004', firstName: 'นภา',    lastName: 'ศรีสว่าง', role: 'warehouse_admin', username: 'napa',      password: '' },
  { id: 'EMP005', firstName: 'ธนา',    lastName: 'พรหมมา',  role: 'leader',         username: 'thana',     password: '' },
  { id: 'EMP006', firstName: 'ปรีชา',  lastName: 'มีสุข',   role: 'operator',       username: 'preecha',   password: '' },
];

const emptyEmpForm = { id: '', firstName: '', lastName: '', role: 'operator', username: '', password: '' };

function SettingsModule({ defaultTab }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(defaultTab || 'general');
  const [saved, setSaved] = useState(false);
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [permSaved, setPermSaved] = useState(false);
  const [userLimits, setUserLimits] = useState(defaultUserLimits);
  const [limitSaved, setLimitSaved] = useState(false);
  const [adminAccess, setAdminAccess] = useState(defaultAdminAccess);
  const [accessSaved, setAccessSaved] = useState(false);
  const [employees, setEmployees] = useState(initEmployees);
  const [empForm, setEmpForm]     = useState(emptyEmpForm);
  const [editEmpId, setEditEmpId] = useState(null);
  const [empError, setEmpError]   = useState('');
  const [permTab, setPermTab]     = useState('employees');

  /* General settings state */
  const [general, setGeneral] = useState({
    companyName: 'SAMILA 3PL Co., Ltd.',
    taxId: '0107559000123',
    address: '123 Logistics Park, Bangkok 10400',
    phone: '02-123-4567',
    email: 'info@samila.th',
    currency: 'THB',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Bangkok',
    language: i18n.language || 'th',
    sessionTimeout: '30',
  });

  /* Notification settings */
  const [notif, setNotif] = useState({
    emailLowStock: true,
    emailOrderDelay: true,
    emailDailyReport: false,
    lineNotify: false,
    lineToken: '',
    smsAlert: false,
    smsPhone: '',
    stockThreshold: '50',
  });

  const [whs, setWhs] = useState(warehouses);
  const [showWhModal, setShowWhModal] = useState(false);
  const [editWh, setEditWh] = useState(null);
  const [whForm, setWhForm] = useState(emptyWhForm);
  const [whError, setWhError] = useState('');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const openAddWh = () => {
    setWhForm(emptyWhForm);
    setEditWh(null);
    setWhError('');
    setShowWhModal(true);
  };

  const openEditWh = (wh) => {
    setWhForm({ name: wh.name, code: wh.code, province: wh.province, address: wh.address, type: wh.type, zones: wh.zones, staff: wh.staff, icon: wh.icon, capacity: wh.capacity, active: wh.active });
    setEditWh(wh.id);
    setWhError('');
    setShowWhModal(true);
  };

  const handleWhSave = () => {
    if (!whForm.name.trim() || !whForm.code.trim() || !whForm.province.trim() || !whForm.capacity) {
      setWhError('กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, รหัส, จังหวัด, ความจุ)');
      return;
    }
    if (!editWh && whs.find(w => w.code.toUpperCase() === whForm.code.trim().toUpperCase())) {
      setWhError('รหัสคลังนี้มีอยู่แล้ว');
      return;
    }
    if (editWh) {
      setWhs(prev => prev.map(w => w.id === editWh ? { ...w, ...whForm, capacity: +whForm.capacity, zones: +whForm.zones, staff: +whForm.staff } : w));
    } else {
      setWhs(prev => [...prev, { id: Date.now(), ...whForm, capacity: +whForm.capacity, zones: +whForm.zones || 0, staff: +whForm.staff || 0, used: 0 }]);
    }
    setShowWhModal(false);
  };

  const handleDeleteWh = (id) => {
    setWhs(prev => prev.filter(w => w.id !== id));
  };

  const toggleWhActive = (id) => {
    setWhs(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
  };

  return (
    <div className="wms-module settings-module">
      <div className="module-header">
        <div className="header-left">
          <h1>⚙️ {t('settings.title')}</h1>
          <span className="header-sub">System Settings</span>
        </div>
        <div className="header-right">
          {saved && <span className="save-toast">✓ {t('settings.saved')}</span>}
          <button className="primary-btn" onClick={handleSave}>💾 {t('settings.save')}</button>
        </div>
      </div>

      <div className="module-tabs">
        {(() => {
          const baseTabs = [
            { key: 'general',      label: t('settings.tabGeneral') },
            { key: 'permissions',  label: t('settings.tabPermissions') },
            { key: 'notification', label: t('settings.tabNotification') },
            { key: 'backup',       label: t('settings.tabBackup') },
          ];
          // เมื่อเปิดจาก sidebar โดยตรง ให้แสดง tab นั้นพร้อม back button
          const extraTabs = defaultTab === 'warehouse' ? [{ key: 'warehouse', label: t('settings.tabWarehouse') }]
                          : defaultTab === 'userlimit' ? [{ key: 'userlimit', label: '👥 User Limit' }]
                          : [];
          return [...extraTabs, ...baseTabs].map(tab => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ));
        })()}
      </div>

      <div className="module-content">

        {/* ===== GENERAL ===== */}
        {activeTab === 'general' && (
          <div className="settings-section">
            <div className="settings-grid">

              <div className="settings-card">
                <div className="settings-card-title">{t('settings.companyInfo')}</div>
                <div className="form-group">
                  <label>{t('settings.companyName')}</label>
                  <input type="text" value={general.companyName}
                    onChange={e => setGeneral(p => ({ ...p, companyName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>{t('settings.taxId')}</label>
                  <input type="text" value={general.taxId}
                    onChange={e => setGeneral(p => ({ ...p, taxId: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>{t('settings.address')}</label>
                  <textarea rows={2} value={general.address}
                    onChange={e => setGeneral(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>{t('settings.phone')}</label>
                    <input type="text" value={general.phone}
                      onChange={e => setGeneral(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>{t('settings.email')}</label>
                    <input type="email" value={general.email}
                      onChange={e => setGeneral(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">{t('settings.systemSettings')}</div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>{t('settings.currency')}</label>
                    <select value={general.currency}
                      onChange={e => setGeneral(p => ({ ...p, currency: e.target.value }))}>
                      <option>THB</option>
                      <option>USD</option>
                      <option>EUR</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('settings.dateFormat')}</label>
                    <select value={general.dateFormat}
                      onChange={e => setGeneral(p => ({ ...p, dateFormat: e.target.value }))}>
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Timezone</label>
                    <select value={general.timezone}
                      onChange={e => setGeneral(p => ({ ...p, timezone: e.target.value }))}>
                      <option>Asia/Bangkok</option>
                      <option>UTC</option>
                      <option>Asia/Singapore</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('settings.language')}</label>
                    <select value={general.language}
                      onChange={e => {
                        const lang = e.target.value;
                        setGeneral(p => ({ ...p, language: lang }));
                        i18n.changeLanguage(lang);
                        localStorage.setItem('language', lang);
                      }}>
                      <option value="th">ภาษาไทย</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('settings.sessionTimeout')}</label>
                  <input type="number" value={general.sessionTimeout}
                    onChange={e => setGeneral(p => ({ ...p, sessionTimeout: e.target.value }))} />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ===== PERMISSIONS ===== */}
        {activeTab === 'permissions' && (
          <div className="settings-section">

            {/* Sub-tabs */}
            <div className="perm-subtabs">
              <button className={`perm-subtab ${permTab === 'employees' ? 'active' : ''}`} onClick={() => setPermTab('employees')}>
                👤 พนักงานและสิทธิ์
              </button>
              <button className={`perm-subtab ${permTab === 'matrix' ? 'active' : ''}`} onClick={() => setPermTab('matrix')}>
                🔐 ตารางสิทธิ์ต่อ Role
              </button>
            </div>

            {/* ── SUB-TAB: EMPLOYEES ── */}
            {permTab === 'employees' && (<>

              {/* Employee form */}
              <div className="emp-form-card">
                <div className="settings-card-title">{editEmpId ? '✏️ แก้ไขข้อมูลพนักงาน' : '➕ เพิ่มพนักงาน / กำหนดสิทธิ์'}</div>
                <div className="emp-form-grid">
                  <div className="form-group">
                    <label>รหัสพนักงาน *</label>
                    <input type="text" placeholder="เช่น EMP007"
                      value={empForm.id}
                      onChange={e => { setEmpForm(p => ({ ...p, id: e.target.value })); setEmpError(''); }} />
                  </div>
                  <div className="form-group">
                    <label>ชื่อ *</label>
                    <input type="text" placeholder="ชื่อจริง"
                      value={empForm.firstName}
                      onChange={e => { setEmpForm(p => ({ ...p, firstName: e.target.value })); setEmpError(''); }} />
                  </div>
                  <div className="form-group">
                    <label>นามสกุล *</label>
                    <input type="text" placeholder="นามสกุล"
                      value={empForm.lastName}
                      onChange={e => { setEmpForm(p => ({ ...p, lastName: e.target.value })); setEmpError(''); }} />
                  </div>
                  <div className="form-group">
                    <label>บทบาท / สิทธิ์ *</label>
                    <select value={empForm.role} onChange={e => setEmpForm(p => ({ ...p, role: e.target.value }))}>
                      {ROLES.map(r => <option key={r.key} value={r.key}>{r.label} — {r.desc}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Username *</label>
                    <input type="text" placeholder="เช่น somchai"
                      value={empForm.username}
                      onChange={e => { setEmpForm(p => ({ ...p, username: e.target.value })); setEmpError(''); }} />
                  </div>
                  <div className="form-group">
                    <label>{editEmpId ? 'Password ใหม่ (ถ้าต้องการเปลี่ยน)' : 'Password *'}</label>
                    <input type="password" placeholder="••••••••"
                      value={empForm.password}
                      onChange={e => { setEmpForm(p => ({ ...p, password: e.target.value })); setEmpError(''); }} />
                  </div>
                </div>
                {empError && <div className="emp-error">{empError}</div>}
                <div className="emp-form-actions">
                  {editEmpId && (
                    <button className="cancel-btn" onClick={() => { setEmpForm(emptyEmpForm); setEditEmpId(null); setEmpError(''); }}>
                      ยกเลิก
                    </button>
                  )}
                  <button className="primary-btn" onClick={() => {
                    if (!empForm.id.trim() || !empForm.firstName.trim() || !empForm.lastName.trim() || !empForm.username.trim()) {
                      setEmpError('กรุณากรอกข้อมูลให้ครบถ้วน (รหัสพนักงาน, ชื่อ, นามสกุล, Username)');
                      return;
                    }
                    if (!editEmpId && !empForm.password.trim()) {
                      setEmpError('กรุณากรอก Password');
                      return;
                    }
                    if (!editEmpId && employees.find(e => e.id === empForm.id.trim())) {
                      setEmpError('รหัสพนักงานนี้มีอยู่แล้ว');
                      return;
                    }
                    if (!editEmpId && employees.find(e => e.username === empForm.username.trim())) {
                      setEmpError('Username นี้มีอยู่แล้ว');
                      return;
                    }
                    if (editEmpId) {
                      setEmployees(prev => prev.map(e => e.id === editEmpId ? { ...empForm, id: empForm.id.trim(), username: empForm.username.trim() } : e));
                      setEditEmpId(null);
                    } else {
                      setEmployees(prev => [...prev, { ...empForm, id: empForm.id.trim(), username: empForm.username.trim() }]);
                    }
                    setEmpForm(emptyEmpForm);
                    setEmpError('');
                  }}>
                    {editEmpId ? '💾 บันทึกการแก้ไข' : '➕ เพิ่มพนักงาน'}
                  </button>
                </div>
              </div>

              {/* Employee table */}
              <div className="perm-table-wrap" style={{ marginTop: '14px' }}>
                <table className="perm-table">
                  <thead>
                    <tr>
                      <th className="perm-th-module" style={{ width: '110px' }}>รหัสพนักงาน</th>
                      <th className="perm-th-module">ชื่อ - นามสกุล</th>
                      <th className="perm-th-module">Username</th>
                      <th className="perm-th-module">บทบาท</th>
                      <th className="perm-th-module" style={{ width: '90px', textAlign: 'center' }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, i) => {
                      const role = ROLES.find(r => r.key === emp.role);
                      return (
                        <tr key={emp.id} className={i % 2 === 1 ? 'perm-tr-alt' : ''}>
                          <td className="perm-td-module emp-id-cell">{emp.id}</td>
                          <td className="perm-td-module">{emp.firstName} {emp.lastName}</td>
                          <td className="perm-td-module"><span className="mono" style={{ fontSize: '12px', color: '#7ecadf' }}>{emp.username || '-'}</span></td>
                          <td className="perm-td-module">
                            <span className="emp-role-badge" style={{ background: `${role?.color}20`, color: role?.color, border: `1px solid ${role?.color}40` }}>
                              {role?.label}
                            </span>
                          </td>
                          <td className="perm-td-check">
                            <div className="emp-row-actions">
                              <button className="icon-btn" title="แก้ไข" onClick={() => { setEmpForm({ id: emp.id, firstName: emp.firstName, lastName: emp.lastName, role: emp.role, username: emp.username || '', password: '' }); setEditEmpId(emp.id); setEmpError(''); }}>✏️</button>
                              <button className="icon-btn icon-btn-del" title="ลบ" onClick={() => setEmployees(prev => prev.filter(e => e.id !== emp.id))}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {employees.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#3a6a82', fontSize: '13px' }}>ยังไม่มีพนักงาน</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>)}

            {/* ── SUB-TAB: MATRIX ── */}
            {permTab === 'matrix' && (<>
              <div className="perm-role-legend">
                {ROLES.map(r => (
                  <div key={r.key} className="perm-role-pill">
                    <span className="perm-role-dot" style={{ background: r.color }} />
                    <span className="perm-role-name" style={{ color: r.color }}>{r.label}</span>
                    <span className="perm-role-desc">{r.desc}</span>
                  </div>
                ))}
              </div>

              <div className="perm-table-wrap">
                <table className="perm-table">
                  <thead>
                    <tr>
                      <th className="perm-th-module">โมดูล</th>
                      {ROLES.map(r => (
                        <th key={r.key} className="perm-th-role" style={{ color: r.color }}>{r.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((mod, mi) => (
                      <tr key={mod.key} className={mi % 2 === 1 ? 'perm-tr-alt' : ''}>
                        <td className="perm-td-module">{mod.label}</td>
                        {ROLES.map(role => {
                          const checked = permissions[role.key][mod.key];
                          const locked = role.key === 'admin';
                          return (
                            <td key={role.key} className="perm-td-check">
                              <label className={`perm-toggle ${locked ? 'perm-locked' : ''}`}>
                                <input type="checkbox" checked={checked} disabled={locked}
                                  onChange={() => { if (locked) return;
                                    setPermissions(prev => ({ ...prev, [role.key]: { ...prev[role.key], [mod.key]: !checked } }));
                                  }} />
                                <span className="perm-toggle-box" style={checked ? { background: role.color, borderColor: role.color } : {}}>
                                  {checked ? '✓' : ''}
                                </span>
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="perm-actions">
                <div className="perm-note">* Admin มีสิทธิ์เข้าถึงทุกโมดูล ไม่สามารถแก้ไขได้</div>
                <button className="primary-btn" onClick={() => { setPermSaved(true); setTimeout(() => setPermSaved(false), 2500); }}>
                  {permSaved ? '✓ บันทึกแล้ว' : '💾 บันทึกสิทธิ์'}
                </button>
              </div>
            </>)}

          </div>
        )}

        {/* ===== USER LIMIT ===== */}
        {activeTab === 'userlimit' && (() => {
          const countByRole = (role) => employees.filter(e => e.role === role).length;
          const totalUsed = employees.length;
          const totalLimit = userLimits.total.limit;
          const totalPct = Math.min(Math.round((totalUsed / totalLimit) * 100), 100);
          const totalColor = totalPct >= 90 ? '#FF6B6B' : totalPct >= 70 ? '#FFD700' : '#00CC88';

          return (
            <div className="settings-section">

              {/* Summary Card */}
              <div className="settings-card" style={{ marginBottom: 18 }}>
                <div className="settings-card-title">📊 สรุป User ทั้งหมดในระบบ</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 10 }}>
                  <div style={{ fontSize: 40, fontWeight: 900, color: totalColor, fontFamily: 'monospace' }}>
                    {totalUsed}
                    <span style={{ fontSize: 18, color: '#5a8fa8', fontWeight: 400 }}> / {totalLimit}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12, color: '#7ecadf' }}>
                      <span>Total Users</span>
                      <span style={{ color: totalColor, fontWeight: 700 }}>{totalPct}%</span>
                    </div>
                    <div style={{ height: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(0,229,255,0.15)' }}>
                      <div style={{ height: '100%', width: `${totalPct}%`, background: totalColor, borderRadius: 5, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                </div>
                <div className="form-group" style={{ maxWidth: 240 }}>
                  <label style={{ fontSize: 12, color: '#7ecadf' }}>กำหนด Max Users รวมทั้งระบบ</label>
                  <input
                    type="number" min="1"
                    value={userLimits.total.limit}
                    onChange={e => setUserLimits(p => ({ ...p, total: { ...p.total, limit: +e.target.value || 1 } }))}
                    style={{ fontWeight: 700, color: '#00E5FF', fontSize: 15 }}
                  />
                </div>
              </div>

              {/* User Limit */}
              <div className="settings-card">
                <div className="settings-card-title">👥 User Limit</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Role', 'Current Users', 'Max Limit', 'Usage', 'Set Limit'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#5a8fa8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(0,229,255,0.12)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROLES.filter(r => r.key === 'admin').map((role, i) => {
                      const used = countByRole(role.key);
                      const limit = userLimits[role.key]?.limit || 0;
                      const pct = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;
                      const barColor = pct >= 100 ? '#FF6B6B' : pct >= 80 ? '#FFD700' : role.color;
                      return (
                        <tr key={role.key} style={{ background: 'transparent' }}>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: `${role.color}20`, color: role.color, border: `1px solid ${role.color}40`, padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                              {role.label}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 14, color: '#cce4ef', fontWeight: 700, textAlign: 'center' }}>
                            {used}
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 14, color: barColor, fontWeight: 700, textAlign: 'center' }}>
                            {limit}
                          </td>
                          <td style={{ padding: '10px 12px', minWidth: 160 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(0,229,255,0.1)' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width 0.4s' }} />
                              </div>
                              <span style={{ fontSize: 11, color: barColor, fontWeight: 700, minWidth: 32 }}>{pct}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <input
                              type="number" min="0"
                              value={userLimits[role.key]?.limit ?? 0}
                              onChange={e => setUserLimits(p => ({ ...p, [role.key]: { ...p[role.key], limit: +e.target.value || 0 } }))}
                              style={{ width: 80, padding: '5px 8px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,188,212,0.4)', borderRadius: 5, color: '#fff', fontSize: 13, fontFamily: 'monospace', fontWeight: 700, textAlign: 'center' }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Warning if Admin at limit */}
                {countByRole('admin') >= (userLimits['admin']?.limit || 0) && (userLimits['admin']?.limit || 0) > 0 && (
                  <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6 }}>
                    <div style={{ color: '#FF6B6B', fontSize: 12, fontWeight: 700 }}>
                      ⚠️ Admin: {countByRole('admin')} / {userLimits['admin']?.limit} users (เต็มแล้ว)
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="primary-btn" onClick={() => { setLimitSaved(true); setTimeout(() => setLimitSaved(false), 2500); }}>
                    {limitSaved ? '✓ บันทึกแล้ว' : '💾 บันทึก User Limit'}
                  </button>
                </div>
              </div>

              {/* Permission Card */}
              <div className="settings-card" style={{ marginTop: 18 }}>
                <div className="settings-card-title">🔐 กำหนดสิทธิการใช้งาน — Admin</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
                  <button
                    onClick={() => setAdminAccess(Object.fromEntries(ALL_PAGES.map(p => [p.key, true])))}
                    style={{ padding: '4px 14px', fontSize: 11, fontWeight: 700, background: 'rgba(0,204,136,0.12)', color: '#00CC88', border: '1px solid rgba(0,204,136,0.3)', borderRadius: 4, cursor: 'pointer' }}
                  >
                    ✓ เลือกทั้งหมด
                  </button>
                  <button
                    onClick={() => setAdminAccess(Object.fromEntries(ALL_PAGES.map(p => [p.key, false])))}
                    style={{ padding: '4px 14px', fontSize: 11, fontWeight: 700, background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 4, cursor: 'pointer' }}
                  >
                    ✕ ยกเลิกทั้งหมด
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                  {ALL_PAGES.map(page => {
                    const checked = adminAccess[page.key] ?? true;
                    return (
                      <label
                        key={page.key}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', borderRadius: 7, cursor: 'pointer',
                          background: checked ? 'rgba(0,229,255,0.06)' : 'rgba(0,0,0,0.15)',
                          border: `1px solid ${checked ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                          background: checked ? '#00E5FF' : 'transparent',
                          border: `2px solid ${checked ? '#00E5FF' : 'rgba(0,229,255,0.35)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}>
                          {checked && <span style={{ color: '#002a3a', fontSize: 13, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setAdminAccess(p => ({ ...p, [page.key]: !p[page.key] }))}
                          style={{ display: 'none' }}
                        />
                        <span style={{ fontSize: 13, color: checked ? '#cce4ef' : '#3a6a82', fontWeight: checked ? 600 : 400 }}>
                          {page.label}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div style={{ marginTop: 6, fontSize: 11, color: '#3a6a82' }}>
                  เปิดใช้งาน {ALL_PAGES.filter(p => adminAccess[p.key]).length} / {ALL_PAGES.length} หน้า
                </div>

                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="primary-btn" onClick={() => { setAccessSaved(true); setTimeout(() => setAccessSaved(false), 2500); }}>
                    {accessSaved ? '✓ บันทึกแล้ว' : '💾 บันทึกสิทธิ์'}
                  </button>
                </div>
              </div>

            </div>
          );
        })()}

        {/* ===== WAREHOUSE ===== */}
        {activeTab === 'warehouse' && (
          <div className="settings-section">
            <div className="section-toolbar">
              <div className="section-toolbar-title">🏭 {t('menu.warehouse', 'จัดการคลังสินค้า')}</div>
              <button className="primary-btn" onClick={openAddWh}>{t('settings.addWarehouse')}</button>
            </div>

            <div className="wh-grid">
              {whs.map(wh => {
                const pct = Math.round((wh.used / wh.capacity) * 100);
                const color = pct >= 85 ? '#FF6B6B' : pct >= 65 ? '#FFD700' : '#00CC88';
                return (
                  <div key={wh.id} className={`wh-setting-card ${!wh.active ? 'wh-setting-inactive' : ''}`}>
                    {!wh.active && <span className="wh-inactive-badge">INACTIVE</span>}
                    <div className="wh-card-header">
                      <span className="wh-card-icon">{wh.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="wh-name">{wh.name}</div>
                        <div className="wh-code">{wh.code}</div>
                      </div>
                      <div className="wh-actions">
                        <button className={`status-toggle ${wh.active ? 'active' : 'inactive'}`} onClick={() => toggleWhActive(wh.id)}>
                          {wh.active ? 'Active' : 'Inactive'}
                        </button>
                        <button className="icon-btn" title="แก้ไข" onClick={() => openEditWh(wh)}>✏️</button>
                        <button className="icon-btn icon-btn-del" title="ลบ" onClick={() => handleDeleteWh(wh.id)}>🗑</button>
                      </div>
                    </div>

                    <div className="wh-location-row">📍 {wh.province} &nbsp;·&nbsp; <span className="wh-type-tag">{wh.type}</span></div>
                    {wh.address && <div className="wh-address">{wh.address}</div>}

                    <div className="wh-stats-mini">
                      <div className="wh-stat-mini"><span className="wh-stat-val">{wh.zones}</span><span className="wh-stat-lbl">Zones</span></div>
                      <div className="wh-stat-mini"><span className="wh-stat-val">{wh.staff}</span><span className="wh-stat-lbl">Staff</span></div>
                      <div className="wh-stat-mini"><span className="wh-stat-val" style={{ color }}>{pct}%</span><span className="wh-stat-lbl">Used</span></div>
                    </div>

                    <div className="wh-capacity-row">
                      <span className="wh-cap-label">ความจุ</span>
                      <span className="wh-cap-num" style={{ color }}>{wh.used.toLocaleString()} / {wh.capacity.toLocaleString()} ลัง</span>
                    </div>
                    <div className="wh-bar-bg">
                      <div className="wh-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== NOTIFICATION ===== */}
        {activeTab === 'notification' && (
          <div className="settings-section">
            <div className="settings-grid">

              <div className="settings-card">
                <div className="settings-card-title">📧 Email Notifications</div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <div className="toggle-label">แจ้งเตือน Stock ต่ำ</div>
                    <div className="toggle-sub">ส่ง email เมื่อ stock ต่ำกว่า threshold</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notif.emailLowStock}
                      onChange={e => setNotif(p => ({ ...p, emailLowStock: e.target.checked }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <div className="toggle-label">แจ้งเตือน Order ล่าช้า</div>
                    <div className="toggle-sub">ส่ง email เมื่อ order เกิน SLA</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notif.emailOrderDelay}
                      onChange={e => setNotif(p => ({ ...p, emailOrderDelay: e.target.checked }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <div className="toggle-label">รายงานประจำวัน</div>
                    <div className="toggle-sub">ส่งสรุปรายวันทุก 08:00 น.</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notif.emailDailyReport}
                      onChange={e => setNotif(p => ({ ...p, emailDailyReport: e.target.checked }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label>Stock Threshold (%)</label>
                  <input type="number" value={notif.stockThreshold}
                    onChange={e => setNotif(p => ({ ...p, stockThreshold: e.target.value }))} />
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">💬 LINE Notify</div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <div className="toggle-label">เปิดใช้ LINE Notify</div>
                    <div className="toggle-sub">ส่งการแจ้งเตือนผ่าน LINE</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notif.lineNotify}
                      onChange={e => setNotif(p => ({ ...p, lineNotify: e.target.checked }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                {notif.lineNotify && (
                  <div className="form-group">
                    <label>LINE Notify Token</label>
                    <input type="text" placeholder="token..." value={notif.lineToken}
                      onChange={e => setNotif(p => ({ ...p, lineToken: e.target.value }))} />
                  </div>
                )}

                <div className="settings-card-title" style={{ marginTop: '16px' }}>📱 SMS Alert</div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <div className="toggle-label">เปิดใช้ SMS</div>
                    <div className="toggle-sub">ส่ง SMS แจ้งเตือนเร่งด่วน</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notif.smsAlert}
                      onChange={e => setNotif(p => ({ ...p, smsAlert: e.target.checked }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                {notif.smsAlert && (
                  <div className="form-group">
                    <label>เบอร์โทร</label>
                    <input type="text" placeholder="0812345678" value={notif.smsPhone}
                      onChange={e => setNotif(p => ({ ...p, smsPhone: e.target.value }))} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== BACKUP & LOG ===== */}
        {activeTab === 'backup' && (
          <div className="settings-section">
            <div className="settings-grid">

              <div className="settings-card">
                <div className="settings-card-title">💾 Backup ข้อมูล</div>
                <div className="backup-info-row">
                  <span className="backup-info-label">Backup ล่าสุด</span>
                  <span className="backup-info-val">2026-03-11 03:00:00</span>
                </div>
                <div className="backup-info-row">
                  <span className="backup-info-label">ขนาด</span>
                  <span className="backup-info-val">124.7 MB</span>
                </div>
                <div className="backup-info-row">
                  <span className="backup-info-label">ตำแหน่ง</span>
                  <span className="backup-info-val">/backup/samila_20260311.sql</span>
                </div>
                <div className="backup-btn-row">
                  <button className="primary-btn">⬇️ ดาวน์โหลด Backup</button>
                  <button className="secondary-btn">🔄 Backup ทันที</button>
                </div>
                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label>ตั้งเวลา Auto Backup</label>
                  <select defaultValue="daily">
                    <option value="hourly">ทุกชั่วโมง</option>
                    <option value="daily">ทุกวัน (03:00)</option>
                    <option value="weekly">ทุกสัปดาห์</option>
                    <option value="manual">Manual เท่านั้น</option>
                  </select>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">📋 System Logs</div>
                <div className="log-list">
                  {[
                    { time: '09:12:34', type: 'INFO',  msg: 'User somchai logged in' },
                    { time: '09:05:11', type: 'INFO',  msg: 'Import 3 inventory items completed' },
                    { time: '08:55:00', type: 'WARN',  msg: 'Stock SKU004 below threshold (60)' },
                    { time: '08:30:22', type: 'INFO',  msg: 'Daily report generated' },
                    { time: '03:00:01', type: 'INFO',  msg: 'Auto backup completed successfully' },
                    { time: '2026-03-10 22:14', type: 'ERROR', msg: 'API timeout on /api/orders' },
                    { time: '2026-03-10 18:00', type: 'INFO',  msg: 'System maintenance completed' },
                  ].map((log, i) => (
                    <div key={i} className="log-row">
                      <span className="log-time">{log.time}</span>
                      <span className={`log-type ${log.type.toLowerCase()}`}>{log.type}</span>
                      <span className="log-msg">{log.msg}</span>
                    </div>
                  ))}
                </div>
                <button className="secondary-btn" style={{ marginTop: '10px', width: '100%' }}>📥 ดาวน์โหลด Full Log</button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Warehouse Modal */}
      {showWhModal && (
        <div className="modal-overlay" onClick={() => setShowWhModal(false)}>
          <div className="modal-box modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editWh ? `✏️ ${t('settings.editWarehouse')}` : `➕ ${t('settings.addWarehouseTitle')}`}</h2>
              <button className="modal-close" onClick={() => setShowWhModal(false)}>✕</button>
            </div>
            <div className="modal-body">

              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('settings.warehouseName')}</label>
                  <input type="text" value={whForm.name}
                    onChange={e => { setWhForm(p => ({ ...p, name: e.target.value })); setWhError(''); }}
                    placeholder="Warehouse Bangkok" />
                </div>
                <div className="form-group">
                  <label>{t('settings.warehouseCode')}</label>
                  <input type="text" value={whForm.code}
                    onChange={e => { setWhForm(p => ({ ...p, code: e.target.value.toUpperCase() })); setWhError(''); }}
                    placeholder="WH-BKK" />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('settings.province')}</label>
                  <input type="text" value={whForm.province}
                    onChange={e => { setWhForm(p => ({ ...p, province: e.target.value })); setWhError(''); }}
                    placeholder="กรุงเทพฯ" />
                </div>
                <div className="form-group">
                  <label>{t('settings.warehouseType')}</label>
                  <select value={whForm.type} onChange={e => setWhForm(p => ({ ...p, type: e.target.value }))}>
                    <option>General</option>
                    <option>General + Cold Chain</option>
                    <option>General + DG</option>
                    <option>Distribution Center</option>
                    <option>Cold Chain</option>
                    <option>DG</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{t('settings.warehouseAddress')}</label>
                <input type="text" value={whForm.address}
                  onChange={e => setWhForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="123 Logistics Park, ลาดกระบัง กรุงเทพฯ 10520" />
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>{t('settings.capacity')}</label>
                  <input type="number" value={whForm.capacity}
                    onChange={e => { setWhForm(p => ({ ...p, capacity: e.target.value })); setWhError(''); }}
                    placeholder="5000" min="0" />
                </div>
                <div className="form-group">
                  <label>{t('settings.zones')}</label>
                  <input type="number" value={whForm.zones}
                    onChange={e => setWhForm(p => ({ ...p, zones: e.target.value }))}
                    placeholder="8" min="0" />
                </div>
                <div className="form-group">
                  <label>{t('settings.staff')}</label>
                  <input type="number" value={whForm.staff}
                    onChange={e => setWhForm(p => ({ ...p, staff: e.target.value }))}
                    placeholder="24" min="0" />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('settings.icon')} (Emoji)</label>
                  <input type="text" value={whForm.icon}
                    onChange={e => setWhForm(p => ({ ...p, icon: e.target.value }))}
                    placeholder="🏭" style={{ fontSize: '20px' }} />
                </div>
                <div className="form-group">
                  <label>{t('settings.status')}</label>
                  <select value={whForm.active ? 'active' : 'inactive'}
                    onChange={e => setWhForm(p => ({ ...p, active: e.target.value === 'active' }))}>
                    <option value="active">Active — {t('settings.activeWarehouse')}</option>
                    <option value="inactive">Inactive — {t('settings.inactiveWarehouse')}</option>
                  </select>
                </div>
              </div>

              {whError && <div className="emp-error">{whError}</div>}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowWhModal(false)}>{t('common.cancel')}</button>
              <button className="primary-btn" onClick={handleWhSave}>💾 {t('common.save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsModule;
