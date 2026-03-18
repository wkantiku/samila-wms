import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../Settings/SettingsModule.css';

// ── Auto Company No. ──────────────────────────────────────────────────────────
const nextCompanyNo = (companies) => {
  const nums = companies.map(c => parseInt((c.companyNo || 'COMP-000').split('-')[1] || '0', 10));
  const max  = nums.length ? Math.max(...nums) : 0;
  return `COMP-${String(max + 1).padStart(3, '0')}`;
};

// ── Seed data ─────────────────────────────────────────────────────────────────
const INIT_COMPANIES = [
  {
    companyNo: 'COMP-001', name: 'SAMILA 3PL Co., Ltd.', taxId: '0107559000123',
    address: '123 Logistics Park, Bangkok 10400', phone: '02-123-4567',
    email: 'info@samila.th', currency: 'THB', dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Bangkok', language: 'th', sessionTimeout: '30', active: true,
  },
];

const EMPTY_COMPANY = {
  companyNo: '', name: '', taxId: '', address: '', phone: '', email: '',
  currency: 'THB', dateFormat: 'DD/MM/YYYY', timezone: 'Asia/Bangkok',
  language: 'th', sessionTimeout: '30', active: true,
};

const INIT_WH = [
  { id: 1, companyNo: 'COMP-001', name: 'Warehouse Bangkok',      code: 'WH-BKK', province: 'กรุงเทพฯ',  address: '123 Logistics Park, ลาดกระบัง กรุงเทพฯ 10520', type: 'General + Cold Chain', zones: 8,  staff: 24, icon: '🏙️', capacity: 5000, used: 3200, active: true  },
  { id: 2, companyNo: 'COMP-001', name: 'Warehouse Nonthaburi',   code: 'WH-NTB', province: 'นนทบุรี',    address: '88 Industrial Zone, บางใหญ่ นนทบุรี 11140',   type: 'General',              zones: 5,  staff: 12, icon: '🏭', capacity: 3000, used: 1800, active: true  },
  { id: 3, companyNo: 'COMP-001', name: 'Warehouse Pathum Thani', code: 'WH-PTN', province: 'ปทุมธานี',   address: '55 Free Trade Zone, คลองหลวง ปทุมธานี 12120',  type: 'Distribution Center',  zones: 12, staff: 35, icon: '🏗️', capacity: 8000, used: 2100, active: true  },
  { id: 4, companyNo: 'COMP-001', name: 'Warehouse Trang',        code: 'WH-TRG', province: 'ตรัง',        address: '12 Port Logistics, เมือง ตรัง 92000',          type: 'General',              zones: 4,  staff: 10, icon: '🌴', capacity: 2000, used: 800,  active: true  },
  { id: 5, companyNo: 'COMP-001', name: 'Warehouse Chiang Mai',   code: 'WH-CNX', province: 'เชียงใหม่',  address: '77 Northern Hub, เมือง เชียงใหม่ 50000',       type: 'General + Hazmat',     zones: 6,  staff: 18, icon: '⛰️', capacity: 4000, used: 1200, active: true  },
  { id: 6, companyNo: 'COMP-001', name: 'Warehouse Hat Yai',      code: 'WH-HYD', province: 'สงขลา',       address: '45 Southern Gate, หาดใหญ่ สงขลา 90110',        type: 'General',              zones: 3,  staff: 8,  icon: '🌊', capacity: 1500, used: 0,    active: false },
];

const EMPTY_WH = { companyNo: '', name: '', code: '', province: '', address: '', type: 'General', zones: '', staff: '', icon: '🏭', capacity: '', active: true };

// ── Initial user limits per company ──────────────────────────────────────────
const INIT_LIMITS = { 'COMP-001': 50 };

// ── Menu pages ────────────────────────────────────────────────────────────────
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

const allOn  = () => Object.fromEntries(ALL_PAGES.map(p => [p.key, true]));
const allOff = () => Object.fromEntries(ALL_PAGES.map(p => [p.key, false]));

const emptyUserForm = () => ({
  firstName: '', lastName: '', name: '', username: '', email: '',
  password: '', confirmPw: '', warehouses: [],
  status: 'active', menus: allOff(), companyNo: '',
});

