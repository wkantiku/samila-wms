import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userService } from '../../services/userService';
import { warehouseApi } from '../../services/api';
import './UsersModule.css';

const FALLBACK_WHS = [
  { id: 1, companyNo: 'COMP-001', name: 'Warehouse Bangkok',      code: 'WH-BKK', icon: '🏙️', active: true },
  { id: 2, companyNo: 'COMP-001', name: 'Warehouse Nonthaburi',   code: 'WH-NTB', icon: '🏭', active: true },
  { id: 3, companyNo: 'COMP-001', name: 'Warehouse Pathum Thani', code: 'WH-PTN', icon: '🏗️', active: true },
  { id: 4, companyNo: 'COMP-001', name: 'Warehouse Trang',        code: 'WH-TRG', icon: '🌴', active: true },
  { id: 5, companyNo: 'COMP-001', name: 'Warehouse Chiang Mai',   code: 'WH-CNX', icon: '⛰️', active: true },
  { id: 6, companyNo: 'COMP-001', name: 'Warehouse Hat Yai',      code: 'WH-HYD', icon: '🌊', active: false },
];

const ALL_PAGES = [
  { key: 'dashboard',         label: '📊 Dashboard' },
  { key: 'receiving',         label: '📦 Receiving' },
  { key: 'inventory',         label: '📋 Inventory' },
  { key: 'product',           label: '🏷️ Product' },
  { key: 'picking',           label: '🔍 Picking' },
  { key: 'putaway',           label: '📌 Putaway' },
  { key: 'packing',           label: '📦 Packing' },
  { key: 'shipping',          label: '🚚 Shipping' },
  { key: 'tarif',             label: '💰 Tarif Management' },
  { key: 'customer',          label: '🏢 Customer' },
  { key: 'reports',           label: '📈 Reports' },
  { key: 'kpi',               label: '🎯 KPI Management' },
  { key: 'mobile',            label: '📱 Mobile Worker' },
  { key: 'users',             label: '👥 Users' },
  { key: 'settings',          label: '⚙️ Settings' },
];
const makeMenuPerm = (on = false) => ({ view: on, add: on, edit: on, delete: on });
const allMenusOn  = () => Object.fromEntries(ALL_PAGES.map(p => [p.key, makeMenuPerm(true)]));
const allMenusOff = () => Object.fromEntries(ALL_PAGES.map(p => [p.key, makeMenuPerm(false)]));

// รองรับทั้ง format เดิม (boolean) และ format ใหม่ (object)
const normalizeMenus = (m) => Object.fromEntries(ALL_PAGES.map(p => {
  const v = m?.[p.key];
  if (v && typeof v === 'object') return [p.key, { view: !!v.view, add: !!v.add, edit: !!v.edit, delete: !!v.delete }];
  return [p.key, makeMenuPerm(!!v)];
}));

const makeEmptyForm = () => ({
  name: '', username: '', email: '', companyNo: '',
  warehouses: ['Warehouse A'], status: 'active', password: '',
  menus: allMenusOff(),
});

const loadCompanies = () => {
  try { const s = localStorage.getItem('wms_sa_companies'); return s ? JSON.parse(s) : []; } catch { return []; }
};

