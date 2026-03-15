import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './UsersModule.css';

const initUsers = [
  { id: 1, name: 'สมชาย ใจดี',      username: 'admin',    email: 'somchai@samila.th',   role: 'admin',          warehouses: ['All'],         password: 'Admin@123',    status: 'active',   lastLogin: '2026-03-11 09:12' },
  { id: 2, name: 'สุภาพร รักงาน',   username: 'manager',  email: 'supaporn@samila.th',  role: 'manager',        warehouses: ['Warehouse A'], password: 'Manager@123',  status: 'active',   lastLogin: '2026-03-11 08:45' },
  { id: 3, name: 'วิชัย แข็งแกร่ง', username: 'super1',   email: 'wichai@samila.th',    role: 'supervisor',     warehouses: ['Warehouse A'], password: 'Super@123',    status: 'active',   lastLogin: '2026-03-10 17:30' },
  { id: 4, name: 'นภา สดใส',        username: 'whadmin',  email: 'napa@samila.th',      role: 'warehouse_admin',warehouses: ['Warehouse B'], password: 'WHAdmin@123',  status: 'active',   lastLogin: '2026-03-10 16:22' },
  { id: 5, name: 'ธนา มั่งมี',      username: 'leader1',  email: 'thana@samila.th',     role: 'leader',         warehouses: ['Warehouse A'], password: 'Leader@123',   status: 'active',   lastLogin: '2026-03-11 07:40' },
  { id: 6, name: 'ปรีชา เก่งกาจ',   username: 'operator', email: 'preecha@samila.th',   role: 'operator',       warehouses: ['Warehouse B'], password: 'Oper@123',     status: 'active',   lastLogin: '2026-03-09 14:10' },
  { id: 7, name: 'อรทัย สวยงาม',    username: 'orathai',  email: 'orathai@samila.th',   role: 'operator',       warehouses: ['All'],         password: 'Orathai@123',  status: 'inactive', lastLogin: '2026-02-28 10:00' },
];

const roles = [
  { key: 'super_admin',    label: 'Super Admin',    color: '#FF00FF', permissions: 'สิทธิ์สูงสุด — ควบคุมระบบทั้งหมดรวมถึง Users & Settings' },
  { key: 'admin',          label: 'Admin',          color: '#FF6B6B', permissions: 'Full access — ทุกส่วนของระบบ' },
  { key: 'manager',        label: 'Manager',        color: '#FFD700', permissions: 'All modules, no system settings' },
  { key: 'supervisor',     label: 'Supervisor',     color: '#FF8C42', permissions: 'ดูแลการปฏิบัติงาน ไม่รวม Tarif/Settings' },
  { key: 'warehouse_admin',label: 'Warehouse Admin',color: '#9B7FFF', permissions: 'จัดการคลังสินค้า ดูรายงาน' },
  { key: 'leader',         label: 'Leader',         color: '#00BCD4', permissions: 'หัวหน้าทีม — Receiving/Inventory/Picking/Shipping' },
  { key: 'operator',       label: 'Operator',       color: '#00CC88', permissions: 'ปฏิบัติงานประจำวัน' },
];

const warehouses = ['All', 'Warehouse A', 'Warehouse B', 'Warehouse C'];

const MODULES = ['Dashboard','Receiving','Inventory','Product','Picking','Shipping','Tarif','Reports','Users','Settings'];

const getDefaultPermissions = (roleKey) =>
  MODULES.filter(m =>
    roleKey === 'super_admin'    ? true
    : roleKey === 'admin'          ? true
    : roleKey === 'manager'        ? !['Settings'].includes(m)
    : roleKey === 'supervisor'     ? !['Tarif','Users','Settings'].includes(m)
    : roleKey === 'warehouse_admin'? ['Dashboard','Receiving','Inventory','Product','Reports','Settings'].includes(m)
    : roleKey === 'leader'         ? ['Dashboard','Receiving','Inventory','Picking','Shipping'].includes(m)
    : /* operator */                 ['Dashboard','Receiving','Inventory','Picking','Shipping'].includes(m)
  );