// ── Component ─────────────────────────────────────────────────────────────────
export default function SuperAdminModule({ currentUser, users, setUsers }) {
  const { i18n } = useTranslation();
  const [tab, setTab] = useState('profile');

  // ── Profile ──────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name:  currentUser?.name  || '',
    email: currentUser?.email || '',
    password: '', confirmPw: '',
  });
  const [showProfPw, setShowProfPw] = useState(false);
  const [profError,  setProfError]  = useState('');
  const [profSaved,  setProfSaved]  = useState(false);

  const saveProfile = () => {
    if (!profile.name.trim()) { setProfError('กรุณากรอกชื่อ'); return; }
    if (profile.password && profile.password !== profile.confirmPw) { setProfError('รหัสผ่านไม่ตรงกัน'); return; }
    setProfError('');
    setUsers(prev => prev.map(u => {
      if (u.id !== currentUser.id) return u;
      const updated = { ...u, name: profile.name.trim(), email: profile.email };
      if (profile.password) updated.password = profile.password;
      return updated;
    }));
    setProfile(p => ({ ...p, password: '', confirmPw: '' }));
    setProfSaved(true);
    setTimeout(() => setProfSaved(false), 2500);
  };

  // ── Companies (General) ──────────────────────────────────────────────────
  const [companies, setCompanies] = useState(() => {
    try { const s = localStorage.getItem('wms_sa_companies'); return s ? JSON.parse(s) : INIT_COMPANIES; } catch { return INIT_COMPANIES; }
  });
  useEffect(() => { localStorage.setItem('wms_sa_companies', JSON.stringify(companies)); }, [companies]);

  const [compForm, setCompForm] = useState(() => {
    try { const s = localStorage.getItem('wms_sa_companies'); const c = s ? JSON.parse(s) : INIT_COMPANIES; return { ...EMPTY_COMPANY, companyNo: nextCompanyNo(c) }; } catch { return { ...EMPTY_COMPANY, companyNo: nextCompanyNo(INIT_COMPANIES) }; }
  });
  const [editCompNo,   setEditCompNo]   = useState(null);  // companyNo being edited
  const [compError,    setCompError]    = useState('');
  const [compSaved,    setCompSaved]    = useState(false);
  const [delCompNo,    setDelCompNo]    = useState(null);
  const [expandedComp, setExpandedComp] = useState(null); // accordion

  const openAddComp = () => {
    setCompForm({ ...EMPTY_COMPANY, companyNo: nextCompanyNo(companies) });
    setEditCompNo(null); setCompError('');
  };
  const openEditComp = (c) => {
    setCompForm({ ...c });
    setEditCompNo(c.companyNo); setCompError('');
    setExpandedComp(c.companyNo);
  };
  const saveComp = () => {
    if (!compForm.name.trim()) { setCompError('กรุณากรอกชื่อบริษัท'); return; }
    setCompError('');

    if (editCompNo) {
      const updated = companies.map(c =>
        c.companyNo === editCompNo ? { ...compForm, companyNo: editCompNo } : c
      );
      setCompanies(updated);
      setCompForm({ ...EMPTY_COMPANY, companyNo: nextCompanyNo(updated) });
      setEditCompNo(null);
    } else {
      const compNo = compForm.companyNo || nextCompanyNo(companies);
      const newEntry = { ...compForm, companyNo: compNo };
      const updated = [...companies, newEntry];
      setCompanies(updated);
      setUserLimits(prev => ({ ...prev, [compNo]: 20 }));
      setCompForm({ ...EMPTY_COMPANY, companyNo: nextCompanyNo(updated) });
    }

    setCompSaved(true);
    setTimeout(() => setCompSaved(false), 2500);
  };
  const cancelComp = () => {
    setCompForm({ ...EMPTY_COMPANY, companyNo: nextCompanyNo(companies) });
    setEditCompNo(null); setCompError('');
  };
  const deleteComp = () => {
    setCompanies(prev => prev.filter(c => c.companyNo !== delCompNo));
    setDelCompNo(null);
  };
  const toggleCompActive = (no) => setCompanies(prev => prev.map(c => c.companyNo === no ? { ...c, active: !c.active } : c));

  // ── Warehouses ───────────────────────────────────────────────────────────
  const [whs, setWhs] = useState(() => {
    try { const s = localStorage.getItem('wms_sa_whs'); return s ? JSON.parse(s) : INIT_WH; } catch { return INIT_WH; }
  });
  useEffect(() => { localStorage.setItem('wms_sa_whs', JSON.stringify(whs)); }, [whs]);
  const [showWhModal, setShowWhModal] = useState(false);
  const [editWhId,    setEditWhId]    = useState(null);
  const [whForm,      setWhForm]      = useState(EMPTY_WH);
  const [whError,     setWhError]     = useState('');
  const [whFilter,    setWhFilter]    = useState('ALL'); // filter by companyNo

  const openAddWh  = () => { setWhForm({ ...EMPTY_WH, companyNo: companies[0]?.companyNo || '' }); setEditWhId(null); setWhError(''); setShowWhModal(true); };
  const openEditWh = (w) => { setWhForm({ ...w }); setEditWhId(w.id); setWhError(''); setShowWhModal(true); };
  const toggleWhActive = (id) => setWhs(p => p.map(w => w.id === id ? { ...w, active: !w.active } : w));
  const deleteWh = (id) => setWhs(p => p.filter(w => w.id !== id));

  const saveWh = () => {
    if (!whForm.companyNo) { setWhError('กรุณาเลือก Company'); return; }
    if (!whForm.name.trim() || !whForm.code.trim() || !whForm.province.trim() || !whForm.capacity) {
      setWhError('กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, รหัส, จังหวัด, ขนาดตารางเมตร)'); return;
    }
    if (!editWhId && whs.find(w => w.code.toUpperCase() === whForm.code.trim().toUpperCase())) {
      setWhError('รหัสคลังนี้มีอยู่แล้ว'); return;
    }
    if (editWhId) {
      setWhs(p => p.map(w => w.id === editWhId ? { ...w, ...whForm, capacity: +whForm.capacity, zones: +whForm.zones || 0, staff: +whForm.staff || 0 } : w));
    } else {
      setWhs(p => [...p, { ...whForm, id: Date.now(), capacity: +whForm.capacity, zones: +whForm.zones || 0, staff: +whForm.staff || 0, used: 0 }]);
    }
    setShowWhModal(false);
  };

  const filteredWhs = whFilter === 'ALL' ? whs : whs.filter(w => w.companyNo === whFilter);

  // ── User Limits (per company) ─────────────────────────────────────────────
  const [userLimits, setUserLimits] = useState(() => {
    try { const s = localStorage.getItem('wms_sa_limits'); return s ? JSON.parse(s) : INIT_LIMITS; } catch { return INIT_LIMITS; }
  });
  useEffect(() => { localStorage.setItem('wms_sa_limits', JSON.stringify(userLimits)); }, [userLimits]);
  const [limitSaved, setLimitSaved] = useState(false);

  // ── Users ────────────────────────────────────────────────────────────────
  const regularUsers = users.filter(u => u.role !== 'superadmin');
  const [userForm,   setUserForm]   = useState(emptyUserForm());
  const [editUserId, setEditUserId] = useState(null);
  const [userError,  setUserError]  = useState('');
  const [showUPw,    setShowUPw]    = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);

  const toggleWh = (whName) => {
    setUserForm(p => {
      const has = p.warehouses.includes(whName);
      return { ...p, warehouses: has ? p.warehouses.filter(w => w !== whName) : [...p.warehouses, whName] };
    });
  };
  const openEditUser = (u) => {
    const parts = (u.name || '').split(' ');
    setUserForm({ ...u, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '', password: '', confirmPw: '' });
    setEditUserId(u.id); setUserError(''); setShowUPw(false);
  };
  const saveUser = () => {
    if (!userForm.firstName || !userForm.username) { setUserError('กรุณากรอกชื่อและ Username'); return; }
    if (!editUserId && !userForm.password)          { setUserError('กรุณากรอกรหัสผ่าน'); return; }
    if (userForm.password && userForm.password !== userForm.confirmPw) { setUserError('รหัสผ่านไม่ตรงกัน'); return; }
    setUserError('');
    const fullName = `${userForm.firstName} ${userForm.lastName}`.trim();
    const data = { ...userForm, name: fullName };
    if (editUserId) {
      setUsers(prev => prev.map(u => {
        if (u.id !== editUserId) return u;
        const updated = { ...u, ...data };
        if (!userForm.password) updated.password = u.password;
        return updated;
      }));
    } else {
      setUsers(prev => [...prev, { ...data, id: Date.now(), lastLogin: '-' }]);
    }
    setUserForm(emptyUserForm()); setEditUserId(null);
  };
  const deleteUser = () => { setUsers(p => p.filter(u => u.id !== deleteId)); setDeleteId(null); };
  const toggleStatus = (id) => setUsers(p => p.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="wms-module settings-module">

      {/* Header */}
      <div className="module-header">
        <div className="header-left">
          <h1>👑 Super Admin</h1>
          <span className="header-sub" style={{ color: '#FFD700' }}>
            เข้าถึงได้เฉพาะ Super Admin — Full Access All Modules
          </span>
        </div>
        <div className="header-right">
          <div style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', color: '#FFD700', fontSize: 12, fontWeight: 600 }}>
            👑 {currentUser?.name || 'Super Admin'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="module-tabs">
        {[
          { key: 'profile',   label: '👑 Profile' },
          { key: 'general',   label: '🏢 Companies' },
          { key: 'warehouse', label: '🏭 Warehouses' },
          { key: 'userlimit', label: '🔢 User Limit' },
          { key: 'users',     label: '👥 จัดการ Users' },
        ].map(tb => (
          <button key={tb.key} className={`tab-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>
            {tb.label}
          </button>
        ))}
      </div>

      <div className="module-content">

        {/* ══════════════════════════════════════════════════════════
            PROFILE
        ══════════════════════════════════════════════════════════ */}
        {tab === 'profile' && (
          <div className="settings-section">
            <div className="settings-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 18 }}>

              <div className="settings-card">
                <div className="settings-card-title">👑 ข้อมูลส่วนตัว Super Admin</div>
                <div className="form-group">
                  <label>ชื่อ-นามสกุล *</label>
                  <input type="text" value={profile.name}
                    onChange={e => { setProfile(p => ({ ...p, name: e.target.value })); setProfError(''); }}
                    placeholder="ชื่อ-นามสกุล" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Username (ไม่สามารถเปลี่ยนได้)</label>
                  <input type="text" value={currentUser?.username || ''} disabled style={{ opacity: 0.45, cursor: 'not-allowed' }} />
                </div>
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(0,229,255,0.1)', paddingTop: 12 }}>
                  <div className="settings-card-title" style={{ fontSize: 12, marginBottom: 10 }}>🔑 เปลี่ยนรหัสผ่าน</div>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label>Password ใหม่</label>
                    <input type={showProfPw ? 'text' : 'password'} value={profile.password}
                      onChange={e => setProfile(p => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••" style={{ paddingRight: 36, width: '100%', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowProfPw(v => !v)}
                      style={{ position: 'absolute', right: 8, bottom: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#5a8fa8', fontSize: 14, padding: 0 }}>
                      {showProfPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {profile.password && (
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input type={showProfPw ? 'text' : 'password'} value={profile.confirmPw}
                        onChange={e => setProfile(p => ({ ...p, confirmPw: e.target.value }))}
                        placeholder="••••••••"
                        style={{ width: '100%', boxSizing: 'border-box',
                          borderColor: profile.confirmPw && profile.password !== profile.confirmPw ? '#FF6B6B'
                            : profile.confirmPw && profile.password === profile.confirmPw ? '#00CC88' : undefined }} />
                    </div>
                  )}
                </div>
                {profError && <div style={{ color: '#FF6B6B', fontSize: 12, marginBottom: 10 }}>{profError}</div>}
                <button className="primary-btn" onClick={saveProfile} style={{ width: '100%' }}>
                  {profSaved ? '✓ บันทึกแล้ว' : '💾 บันทึก Profile'}
                </button>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">🔐 สิทธิ์ Super Admin</div>
                <p style={{ color: '#7ecadf', fontSize: 13, marginBottom: 12, lineHeight: 1.7 }}>
                  Super Admin มีสิทธิ์เข้าถึงและแก้ไขได้ครบทุก Module:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                  {ALL_PAGES.map(p => (
                    <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 9px', borderRadius: 6, background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.18)', fontSize: 12, color: '#7ecadf' }}>
                      <span style={{ color: '#00CC88', fontWeight: 700, flexShrink: 0 }}>✓</span>{p.label}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.22)', color: '#FFD700', fontSize: 12, lineHeight: 1.6 }}>
                  ⚠️ ข้อมูล Profile ของ Super Admin สามารถดูและแก้ไขได้เฉพาะในหน้านี้เท่านั้น
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            COMPANIES (General)
        ══════════════════════════════════════════════════════════ */}
        {tab === 'general' && (
          <div className="settings-section">

            {/* Summary bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#00E5FF' }}>{companies.length}</div>
                  <div style={{ fontSize: 11, color: '#5a8fa8' }}>บริษัททั้งหมด</div>
                </div>
                <div style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(0,204,136,0.08)', border: '1px solid rgba(0,204,136,0.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#00CC88' }}>{companies.filter(c => c.active).length}</div>
                  <div style={{ fontSize: 11, color: '#5a8fa8' }}>Active</div>
                </div>
              </div>
              <div style={{ flex: 1 }} />
              {compSaved && <span style={{ color: '#00CC88', fontSize: 13, fontWeight: 600 }}>✓ บันทึกแล้ว</span>}
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

              {/* LEFT: Form */}
              <div className="emp-form-card" style={{ flex: '0 0 44%', minWidth: 280 }}>
                <div className="settings-card-title" style={{ marginBottom: 12 }}>
                  {editCompNo ? '✏️ แก้ไขบริษัท' : '➕ เพิ่มบริษัทใหม่'}
                </div>

                {/* Auto Company No. */}
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11 }}>Company No. (Auto)</label>
                  <input type="text" value={compForm.companyNo} disabled
                    style={{ width: '100%', boxSizing: 'border-box', fontSize: 13, padding: '5px 8px', fontWeight: 700, color: '#00E5FF', opacity: 1, cursor: 'default', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.25)' }} />
                </div>

                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11 }}>ชื่อบริษัท *</label>
                  <input type="text" placeholder="SAMILA 3PL Co., Ltd."
                    style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 7px' }}
                    value={compForm.name}
                    onChange={e => { setCompForm(p => ({ ...p, name: e.target.value })); setCompError(''); }} />
                </div>

                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11 }}>เลขที่ผู้เสียภาษี</label>
                  <input type="text" placeholder="0107559000123"
                    style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 7px' }}
                    value={compForm.taxId}
                    onChange={e => setCompForm(p => ({ ...p, taxId: e.target.value }))} />
                </div>

                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11 }}>ที่อยู่</label>
                  <textarea rows={2} placeholder="123 Logistics Park, Bangkok 10400"
                    style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 7px', resize: 'vertical' }}
                    value={compForm.address}
                    onChange={e => setCompForm(p => ({ ...p, address: e.target.value }))} />
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>โทรศัพท์</label>
                    <input type="text" placeholder="02-123-4567"
                      style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 7px' }}
                      value={compForm.phone}
                      onChange={e => setCompForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>Email</label>
                    <input type="email" placeholder="info@company.th"
                      style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 7px' }}
                      value={compForm.email}
                      onChange={e => setCompForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>สกุลเงิน</label>
                    <select style={{ width: '100%', fontSize: 12, padding: '5px 7px' }}
                      value={compForm.currency} onChange={e => setCompForm(p => ({ ...p, currency: e.target.value }))}>
                      <option>THB</option><option>USD</option><option>EUR</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>รูปแบบวันที่</label>
                    <select style={{ width: '100%', fontSize: 12, padding: '5px 7px' }}
                      value={compForm.dateFormat} onChange={e => setCompForm(p => ({ ...p, dateFormat: e.target.value }))}>
                      <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>Timezone</label>
                    <select style={{ width: '100%', fontSize: 12, padding: '5px 7px' }}
                      value={compForm.timezone} onChange={e => setCompForm(p => ({ ...p, timezone: e.target.value }))}>
                      <option>Asia/Bangkok</option><option>UTC</option><option>Asia/Singapore</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>ภาษา</label>
                    <select style={{ width: '100%', fontSize: 12, padding: '5px 7px' }}
                      value={compForm.language}
                      onChange={e => {
                        const lang = e.target.value;
                        setCompForm(p => ({ ...p, language: lang }));
                        i18n.changeLanguage(lang);
                        localStorage.setItem('language', lang);
                      }}>
                      <option value="th">ภาษาไทย</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>Session Timeout (นาที)</label>
                    <input type="number" min="5" max="480" placeholder="30"
                      style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 7px' }}
                      value={compForm.sessionTimeout}
                      onChange={e => setCompForm(p => ({ ...p, sessionTimeout: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>สถานะ</label>
                    <select style={{ width: '100%', fontSize: 12, padding: '5px 7px' }}
                      value={compForm.active ? 'active' : 'inactive'}
                      onChange={e => setCompForm(p => ({ ...p, active: e.target.value === 'active' }))}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {compError && <div className="emp-error" style={{ fontSize: 11, marginBottom: 8 }}>{compError}</div>}

                <div className="emp-form-actions">
                  {editCompNo && (
                    <button className="cancel-btn" style={{ fontSize: 12 }} onClick={cancelComp}>ยกเลิก</button>
                  )}
                  {!editCompNo && (
                    <button className="cancel-btn" style={{ fontSize: 12 }} onClick={cancelComp}>ล้างฟอร์ม</button>
                  )}
                  {!editCompNo && (
                    <button className="primary-btn" style={{ fontSize: 12 }} onClick={saveComp}>
                      ➕ เพิ่มบริษัท
                    </button>
                  )}
                  <button className="primary-btn" style={{ fontSize: 12, background: 'linear-gradient(135deg,#00897B,#00695C)' }} onClick={saveComp}>
                    💾 SAVE
                  </button>
                </div>
              </div>

              {/* RIGHT: Company list */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div className="settings-card-title" style={{ margin: 0 }}>📋 รายการบริษัท</div>
                  <button className="primary-btn" style={{ fontSize: 12 }} onClick={openAddComp}>➕ เพิ่มบริษัท</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {companies.map(c => {
                    const whCount  = whs.filter(w => w.companyNo === c.companyNo).length;
                    const ulimit   = userLimits[c.companyNo] || 0;
                    const isExp    = expandedComp === c.companyNo;
                    return (
                      <div key={c.companyNo} style={{
                        borderRadius: 10, border: `1px solid ${c.active ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                        background: c.active ? 'rgba(0,229,255,0.04)' : 'rgba(255,255,255,0.02)',
                        overflow: 'hidden',
                      }}>
                        {/* Company row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                          {/* Company No. badge */}
                          <div style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF', fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: 'monospace' }}>
                            {c.companyNo}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: c.active ? '#cce4ef' : '#5a8fa8', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: '#5a8fa8', marginTop: 1 }}>{c.taxId} &nbsp;·&nbsp; {c.phone}</div>
                          </div>
                          {/* mini stats */}
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: 'rgba(0,188,212,0.1)', color: '#7ecadf', border: '1px solid rgba(0,188,212,0.2)' }}>
                              🏭 {whCount} WH
                            </span>
                            <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: 'rgba(0,204,136,0.1)', color: '#00CC88', border: '1px solid rgba(0,204,136,0.2)' }}>
                              👥 max {ulimit}
                            </span>
                            <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: c.active ? 'rgba(0,204,136,0.1)' : 'rgba(255,107,107,0.1)', color: c.active ? '#00CC88' : '#FF6B6B', border: `1px solid ${c.active ? 'rgba(0,204,136,0.25)' : 'rgba(255,107,107,0.25)'}` }}>
                              {c.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {/* actions */}
                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                            <button className="icon-btn" title="ขยาย/ย่อ"
                              onClick={() => setExpandedComp(isExp ? null : c.companyNo)}
                              style={{ fontSize: 12 }}>{isExp ? '▲' : '▼'}</button>
                            <button className="icon-btn" title="แก้ไข" onClick={() => openEditComp(c)}>✏️</button>
                            <button className={`status-toggle ${c.active ? 'active' : 'inactive'}`} style={{ fontSize: 11, padding: '3px 8px' }}
                              onClick={() => toggleCompActive(c.companyNo)}>
                              {c.active ? 'Active' : 'Inactive'}
                            </button>
                            <button className="icon-btn icon-btn-del" title="ลบ" onClick={() => setDelCompNo(c.companyNo)}>🗑</button>
                          </div>
                        </div>

                        {/* Expanded detail */}
                        {isExp && (
                          <div style={{ padding: '10px 14px 12px', borderTop: '1px solid rgba(0,229,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px 16px', fontSize: 12 }}>
                            {[
                              { label: 'ที่อยู่',         val: c.address },
                              { label: 'Email',           val: c.email },
                              { label: 'สกุลเงิน',        val: c.currency },
                              { label: 'รูปแบบวันที่',    val: c.dateFormat },
                              { label: 'Timezone',        val: c.timezone },
                              { label: 'ภาษา',            val: c.language === 'th' ? 'ภาษาไทย' : 'English' },
                              { label: 'Session Timeout', val: `${c.sessionTimeout} นาที` },
                            ].map(({ label, val }) => (
                              <div key={label}>
                                <div style={{ color: '#5a8fa8', fontSize: 10, marginBottom: 2 }}>{label}</div>
                                <div style={{ color: '#b0cdd8', fontWeight: 500 }}>{val || '-'}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {companies.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 30, color: '#3a6a82', fontSize: 13 }}>ยังไม่มีบริษัท — กดปุ่ม ➕ เพิ่มบริษัท</div>
                  )}
                </div>
              </div>
            </div>

            {/* Delete Company confirm */}
            {delCompNo && (
              <div className="modal-overlay" onClick={() => setDelCompNo(null)}>
                <div className="modal-box modal-sm" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>🗑️ ลบบริษัท</h2>
                    <button className="modal-close" onClick={() => setDelCompNo(null)}>✕</button>
                  </div>
                  <div className="modal-body">
                    <p style={{ color: '#b0cdd8', fontSize: 14 }}>
                      ยืนยันลบบริษัท <strong style={{ color: '#FF6B6B' }}>{companies.find(c => c.companyNo === delCompNo)?.name}</strong>
                      &nbsp;(<span style={{ color: '#FFD700', fontFamily: 'monospace' }}>{delCompNo}</span>)?<br />
                      <span style={{ color: '#5a8fa8', fontSize: 12 }}>Warehouse และ User Limit ที่ผูกกับบริษัทนี้จะต้องอัพเดตแยกต่างหาก</span>
                    </p>
                  </div>
                  <div className="modal-footer">
                    <button className="cancel-btn" onClick={() => setDelCompNo(null)}>ยกเลิก</button>
                    <button className="delete-confirm-btn" onClick={deleteComp}>🗑️ ลบ</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            WAREHOUSES
        ══════════════════════════════════════════════════════════ */}
        {tab === 'warehouse' && (
          <div className="settings-section">
            <div className="section-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="section-toolbar-title">🏭 จัดการคลังสินค้า</div>
                {/* Filter by company */}
                <select style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6 }}
                  value={whFilter} onChange={e => setWhFilter(e.target.value)}>
                  <option value="ALL">ทุกบริษัท</option>
                  {companies.map(c => (
                    <option key={c.companyNo} value={c.companyNo}>{c.companyNo} — {c.name}</option>
                  ))}
                </select>
              </div>
              <button className="primary-btn" onClick={openAddWh}>➕ เพิ่ม Warehouse</button>
            </div>

            <div className="wh-grid">
              {filteredWhs.map(wh => {
                const pct   = wh.capacity > 0 ? Math.round((wh.used / wh.capacity) * 100) : 0;
                const color = pct >= 85 ? '#FF6B6B' : pct >= 65 ? '#FFD700' : '#00CC88';
                const comp  = companies.find(c => c.companyNo === wh.companyNo);
                return (
                  <div key={wh.id} className={`wh-setting-card ${!wh.active ? 'wh-setting-inactive' : ''}`}>
                    {!wh.active && <span className="wh-inactive-badge">INACTIVE</span>}
                    {/* Company No. tag */}
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'monospace', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', color: '#FFD700' }}>
                        {wh.companyNo}
                      </span>
                      {comp && <span style={{ marginLeft: 6, fontSize: 11, color: '#5a8fa8' }}>{comp.name}</span>}
                    </div>
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
                        <button className="icon-btn icon-btn-del" title="ลบ" onClick={() => deleteWh(wh.id)}>🗑</button>
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
                      <span className="wh-cap-label">ขนาด</span>
                      <span className="wh-cap-num" style={{ color }}>{wh.used.toLocaleString()} / {wh.capacity.toLocaleString()} ตร.ม.</span>
                    </div>
                    <div className="wh-bar-bg">
                      <div className="wh-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
              {filteredWhs.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 30, color: '#3a6a82', fontSize: 13 }}>ไม่มี Warehouse ในบริษัทนี้</div>
              )}
            </div>

            {/* Warehouse Modal */}
            {showWhModal && (
              <div className="modal-overlay" onClick={() => setShowWhModal(false)}>
                <div className="modal-box modal-md" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>{editWhId ? '✏️ แก้ไข Warehouse' : '➕ เพิ่ม Warehouse ใหม่'}</h2>
                    <button className="modal-close" onClick={() => setShowWhModal(false)}>✕</button>
                  </div>
                  <div className="modal-body">

                    {/* Company reference */}
                    <div className="form-group" style={{ marginBottom: 10 }}>
                      <label>🏢 Company No. (Reference)</label>
                      <select
                        value={whForm.companyNo || companies[0]?.companyNo || ''}
                        onChange={e => setWhForm(p => ({ ...p, companyNo: e.target.value }))}
                        style={{ fontFamily: 'monospace', fontWeight: 700, color: '#FFD700' }}>
                        {companies.length === 0 && <option value="">-- ไม่มีบริษัท --</option>}
                        {companies.map(c => (
                          <option key={c.companyNo} value={c.companyNo}>{c.companyNo} — {c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>ชื่อ Warehouse</label>
                        <input type="text" value={whForm.name}
                          onChange={e => { setWhForm(p => ({ ...p, name: e.target.value })); setWhError(''); }}
                          placeholder="Warehouse Bangkok" />
                      </div>
                      <div className="form-group">
                        <label>รหัส</label>
                        <input type="text" value={whForm.code}
                          onChange={e => { setWhForm(p => ({ ...p, code: e.target.value.toUpperCase() })); setWhError(''); }}
                          placeholder="WH-BKK" />
                      </div>
                    </div>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>จังหวัด</label>
                        <input type="text" value={whForm.province}
                          onChange={e => { setWhForm(p => ({ ...p, province: e.target.value })); setWhError(''); }}
                          placeholder="กรุงเทพฯ" />
                      </div>
                      <div className="form-group">
                        <label>ประเภท</label>
                        <select value={whForm.type} onChange={e => setWhForm(p => ({ ...p, type: e.target.value }))}>
                          <option>General</option><option>General + Cold Chain</option>
                          <option>General + Hazmat</option><option>Distribution Center</option>
                          <option>Cold Chain</option><option>Cross-Dock</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>ที่อยู่</label>
                      <input type="text" value={whForm.address}
                        onChange={e => setWhForm(p => ({ ...p, address: e.target.value }))}
                        placeholder="123 Logistics Park, ..." />
                    </div>
                    <div className="form-row-3">
                      <div className="form-group">
                        <label>ขนาดตารางเมตร (ตร.ม.)</label>
                        <input type="number" min="1" value={whForm.capacity}
                          onChange={e => { setWhForm(p => ({ ...p, capacity: e.target.value })); setWhError(''); }} placeholder="5000" />
                      </div>
                      <div className="form-group">
                        <label>Zones</label>
                        <input type="number" min="0" value={whForm.zones}
                          onChange={e => setWhForm(p => ({ ...p, zones: e.target.value }))} placeholder="8" />
                      </div>
                      <div className="form-group">
                        <label>Staff</label>
                        <input type="number" min="0" value={whForm.staff}
                          onChange={e => setWhForm(p => ({ ...p, staff: e.target.value }))} placeholder="24" />
                      </div>
                    </div>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Icon (Emoji)</label>
                        <input type="text" maxLength={4} value={whForm.icon}
                          onChange={e => setWhForm(p => ({ ...p, icon: e.target.value }))}
                          placeholder="🏭" style={{ fontSize: 20 }} />
                      </div>
                      <div className="form-group">
                        <label>สถานะ</label>
                        <select value={whForm.active ? 'active' : 'inactive'}
                          onChange={e => setWhForm(p => ({ ...p, active: e.target.value === 'active' }))}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    {whError && <div className="emp-error">{whError}</div>}
                  </div>
                  <div className="modal-footer">
                    <button className="cancel-btn" onClick={() => setShowWhModal(false)}>ยกเลิก</button>
                    <button className="primary-btn" onClick={saveWh}>{editWhId ? '💾 บันทึก' : '➕ เพิ่ม'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            USER LIMIT (per company)
        ══════════════════════════════════════════════════════════ */}
        {tab === 'userlimit' && (
          <div className="settings-section">
            <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="primary-btn"
                onClick={() => { setLimitSaved(true); setTimeout(() => setLimitSaved(false), 2500); }}>
                {limitSaved ? '✓ บันทึกแล้ว' : '💾 บันทึก User Limits'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {companies.map(c => {
                const limit = userLimits[c.companyNo] || 0;
                const used  = regularUsers.filter(u => u.companyNo === c.companyNo).length;
                const pct   = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;
                const color = pct >= 90 ? '#FF6B6B' : pct >= 70 ? '#FFD700' : '#00CC88';
                return (
                  <div key={c.companyNo} className="settings-card" style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      {/* Company No. + Name */}
                      <span style={{ padding: '3px 10px', borderRadius: 5, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', color: '#FFD700', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', flexShrink: 0 }}>
                        {c.companyNo}
                      </span>
                      <span style={{ fontWeight: 700, color: '#cce4ef', fontSize: 13, flex: 1, minWidth: 140 }}>{c.name}</span>

                      {/* Progress */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 2, minWidth: 200 }}>
                        <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: 'monospace', lineHeight: 1 }}>
                          {used}
                          <span style={{ fontSize: 14, color: '#5a8fa8', fontWeight: 400 }}> / {limit}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7ecadf', marginBottom: 3 }}>
                            <span>Users</span><span style={{ color, fontWeight: 700 }}>{pct}%</span>
                          </div>
                          <div style={{ height: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(0,229,255,0.1)' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
                          </div>
                        </div>
                      </div>

                      {/* Input */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <label style={{ fontSize: 11, color: '#7ecadf', whiteSpace: 'nowrap' }}>Max Users:</label>
                        <input type="number" min="1" value={limit}
                          onChange={e => setUserLimits(prev => ({ ...prev, [c.companyNo]: +e.target.value || 1 }))}
                          style={{ width: 70, fontWeight: 700, color: '#00E5FF', fontSize: 14, textAlign: 'center', padding: '4px 6px' }} />
                      </div>
                    </div>
                  </div>
                );
              })}

              {companies.length === 0 && (
                <div style={{ textAlign: 'center', padding: 30, color: '#3a6a82', fontSize: 13 }}>ยังไม่มีบริษัท — กรุณาเพิ่มบริษัทใน tab Companies ก่อน</div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            USERS
        ══════════════════════════════════════════════════════════ */}
        {tab === 'users' && (
          <div className="settings-section">
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

              {/* LEFT: form */}
              <div className="emp-form-card" style={{ flex: '0 0 50%', minWidth: 260 }}>
                <div className="settings-card-title" style={{ fontSize: 13, marginBottom: 12 }}>
                  {editUserId ? '✏️ แก้ไขข้อมูล User' : '➕ เพิ่ม User ใหม่'}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>ชื่อ *</label>
                    <input type="text" maxLength={20} placeholder="สมชาย"
                      style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 7px' }}
                      value={userForm.firstName}
                      onChange={e => { setUserForm(p => ({ ...p, firstName: e.target.value })); setUserError(''); }} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>นามสกุล</label>
                    <input type="text" maxLength={20} placeholder="ใจดี"
                      style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 7px' }}
                      value={userForm.lastName}
                      onChange={e => setUserForm(p => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11 }}>Username *</label>
                  <input type="text" placeholder="somchai"
                    style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 7px' }}
                    value={userForm.username}
                    onChange={e => { setUserForm(p => ({ ...p, username: e.target.value })); setUserError(''); }} />
                </div>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11 }}>Email</label>
                  <input type="email" maxLength={50} placeholder="somchai@samila.th"
                    style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 7px' }}
                    value={userForm.email}
                    onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div className="form-group" style={{ flex: 2, marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>🏢 Company</label>
                    <select style={{ width: '100%', fontSize: 12, padding: '5px 7px', fontFamily: 'monospace', fontWeight: 700, color: '#FFD700' }}
                      value={userForm.companyNo}
                      onChange={e => setUserForm(p => ({ ...p, companyNo: e.target.value }))}>
                      <option value="">-- ไม่ระบุ --</option>
                      {companies.map(c => (
                        <option key={c.companyNo} value={c.companyNo}>{c.companyNo} — {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>Status</label>
                    <select style={{ width: '100%', fontSize: 12, padding: '5px 7px' }}
                      value={userForm.status} onChange={e => setUserForm(p => ({ ...p, status: e.target.value }))}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 8, position: 'relative' }}>
                    <label style={{ fontSize: 11 }}>{editUserId ? 'Password ใหม่' : 'Password *'}</label>
                    <input type={showUPw ? 'text' : 'password'} placeholder="••••••"
                      style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 24px 5px 7px' }}
                      value={userForm.password}
                      onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} />
                    <button type="button" onClick={() => setShowUPw(v => !v)}
                      style={{ position: 'absolute', right: 5, bottom: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#5a8fa8', fontSize: 12, padding: 0 }}>
                      {showUPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 8 }}>
                    <label style={{ fontSize: 11 }}>Confirm</label>
                    <input type={showUPw ? 'text' : 'password'} placeholder="••••••"
                      style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 7px',
                        borderColor: userForm.confirmPw && userForm.password !== userForm.confirmPw ? '#FF6B6B'
                          : userForm.confirmPw && userForm.password === userForm.confirmPw ? '#00CC88' : undefined }}
                      value={userForm.confirmPw}
                      onChange={e => setUserForm(p => ({ ...p, confirmPw: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11 }}>🏭 Warehouse</label>
                  {!userForm.companyNo ? (
                    <div style={{ fontSize: 11, color: '#3a6a82', padding: '6px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      กรุณาเลือก Company ก่อน
                    </div>
                  ) : (() => {
                    const compWhs = whs.filter(w => w.companyNo === userForm.companyNo && w.active);
                    if (compWhs.length === 0) return (
                      <div style={{ fontSize: 11, color: '#3a6a82', padding: '6px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        ไม่มี Warehouse ในบริษัทนี้
                      </div>
                    );
                    return (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {compWhs.map(w => {
                          const checked = userForm.warehouses.includes(w.name);
                          return (
                            <label key={w.id} className={`wh-checkbox-item ${checked ? 'checked' : ''}`}
                              style={{ fontSize: 11, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <input type="checkbox" checked={checked} onChange={() => toggleWh(w.name)} />
                              <span>{w.icon} {w.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
                {userError && <div className="emp-error" style={{ fontSize: 11, marginBottom: 8 }}>{userError}</div>}
                <div className="emp-form-actions">
                  {editUserId && (
                    <button className="cancel-btn" style={{ fontSize: 12 }}
                      onClick={() => { setUserForm(emptyUserForm()); setEditUserId(null); setUserError(''); }}>
                      ยกเลิก
                    </button>
                  )}
                  <button className="primary-btn" style={{ fontSize: 12 }} onClick={saveUser}>
                    {editUserId ? '💾 บันทึก' : '➕ เพิ่ม User'}
                  </button>
                </div>
              </div>

              {/* RIGHT: permissions */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="emp-perm-section">
                  <div className="emp-perm-header">
                    <span className="emp-perm-title">🔐 กำหนดสิทธิ์เมนู</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#5a8fa8' }}>
                        {Object.values(userForm.menus || {}).filter(Boolean).length}/{ALL_PAGES.length}
                      </span>
                      <button type="button" className="superadmin-ctrl-btn select-all"
                        onClick={() => setUserForm(p => ({ ...p, menus: allOn() }))}>✓ ทั้งหมด</button>
                      <button type="button" className="superadmin-ctrl-btn deselect-all"
                        onClick={() => setUserForm(p => ({ ...p, menus: allOff() }))}>✕ ล้าง</button>
                    </div>
                  </div>
                  <div className="emp-perm-grid">
                    {ALL_PAGES.map(page => {
                      const checked = userForm.menus?.[page.key] || false;
                      return (
                        <label key={page.key} className={`emp-perm-item ${checked ? 'checked' : ''}`}
                          onClick={() => setUserForm(p => ({ ...p, menus: { ...p.menus, [page.key]: !checked } }))}>
                          <span className="emp-perm-box">{checked ? '✓' : ''}</span>
                          <span className="emp-perm-label">{page.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Users table */}
            <div className="perm-table-wrap" style={{ marginTop: 16 }}>
              <table className="perm-table">
                <thead>
                  <tr>
                    <th>#</th><th>ชื่อ</th><th>Username</th><th>Email</th>
                    <th>Company</th><th>Warehouse</th><th style={{ textAlign: 'center' }}>สิทธิ์เมนู</th>
                    <th>Status</th><th style={{ textAlign: 'center' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {regularUsers.map((u, i) => {
                    const mc  = Object.values(u.menus || {}).filter(Boolean).length;
                    const tot = ALL_PAGES.length;
                    const pct = tot > 0 ? Math.round((mc / tot) * 100) : 0;
                    const bc  = pct === 100 ? '#00CC88' : pct >= 60 ? '#00BCD4' : pct >= 30 ? '#FFD700' : '#FF6B6B';
                    return (
                      <tr key={u.id} className={i % 2 === 1 ? 'perm-tr-alt' : ''}>
                        <td className="row-num">{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,188,212,0.15)', color: '#00E5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                              {u.name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600, color: '#cce4ef' }}>{u.name}</span>
                          </div>
                        </td>
                        <td><span className="mono" style={{ color: '#7ecadf', fontSize: 12 }}>{u.username}</span></td>
                        <td style={{ color: '#5a8fa8', fontSize: 12 }}>{u.email}</td>
                        <td>
                          {u.companyNo
                            ? <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'monospace', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', color: '#FFD700' }}>{u.companyNo}</span>
                            : <span style={{ color: '#3a6a82', fontSize: 11 }}>—</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {(u.warehouses || []).map(w => (
                              <span key={w} style={{ padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: w === 'All' ? 'rgba(0,229,255,0.12)' : 'rgba(0,188,212,0.08)', color: w === 'All' ? '#00E5FF' : '#7ecadf', border: `1px solid ${w === 'All' ? 'rgba(0,229,255,0.3)' : 'rgba(0,188,212,0.2)'}` }}>{w}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                            <div style={{ flex: 1, maxWidth: 80, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: bc, borderRadius: 3, transition: 'width 0.3s' }} />
                            </div>
                            <span style={{ fontSize: 11, color: bc, fontWeight: 700, whiteSpace: 'nowrap' }}>{mc}/{tot}</span>
                          </div>
                        </td>
                        <td>
                          <button className={`status-toggle ${u.status}`} onClick={() => toggleStatus(u.id)}>
                            {u.status === 'active' ? '● Active' : '○ Inactive'}
                          </button>
                        </td>
                        <td>
                          <div className="emp-row-actions">
                            <button className="icon-btn" title="แก้ไข" onClick={() => openEditUser(u)}>✏️</button>
                            <button className="icon-btn icon-btn-del" title="ลบ" onClick={() => setDeleteId(u.id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {regularUsers.length === 0 && (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: 20, color: '#3a6a82' }}>ยังไม่มี User</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {deleteId && (
              <div className="modal-overlay" onClick={() => setDeleteId(null)}>
                <div className="modal-box modal-sm" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>🗑️ ลบ User</h2>
                    <button className="modal-close" onClick={() => setDeleteId(null)}>✕</button>
                  </div>
                  <div className="modal-body">
                    <p style={{ color: '#b0cdd8', fontSize: 14 }}>
                      ยืนยันลบ <strong style={{ color: '#FF6B6B' }}>{users.find(u => u.id === deleteId)?.name}</strong>?<br />
                      <span style={{ color: '#5a8fa8', fontSize: 12 }}>การลบไม่สามารถเรียกคืนได้</span>
                    </p>
                  </div>
                  <div className="modal-footer">
                    <button className="cancel-btn" onClick={() => setDeleteId(null)}>ยกเลิก</button>
                    <button className="delete-confirm-btn" onClick={deleteUser}>🗑️ ลบ</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