export default function UsersModule({ users, setUsers, currentUser }) {
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin      = currentUser?.role === 'admin';
  const myCompanyNo  = currentUser?.companyNo || '';
  const { t } = useTranslation();

  useEffect(() => {
    userService.getAll().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setUsers(prev => {
          const localPwMap = Object.fromEntries(prev.map(u => [u.id, u.password]));
          return data.map(u => ({ ...u, password: localPwMap[u.id] || u.password || '(API)' }));
        });
      }
    }).catch(() => {});
  }, []);

  const [allWhs, setAllWhs] = useState(FALLBACK_WHS);
  useEffect(() => {
    warehouseApi.list().then(data => {
      if (data && data.length > 0) setAllWhs(data);
    }).catch(() => {});
  }, []);

  const [search, setSearch]       = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(makeEmptyForm);
  const [formError, setFormError] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [deleteId, setDeleteId]   = useState(null);

  // Change Password modal
  const [changePwTarget, setChangePwTarget] = useState(null);
  const [changePwForm, setChangePwForm]     = useState({ oldPw: '', newPw: '', confirmPw: '' });
  const [changePwError, setChangePwError]   = useState('');
  const [showCPwNew, setShowCPwNew]         = useState(false);

  const regularUsers = users.filter(u => u.role !== 'superadmin');
  // admin sees only users within their own company; superadmin sees all
  const scopedUsers = (isSuperAdmin || !myCompanyNo)
    ? regularUsers
    : regularUsers.filter(u => u.companyNo === myCompanyNo);
  const filtered = scopedUsers.filter(u =>
    (u.name || '').includes(search) || (u.username || '').includes(search) || (u.email || '').includes(search)
  );

  const openAdd  = () => {
    const base = makeEmptyForm();
    // admin: default new user to their own company
    if (!isSuperAdmin && myCompanyNo) base.companyNo = myCompanyNo;
    setForm(base); setFormError(''); setConfirmPw(''); setShowPw(false); setEditId(null); setShowForm(true);
  };
  const openEdit = (u) => {
    const wh = Array.isArray(u.warehouses) ? u.warehouses : ['Warehouse A'];
    setForm({ ...u, password: '', warehouses: wh, menus: normalizeMenus(u.menus) });
    setConfirmPw(''); setShowPw(false); setFormError('');
    setEditId(u.id); setShowForm(true);
  };

  const toggleWarehouse = (wh) => {
    if (wh === 'All') {
      setForm(prev => ({ ...prev, warehouses: prev.warehouses.includes('All') ? [] : ['All'] }));
    } else {
      setForm(prev => {
        const without = prev.warehouses.filter(w => w !== 'All');
        const has = without.includes(wh);
        return { ...prev, warehouses: has ? without.filter(w => w !== wh) : [...without, wh] };
      });
    }
  };

  const closeForm = () => { setShowForm(false); setEditId(null); setFormError(''); setConfirmPw(''); setShowPw(false); };

  const handleSave = () => {
    if (!form.name || !form.username) { setFormError('กรุณากรอกชื่อ และ Username ให้ครบถ้วน'); return; }
    const pw = form.password.trim();
    if (!editId && !pw)    { setFormError('กรุณากรอกรหัสผ่าน'); return; }
    if (pw && pw.length < 6) { setFormError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (pw && pw !== confirmPw.trim()) { setFormError('รหัสผ่านไม่ตรงกัน'); return; }
    setFormError('');
    if (editId) {
      const payload = { name: form.name, email: form.email, role: form.role, status: form.status, menus: form.menus, warehouses: form.warehouses };
      userService.update(editId, payload).catch(() => {});
      setUsers(prev => prev.map(u => {
        if (u.id !== editId) return u;
        const updated = { ...u, ...form };
        if (!pw) updated.password = u.password; else updated.password = pw;
        return updated;
      }));
    } else {
      userService.create({ ...form, confirmPassword: confirmPw }).then(created => {
        if (created?.id) setUsers(prev => prev.map(u => u.id === Date.now() ? { ...u, id: created.id } : u));
      }).catch(() => {});
      setUsers(prev => [...prev, { ...form, id: Date.now(), lastLogin: '-' }]);
    }
    closeForm();
  };

  const handleDelete = () => {
    userService.delete(deleteId).catch(() => {});
    setUsers(prev => prev.filter(u => u.id !== deleteId));
    setDeleteId(null);
  };
  const toggleStatus = (id) => {
    const user = users.find(u => u.id === id);
    if (user) {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      userService.update(id, { status: newStatus }).catch(() => {});
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  const openChangePw = (u) => {
    setChangePwTarget(u);
    setChangePwForm({ oldPw: '', newPw: '', confirmPw: '' });
    setChangePwError(''); setShowCPwNew(false);
  };

  const handleChangePw = () => {
    if (!changePwForm.newPw) { setChangePwError('กรุณากรอกรหัสผ่านใหม่'); return; }
    if (changePwForm.newPw.length < 6) { setChangePwError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (changePwForm.newPw !== changePwForm.confirmPw) { setChangePwError('รหัสผ่านใหม่ไม่ตรงกัน'); return; }
    userService.changePassword(changePwTarget.id, changePwForm.oldPw || '', changePwForm.newPw).catch(() => {});
    setUsers(prev => prev.map(u => u.id === changePwTarget.id ? { ...u, password: changePwForm.newPw } : u));
    setChangePwTarget(null);
  };

  return (
    <div className="wms-module users-module">
      <div className="module-header">
        <div className="header-left">
          <h1>👥 {t('users.title')}</h1>
          <p>{t('users.subtitle')}</p>
        </div>
        <div className="header-right">
          {isAdmin && myCompanyNo && (
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', fontWeight: 700, color: '#FFD700', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', marginRight: 10 }}>
              {myCompanyNo}
            </span>
          )}
          <button className="create-btn" onClick={openAdd}>➕ {t('users.addUser')}</button>
        </div>
      </div>

      {/* Summary */}
      <div className="users-summary">
        {[
          { label: t('users.total'), value: scopedUsers.length,                                      color: '#00E5FF' },
          { label: 'Active',         value: scopedUsers.filter(u => u.status === 'active').length,   color: '#00CC88' },
          { label: 'Inactive',       value: scopedUsers.filter(u => u.status === 'inactive').length, color: '#FF6B6B' },
        ].map((s, i) => (
          <div key={i} className="users-stat">
            <div className="users-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="users-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="controls" style={{ marginBottom: 14 }}>
        <input type="search" placeholder={t('users.searchPlaceholder')} value={search}
          onChange={e => setSearch(e.target.value)} style={{ minWidth: 240 }} />
      </div>

      {/* Table */}
      <div className="users-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('users.colName')}</th>
              <th>Username</th>
              <th>Email</th>
              <th>Company</th>
              <th>Warehouse</th>
              <th>{t('users.colLastLogin')}</th>
              <th>{t('users.colStatus')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id}>
                <td className="row-num">{i + 1}</td>
                <td className="user-name-cell">
                  <div className="user-avatar" style={{ background: 'rgba(0,188,212,0.15)', color: '#00E5FF' }}>
                    {u.name.charAt(0)}
                  </div>
                  {u.name}
                </td>
                <td><span className="mono">{u.username}</span></td>
                <td>{u.email}</td>
                <td>
                  {u.companyNo
                    ? <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'monospace', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', color: '#FFD700' }}>{u.companyNo}</span>
                    : <span style={{ color: '#3a6a82', fontSize: 11 }}>—</span>}
                </td>
                <td>
                  {u.companyNo ? (() => {
                    const assigned = allWhs.filter(w =>
                      w.active && (u.warehouses || []).includes(w.name)
                    );
                    return assigned.length > 0 ? (
                      <div className="wh-chips">
                        {assigned.map(w => <span key={w.id} className="wh-chip">{w.icon} {w.name}</span>)}
                      </div>
                    ) : <span style={{ color: '#3a6a82', fontSize: 11 }}>—</span>;
                  })() : <span style={{ color: '#3a6a82', fontSize: 11 }}>—</span>}
                </td>
                <td className="muted">{u.lastLogin}</td>
                <td>
                  <button className={`status-toggle ${u.status}`} onClick={() => toggleStatus(u.id)}>
                    {u.status === 'active' ? '● Active' : '○ Inactive'}
                  </button>
                </td>
                <td>
                  <button className="icon-btn" title="เปลี่ยนรหัสผ่าน" onClick={() => openChangePw(u)}>🔑</button>
                  <button className="icon-btn edit"   onClick={() => openEdit(u)}>✏️</button>
                  <button className="icon-btn delete" onClick={() => setDeleteId(u.id)}>🗑️</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="empty-row">{t('users.noData')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── ADD/EDIT MODAL ── */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-box modal-user" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? `✏️ ${t('users.editTitle')}` : `➕ ${t('users.addTitle')}`}</h2>
              <button className="modal-close" onClick={closeForm}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('users.nameLabel')} *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="สมชาย ใจดี" />
                </div>
                <div className="form-group">
                  <label>Username *</label>
                  <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="somchai" />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="example@samila.th" />
                </div>
                <div className="form-group">
                  <label>🏢 Company</label>
                  {isSuperAdmin ? (
                    <select value={form.companyNo} onChange={e => setForm({ ...form, companyNo: e.target.value })}
                      style={{ fontFamily: 'monospace', fontWeight: 700, color: '#FFD700' }}>
                      <option value="">-- ไม่ระบุ --</option>
                      {loadCompanies().map(c => (
                        <option key={c.companyNo} value={c.companyNo}>{c.companyNo} — {c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ padding: '6px 10px', borderRadius: 6, fontFamily: 'monospace', fontWeight: 700, color: '#FFD700', background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.2)', fontSize: 13 }}>
                      {myCompanyNo || '—'}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>{editId ? t('users.newPasswordLabel') : t('users.passwordLabel')} {!editId && '*'}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder={editId ? '(เว้นว่างหากไม่เปลี่ยน)' : '••••••••'}
                      autoComplete="new-password"
                      style={{ paddingRight: 36, width: '100%', boxSizing: 'border-box' }}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5a8fa8', fontSize: 14, padding: 0 }}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('users.confirmPasswordLabel')} {!editId && '*'}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      placeholder={editId ? '(เว้นว่างหากไม่เปลี่ยน)' : '••••••••'}
                      autoComplete="new-password"
                      style={{
                        paddingRight: 36, width: '100%', boxSizing: 'border-box',
                        borderColor: confirmPw && form.password !== confirmPw ? '#FF6B6B'
                          : confirmPw && form.password === confirmPw ? '#00CC88' : undefined,
                      }}
                    />
                    <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>
                      {confirmPw && form.password === confirmPw ? '✅' : confirmPw ? '❌' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>{t('users.statusLabel')}</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* ── Warehouses by Company ── */}
              <div className="form-group" style={{ marginTop: 4 }}>
                <label style={{ marginBottom: 6, display: 'block' }}>🏭 Warehouse
                  {form.companyNo && <span style={{ marginLeft: 8, fontSize: 11, fontFamily: 'monospace', color: '#FFD700', background: 'rgba(255,215,0,0.1)', padding: '1px 7px', borderRadius: 4, border: '1px solid rgba(255,215,0,0.25)' }}>{form.companyNo}</span>}
                </label>
                {(() => {
                  const activeWhs = allWhs.filter(w => w.active);
                  const compWhs   = form.companyNo
                    ? allWhs.filter(w => w.companyNo === form.companyNo && w.active)
                    : [];
                  let allowed = compWhs.length > 0 ? compWhs : activeWhs;
                  // กรองเฉพาะ warehouse ที่ currentUser มีสิทธิ์ (ยกเว้น superadmin เห็นได้ทั้งหมด)
                  if (!isSuperAdmin && currentUser?.warehouses) {
                    const myWhs = currentUser.warehouses;
                    if (!myWhs.includes('All')) {
                      allowed = allowed.filter(w => myWhs.includes(w.name) || myWhs.includes(w.code));
                    }
                  }
                  const filtered = allowed;
                  if (filtered.length === 0) return (
                    <div style={{ fontSize: 12, color: '#3a6a82', padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      ไม่มี Warehouse ในระบบ
                    </div>
                  );
                  return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {filtered.map(w => {
                        const checked = (form.warehouses || []).includes(w.name);
                        return (
                          <label key={w.id}
                            onClick={() => toggleWarehouse(w.name)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', userSelect: 'none', fontSize: 12,
                              background: checked ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${checked ? 'rgba(0,229,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                              color: checked ? '#cce4ef' : '#5a8fa8' }}>
                            <span style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                              background: checked ? '#00E5FF' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${checked ? '#00E5FF' : 'rgba(255,255,255,0.15)'}`,
                              color: checked ? '#0a1628' : 'transparent' }}>✓</span>
                            {w.icon} {w.name}
                          </label>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* ── Permissions Table ── */}
              <div className="perm-section">
                <div className="perm-section-header">
                  <span className="perm-section-title">🔐 กำหนดสิทธิ์เมนู</span>
                  <span className="perm-section-count">
                    {Object.values(form.menus || {}).filter(m => m?.view).length}/{ALL_PAGES.length}
                  </span>
                  <button type="button" className="perm-all-btn"
                    onClick={() => setForm(p => ({ ...p, menus: allMenusOn() }))}>
                    ✓ ทั้งหมด
                  </button>
                  <button type="button" className="perm-clear-btn"
                    onClick={() => setForm(p => ({ ...p, menus: allMenusOff() }))}>
                    ✕ ล้าง
                  </button>
                </div>

                <div className="perm-table">
                  {/* Header */}
                  <div className="perm-row perm-row-head">
                    <div className="perm-col-menu">เมนู</div>
                    <div className="perm-col-cb">View</div>
                    <div className="perm-col-cb">Add</div>
                    <div className="perm-col-cb">Edit</div>
                    <div className="perm-col-cb">Delete</div>
                  </div>
                  {/* Rows */}
                  {ALL_PAGES.map(page => {
                    const perm = form.menus?.[page.key] || makeMenuPerm();
                    const set = (field) => setForm(p => ({
                      ...p,
                      menus: { ...p.menus, [page.key]: { ...perm, [field]: !perm[field] } }
                    }));
                    const toggleView = () => {
                      const next = !perm.view;
                      setForm(p => ({
                        ...p,
                        menus: { ...p.menus, [page.key]: { view: next, add: next ? perm.add : false, edit: next ? perm.edit : false, delete: next ? perm.delete : false } }
                      }));
                    };
                    return (
                      <div key={page.key} className={`perm-row ${perm.view ? 'perm-row-on' : ''}`}>
                        <div className="perm-col-menu" onClick={toggleView}>
                          <span className={`perm-view-dot ${perm.view ? 'on' : ''}`} />
                          <span className="perm-menu-name">{page.label}</span>
                        </div>
                        <div className="perm-col-cb">
                          <input type="checkbox" checked={!!perm.view} onChange={toggleView} />
                        </div>
                        <div className="perm-col-cb">
                          <input type="checkbox" checked={!!perm.add} onChange={() => set('add')} disabled={!perm.view} />
                        </div>
                        <div className="perm-col-cb">
                          <input type="checkbox" checked={!!perm.edit} onChange={() => set('edit')} disabled={!perm.view} />
                        </div>
                        <div className="perm-col-cb">
                          <input type="checkbox" checked={!!perm.delete} onChange={() => set('delete')} disabled={!perm.view} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {formError && <span style={{ color: '#FF6B6B', fontSize: 12, flex: 1 }}>{formError}</span>}
              <button type="button" className="cancel-btn" onClick={closeForm}>{t('common.cancel')}</button>
              <button type="button" className="save-btn" onClick={handleSave}>{editId ? `💾 ${t('common.save')}` : `➕ ${t('users.addUser')}`}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHANGE PASSWORD MODAL ── */}
      {changePwTarget && (
        <div className="modal-overlay" onClick={() => setChangePwTarget(null)}>
          <div className="modal-box modal-sm" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔑 {t('users.changePw')}</h2>
              <button className="modal-close" onClick={() => setChangePwTarget(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(0,188,212,0.06)', borderRadius: 8, border: '1px solid rgba(0,188,212,0.15)' }}>
                <div className="user-avatar" style={{ background: 'rgba(0,188,212,0.15)', color: '#00E5FF' }}>
                  {changePwTarget.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#cce4ef', fontSize: 13 }}>{changePwTarget.name}</div>
                  <div style={{ fontSize: 11, color: '#5a8fa8' }}>{changePwTarget.username}</div>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('users.newPw')}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showCPwNew ? 'text' : 'password'} value={changePwForm.newPw}
                    onChange={e => setChangePwForm(f => ({ ...f, newPw: e.target.value }))}
                    placeholder="••••••••"
                    style={{ paddingRight: 36, width: '100%', boxSizing: 'border-box' }}
                  />
                  <button type="button" onClick={() => setShowCPwNew(v => !v)}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5a8fa8', fontSize: 14, padding: 0 }}>
                    {showCPwNew ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('users.confirmNewPw')}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showCPwNew ? 'text' : 'password'} value={changePwForm.confirmPw}
                    onChange={e => setChangePwForm(f => ({ ...f, confirmPw: e.target.value }))}
                    placeholder="••••••••"
                    style={{
                      paddingRight: 36, width: '100%', boxSizing: 'border-box',
                      borderColor: changePwForm.confirmPw && changePwForm.newPw !== changePwForm.confirmPw ? '#FF6B6B'
                        : changePwForm.confirmPw && changePwForm.newPw === changePwForm.confirmPw ? '#00CC88' : undefined,
                    }}
                  />
                  <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>
                    {changePwForm.confirmPw && changePwForm.newPw === changePwForm.confirmPw ? '✅' : changePwForm.confirmPw ? '❌' : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {changePwError && <span style={{ color: '#FF6B6B', fontSize: 12, flex: 1 }}>{changePwError}</span>}
              <button className="cancel-btn" onClick={() => setChangePwTarget(null)}>{t('common.cancel')}</button>
              <button className="save-btn" onClick={handleChangePw}>🔑 {t('users.savePw')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ {t('users.deleteTitle')}</h2>
              <button className="modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#b0cdd8', fontSize: 14 }}>
                {t('users.deleteMsg')} <strong style={{ color: '#FF6B6B' }}>{users.find(u => u.id === deleteId)?.name}</strong>?<br />
                <span style={{ color: '#5a8fa8', fontSize: 12 }}>{t('common.irrevocable')}</span>
              </p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setDeleteId(null)}>{t('common.cancel')}</button>
              <button className="delete-confirm-btn" onClick={handleDelete}>🗑️ {t('users.deleteBtn')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