const makeEmptyForm = () => ({
  name: '', username: '', email: '',
  role: 'operator', warehouses: ['Warehouse A'], status: 'active', password: '',
  permissions: getDefaultPermissions('operator'),
});

export default function UsersModule() {
  const { t } = useTranslation();
  const [users, setUsers]         = useState(initUsers);
  const [search, setSearch]       = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(makeEmptyForm);
  const [formError, setFormError] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [deleteId, setDeleteId]   = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  // Change Password modal
  const [changePwTarget, setChangePwTarget]   = useState(null); // user object
  const [changePwForm, setChangePwForm]       = useState({ oldPw: '', newPw: '', confirmPw: '' });
  const [changePwError, setChangePwError]     = useState('');
  const [showCPwOld, setShowCPwOld]           = useState(false);
  const [showCPwNew, setShowCPwNew]           = useState(false);

  // Simulated session — swap role here to test different permission levels
  const [sessionRole, setSessionRole] = useState('admin');
  const sessionUserId = 1; // id of simulated logged-in user
  const isPrivileged  = ['super_admin', 'admin'].includes(sessionRole);

  const filtered = users.filter(u =>
    (filterRole === 'all' || u.role === filterRole) &&
    (u.name.includes(search) || u.username.includes(search) || u.email.includes(search))
  );

  const openAdd  = () => { setForm(makeEmptyForm()); setFormError(''); setConfirmPw(''); setShowPw(false); setEditId(null); setShowForm(true); };
  const openEdit = (u) => {
    const wh = Array.isArray(u.warehouses) ? u.warehouses : (u.warehouse ? [u.warehouse] : ['Warehouse A']);
    setForm({ ...u, password: '', warehouses: wh, permissions: u.permissions || getDefaultPermissions(u.role) });
    setConfirmPw(''); setShowPw(false); setFormError('');
    setEditId(u.id);
    setShowForm(true);
  };

  const toggleWarehouse = (wh) => {
    if (wh === 'All') {
      setForm(prev => ({ ...prev, warehouses: prev.warehouses.includes('All') ? [] : ['All'] }));
    } else {
      setForm(prev => {
        const without = prev.warehouses.filter(w => w !== 'All');
        const has = without.includes(wh);
        const next = has ? without.filter(w => w !== wh) : [...without, wh];
        return { ...prev, warehouses: next };
      });
    }
  };
  const closeForm = () => { setShowForm(false); setEditId(null); setFormError(''); setConfirmPw(''); setShowPw(false); };

  const handleRoleChange = (roleKey) => {
    setForm(prev => ({ ...prev, role: roleKey, permissions: getDefaultPermissions(roleKey) }));
  };

  const togglePermission = (m) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(m)
        ? prev.permissions.filter(p => p !== m)
        : [...prev.permissions, m],
    }));
  };

  const handleSave = () => {
    if (!form.name || !form.username) {
      setFormError('กรุณากรอกชื่อ และ Username ให้ครบถ้วน');
      return;
    }
    if (!editId && !form.password) {
      setFormError('กรุณากรอกรหัสผ่าน');
      return;
    }
    if (form.password && form.password !== confirmPw) {
      setFormError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    setFormError('');
    if (editId) {
      setUsers(prev => prev.map(u => u.id === editId ? { ...u, ...form } : u));
    } else {
      setUsers(prev => [...prev, { ...form, id: Date.now(), lastLogin: '-' }]);
    }
    closeForm();
  };

  const handleDelete = () => {
    setUsers(prev => prev.filter(u => u.id !== deleteId));
    setDeleteId(null);
  };

  const toggleStatus = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));

  const roleInfo  = (key) => roles.find(r => r.key === key) || {};
  const roleCount = (key) => users.filter(u => u.role === key).length;

  const openChangePw = (u) => {
    setChangePwTarget(u);
    setChangePwForm({ oldPw: '', newPw: '', confirmPw: '' });
    setChangePwError('');
    setShowCPwOld(false);
    setShowCPwNew(false);
  };

  const handleChangePw = () => {
    const target = users.find(u => u.id === changePwTarget.id);
    if (!isPrivileged) {
      if (!changePwForm.oldPw) { setChangePwError('กรุณากรอกรหัสผ่านเก่า'); return; }
      if (changePwForm.oldPw !== (target?.password || '')) { setChangePwError('รหัสผ่านเก่าไม่ถูกต้อง'); return; }
    }
    if (!changePwForm.newPw) { setChangePwError('กรุณากรอกรหัสผ่านใหม่'); return; }
    if (changePwForm.newPw !== changePwForm.confirmPw) { setChangePwError('รหัสผ่านใหม่ไม่ตรงกัน'); return; }
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
        <div className="header-right" style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(0,0,0,0.2)',padding:'6px 12px',borderRadius:8,border:'1px solid rgba(0,188,212,0.15)'}}>
            <span style={{fontSize:11,color:'#5a8fa8'}}>👤 {t('users.session')}:</span>
            <select
              value={sessionRole}
              onChange={e=>setSessionRole(e.target.value)}
              style={{background:'transparent',border:'none',color:'#00E5FF',fontSize:12,fontWeight:700,cursor:'pointer',outline:'none'}}
            >
              {roles.map(r=><option key={r.key} value={r.key} style={{background:'#0d2b3e'}}>{r.label}</option>)}
            </select>
          </div>
          <button className="create-btn" onClick={openAdd}>➕ {t('users.addUser')}</button>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="module-tabs">
        <button className={`tab-btn ${activeTab==='users'?'active':''}`} onClick={()=>setActiveTab('users')}>👥 {t('users.listTab')}</button>
        <button className={`tab-btn ${activeTab==='roles'?'active':''}`} onClick={()=>setActiveTab('roles')}>🔐 {t('users.rolesTab')}</button>
      </div>

      {/* ── USERS LIST ── */}
      {activeTab === 'users' && (
        <>
          {/* Summary */}
          <div className="users-summary">
            {[
              { label: t('users.total'), value: users.length,                        color: '#00E5FF' },
              { label: 'Active',         value: users.filter(u=>u.status==='active').length,   color: '#00CC88' },
              { label: 'Inactive',       value: users.filter(u=>u.status==='inactive').length, color: '#FF6B6B' },
              { label: 'Super Admin',value: roleCount('super_admin'),    color: '#FF00FF' },
              { label: 'Admin',     value: roleCount('admin'),          color: '#FF6B6B' },
              { label: 'Manager',   value: roleCount('manager'),        color: '#FFD700' },
              { label: 'Supervisor',value: roleCount('supervisor'),     color: '#FF8C42' },
              { label: 'WH Admin',  value: roleCount('warehouse_admin'),color: '#9B7FFF' },
              { label: 'Leader',    value: roleCount('leader'),         color: '#00BCD4' },
              { label: 'Operator',  value: roleCount('operator'),       color: '#00CC88' },
            ].map((s,i)=>(
              <div key={i} className="users-stat">
                <div className="users-stat-value" style={{color:s.color}}>{s.value}</div>
                <div className="users-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="controls" style={{marginBottom:14}}>
            <input type="search" placeholder={t('users.searchPlaceholder')} value={search} onChange={e=>setSearch(e.target.value)} style={{minWidth:240}} />
            <select className="filter-select" value={filterRole} onChange={e=>setFilterRole(e.target.value)}>
              <option value="all">{t('users.allRoles')}</option>
              {roles.map(r=><option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="users-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>{t('users.colName')}</th><th>Username</th><th>Email</th>
                  <th>Role</th><th>Warehouse</th><th>{t('users.colLastLogin')}</th><th>{t('users.colStatus')}</th><th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u,i)=>{
                  const r = roleInfo(u.role);
                  return (
                    <tr key={u.id}>
                      <td className="row-num">{i+1}</td>
                      <td className="user-name-cell">
                        <div className="user-avatar" style={{background: r.color+'22', color: r.color}}>
                          {u.name.charAt(0)}
                        </div>
                        {u.name}
                      </td>
                      <td><span className="mono">{u.username}</span></td>
                      <td>{u.email}</td>
                      <td><span className="role-badge" style={{background:r.color+'18',color:r.color,borderColor:r.color+'44'}}>{r.label}</span></td>
                      <td>
                        <div className="wh-chips">
                          {(u.warehouses || []).map(w => (
                            <span key={w} className={`wh-chip ${w === 'All' ? 'wh-all' : ''}`}>{w}</span>
                          ))}
                        </div>
                      </td>
                      <td className="muted">{u.lastLogin}</td>
                      <td>
                        <button className={`status-toggle ${u.status}`} onClick={()=>toggleStatus(u.id)}>
                          {u.status==='active' ? '● Active' : '○ Inactive'}
                        </button>
                      </td>
                      <td>
                        {(isPrivileged || u.id === sessionUserId) && (
                          <button className="icon-btn" title="เปลี่ยนรหัสผ่าน" onClick={()=>openChangePw(u)}>🔑</button>
                        )}
                        {isPrivileged && (
                          <>
                            <button className="icon-btn edit"   onClick={()=>openEdit(u)}>✏️</button>
                            <button className="icon-btn delete" onClick={()=>setDeleteId(u.id)}>🗑️</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="empty-row">{t('users.noData')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── ROLES & PERMISSIONS ── */}
      {activeTab === 'roles' && (
        <div className="roles-grid">
          {roles.map(r=>(
            <div key={r.key} className="role-card" style={{borderTopColor:r.color}}>
              <div className="role-card-header">
                <span className="role-dot" style={{background:r.color}}></span>
                <h3 style={{color:r.color}}>{r.label}</h3>
                <span className="role-count">{roleCount(r.key)} {t('users.persons')}</span>
              </div>
              <div className="role-perm">{r.permissions}</div>
              <div className="role-users">
                {users.filter(u=>u.role===r.key).map(u=>(
                  <div key={u.id} className="role-user-chip">
                    <span className="chip-avatar" style={{background:r.color+'22',color:r.color}}>{u.name.charAt(0)}</span>
                    {u.name}
                  </div>
                ))}
                {roleCount(r.key)===0 && <div className="role-empty">{t('users.noUsers')}</div>}
              </div>
              <div className="role-modules">
                <div className="module-perms">
                  {(['Dashboard','Receiving','Inventory','Product','Picking','Shipping','Tarif','Reports','Users','Settings']).map(m=>{
                    const has = r.key==='admin'          ? true
                      : r.key==='manager'        ? !['Settings'].includes(m)
                      : r.key==='supervisor'     ? !['Tarif','Users','Settings'].includes(m)
                      : r.key==='warehouse_admin'? ['Dashboard','Receiving','Inventory','Product','Reports','Settings'].includes(m)
                      : r.key==='leader'         ? ['Dashboard','Receiving','Inventory','Picking','Shipping'].includes(m)
                      : /* operator */             ['Dashboard','Receiving','Inventory','Picking','Shipping'].includes(m);
                    return (
                      <span key={m} className={`perm-tag ${has?'yes':'no'}`}>{has?'✓':'✗'} {m}</span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD/EDIT MODAL ── */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? `✏️ ${t('users.editTitle')}` : `➕ ${t('users.addTitle')}`}</h2>
              <button className="modal-close" onClick={closeForm}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('users.nameLabel')}</label>
                  <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="สมชาย ใจดี" />
                </div>
                <div className="form-group">
                  <label>Username *</label>
                  <input type="text" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="somchai" />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="example@samila.th" />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Role</label>
                  <select value={form.role} onChange={e=>handleRoleChange(e.target.value)}>
                    {roles.map(r=><option key={r.key} value={r.key}>{r.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>🏭 Warehouse</label>
                  <div className="wh-checkbox-group">
                    {warehouses.map(w => {
                      const checked = form.warehouses.includes(w);
                      return (
                        <label key={w} className={`wh-checkbox-item ${checked ? 'checked' : ''} ${w === 'All' ? 'wh-all-item' : ''}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleWarehouse(w)} />
                          <span>{w}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* Permissions Checkboxes */}
              <div className="form-group">
                <div className="perm-label-row">
                  <label>🔐 {t('users.permissionsLabel')}</label>
                  {form.role !== 'admin' && (
                    <button type="button" className="perm-reset-btn" onClick={() => handleRoleChange(form.role)}>
                      {t('users.resetByRole')}
                    </button>
                  )}
                </div>
                <div className="perm-checkboxes">
                  {MODULES.map(m => {
                    const checked = form.permissions.includes(m);
                    return (
                      <label key={m} className={`perm-checkbox-item ${checked ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(m)}
                        />
                        <span className="perm-checkbox-label">{m}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>{editId ? t('users.newPasswordLabel') : t('users.passwordLabel')}</label>
                  <div style={{position:'relative'}}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={e=>setForm({...form,password:e.target.value})}
                      placeholder="••••••••"
                      style={{paddingRight:36,width:'100%',boxSizing:'border-box'}}
                    />
                    <button
                      type="button"
                      onClick={()=>setShowPw(v=>!v)}
                      style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#5a8fa8',fontSize:14,padding:0}}
                    >{showPw ? '🙈' : '👁️'}</button>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('users.confirmPasswordLabel')} {!editId && '*'}</label>
                  <div style={{position:'relative'}}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirmPw}
                      onChange={e=>setConfirmPw(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        paddingRight:36,width:'100%',boxSizing:'border-box',
                        borderColor: confirmPw && form.password !== confirmPw ? '#FF6B6B'
                          : confirmPw && form.password === confirmPw ? '#00CC88' : undefined,
                      }}
                    />
                    <span style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',fontSize:14}}>
                      {confirmPw && form.password === confirmPw ? '✅' : confirmPw ? '❌' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>{t('users.statusLabel')}</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              {formError && <span style={{color:'#FF6B6B',fontSize:12,flex:1}}>{formError}</span>}
              <button className="cancel-btn" onClick={closeForm}>{t('common.cancel')}</button>
              <button className="save-btn"   onClick={handleSave}>{editId ? `💾 ${t('common.save')}` : `➕ ${t('users.addUser')}`}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHANGE PASSWORD MODAL ── */}
      {changePwTarget && (
        <div className="modal-overlay" onClick={()=>setChangePwTarget(null)}>
          <div className="modal-box modal-sm" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔑 {t('users.changePw')}</h2>
              <button className="modal-close" onClick={()=>setChangePwTarget(null)}>✕</button>
            </div>
            <div className="modal-body" style={{gap:14}}>
              {/* Target user info */}
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'rgba(0,188,212,0.06)',borderRadius:8,border:'1px solid rgba(0,188,212,0.15)'}}>
                <div className="user-avatar" style={{background:roleInfo(changePwTarget.role).color+'22',color:roleInfo(changePwTarget.role).color}}>
                  {changePwTarget.name.charAt(0)}
                </div>
                <div>
                  <div style={{fontWeight:700,color:'#cce4ef',fontSize:13}}>{changePwTarget.name}</div>
                  <div style={{fontSize:11,color:'#5a8fa8'}}>{changePwTarget.username} · {roleInfo(changePwTarget.role).label}</div>
                </div>
              </div>

              {/* Old password — admin sees stored value, user must type */}
              <div className="form-group" style={{marginBottom:0}}>
                <label style={{display:'flex',alignItems:'center',gap:6}}>
                  {t('users.currentPw')}
                  {isPrivileged && <span style={{fontSize:10,color:'#FFD700',background:'rgba(255,215,0,0.1)',border:'1px solid rgba(255,215,0,0.2)',borderRadius:4,padding:'1px 6px'}}>Admin View</span>}
                </label>
                <div style={{position:'relative'}}>
                  <input
                    type={showCPwOld ? 'text' : 'password'}
                    value={isPrivileged ? (users.find(u=>u.id===changePwTarget.id)?.password || '') : changePwForm.oldPw}
                    readOnly={isPrivileged}
                    onChange={isPrivileged ? undefined : e=>setChangePwForm(f=>({...f,oldPw:e.target.value}))}
                    placeholder={isPrivileged ? '' : 'กรอกรหัสผ่านเก่า'}
                    style={{
                      paddingRight:36,width:'100%',boxSizing:'border-box',
                      ...(isPrivileged ? {color:'#FFD700',background:'rgba(255,215,0,0.05)',borderColor:'rgba(255,215,0,0.25)',cursor:'default'} : {}),
                    }}
                  />
                  <button type="button" onClick={()=>setShowCPwOld(v=>!v)}
                    style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#5a8fa8',fontSize:14,padding:0}}>
                    {showCPwOld ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="form-group" style={{marginBottom:0}}>
                <label>{t('users.newPw')}</label>
                <div style={{position:'relative'}}>
                  <input
                    type={showCPwNew ? 'text' : 'password'}
                    value={changePwForm.newPw}
                    onChange={e=>setChangePwForm(f=>({...f,newPw:e.target.value}))}
                    placeholder="••••••••"
                    style={{paddingRight:36,width:'100%',boxSizing:'border-box'}}
                  />
                  <button type="button" onClick={()=>setShowCPwNew(v=>!v)}
                    style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#5a8fa8',fontSize:14,padding:0}}>
                    {showCPwNew ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div className="form-group" style={{marginBottom:0}}>
                <label>{t('users.confirmNewPw')}</label>
                <div style={{position:'relative'}}>
                  <input
                    type={showCPwNew ? 'text' : 'password'}
                    value={changePwForm.confirmPw}
                    onChange={e=>setChangePwForm(f=>({...f,confirmPw:e.target.value}))}
                    placeholder="••••••••"
                    style={{
                      paddingRight:36,width:'100%',boxSizing:'border-box',
                      borderColor: changePwForm.confirmPw && changePwForm.newPw !== changePwForm.confirmPw ? '#FF6B6B'
                        : changePwForm.confirmPw && changePwForm.newPw === changePwForm.confirmPw ? '#00CC88' : undefined,
                    }}
                  />
                  <span style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',fontSize:14}}>
                    {changePwForm.confirmPw && changePwForm.newPw === changePwForm.confirmPw ? '✅' : changePwForm.confirmPw ? '❌' : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {changePwError && <span style={{color:'#FF6B6B',fontSize:12,flex:1}}>{changePwError}</span>}
              <button className="cancel-btn" onClick={()=>setChangePwTarget(null)}>{t('common.cancel')}</button>
              <button className="save-btn" onClick={handleChangePw}>🔑 {t('users.savePw')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={()=>setDeleteId(null)}>
          <div className="modal-box modal-sm" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ {t('users.deleteTitle')}</h2>
              <button className="modal-close" onClick={()=>setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{color:'#b0cdd8',fontSize:14}}>
                {t('users.deleteMsg')} <strong style={{color:'#FF6B6B'}}>{users.find(u=>u.id===deleteId)?.name}</strong>?<br/>
                <span style={{color:'#5a8fa8',fontSize:12}}>{t('common.irrevocable')}</span>
              </p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={()=>setDeleteId(null)}>{t('common.cancel')}</button>
              <button className="delete-confirm-btn" onClick={handleDelete}>🗑️ {t('users.deleteBtn')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
