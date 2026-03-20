import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { customerApi } from '../../services/api';
import './CustomerModule.css';

// Map API response → local form fields
const apiToForm = (c) => ({
  id: c.id,
  code: c.code || '',
  name: c.name || '',
  name_th: c.name_th || '',
  address: c.address || '',
  tel: c.phone || '',
  taxNo: c.tax_id || '',
  contact: c.contact_person || '',
  email: c.email || '',
  logo: c.logo || '',
  creditDays: c.credit_days ?? 30,
  company_no: c.company_no || '',
  status: c.status || 'active',
});

// Map local form → API body
const formToApi = (form, currentUser) => ({
  code: form.code || `CUST-${Date.now()}`,
  name: form.name,
  name_th: form.name_th || form.name,
  address: form.address,
  phone: form.tel,
  tax_id: form.taxNo,
  contact_person: form.contact,
  email: form.email,
  logo: form.logo,
  credit_days: form.creditDays ?? 30,
  company_no: form.company_no || currentUser?.companyNo || '',
  status: form.status,
});

const emptyForm = { code: '', name: '', name_th: '', address: '', tel: '', taxNo: '', contact: '', email: '', logo: '', creditDays: 30, company_no: '', status: 'active' };

export default function CustomerModule({ currentUser, initCompanyFilter = '' }) {
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [filterCompany, setFilterCompany] = useState(initCompanyFilter);
  const [companies, setCompanies] = useState([]);

  const loadCustomers = useCallback(async () => {
    try {
      // SuperAdmin sees all; others filtered by their company
      const compNo = isSuperAdmin ? undefined : currentUser?.companyNo;
      const data = await customerApi.list(compNo);
      if (Array.isArray(data)) setCustomers(data.map(apiToForm));
    } catch {}
  }, [isSuperAdmin, currentUser?.companyNo]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // SuperAdmin: load distinct companies for filter dropdown
  useEffect(() => {
    if (!isSuperAdmin) return;
    customerApi.list().then(data => {
      if (!Array.isArray(data)) return;
      const seen = new Set();
      const list = [];
      data.forEach(c => {
        const no = c.company_no || '';
        if (no && !seen.has(no)) { seen.add(no); list.push({ code: no, name: c.name }); }
      });
      setCompanies(list);
    }).catch(() => {});
  }, [isSuperAdmin]);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal]     = useState(false);
  const [editId, setEditId]           = useState(null);
  const [form, setForm]               = useState(emptyForm);
  const [formError, setFormError]     = useState('');
  const [deleteId, setDeleteId]       = useState(null);
  const logoInputRef                  = useRef(null);

  const filtered = customers.filter(c =>
    (filterStatus === 'all' || c.status === filterStatus) &&
    (!filterCompany || c.company_no === filterCompany) &&
    (c.name.includes(search) || (c.contact || '').includes(search) || (c.taxNo || '').includes(search) || (c.tel || '').includes(search))
  );

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) { setFormError('โลโก้ต้องมีขนาดไม่เกิน 500KB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setForm(p => ({ ...p, logo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const openAdd  = () => { setForm(emptyForm); setEditId(null); setFormError(''); setShowModal(true); };
  const openEdit = (c) => { setForm({ ...c }); setEditId(c.id); setFormError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditId(null); setFormError(''); };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('กรุณากรอกชื่อลูกค้า'); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError('รูปแบบ Email ไม่ถูกต้อง'); return;
    }
    if (form.tel && !/^[\d\-+() ]{6,20}$/.test(form.tel)) {
      setFormError('รูปแบบเบอร์โทรไม่ถูกต้อง (ตัวเลข, -, +, วงเล็บ)'); return;
    }
    try {
      const body = formToApi(form, currentUser);
      if (editId) {
        await customerApi.update(editId, body);
      } else {
        await customerApi.create(body);
      }
      await loadCustomers();
      closeModal();
    } catch (err) {
      setFormError(err.message || 'บันทึกไม่สำเร็จ');
    }
  };

  const toggleStatus = async (id) => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return;
    const newStatus = cust.status === 'active' ? 'inactive' : 'active';
    try {
      await customerApi.update(id, { status: newStatus });
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch {}
  };

  const activeCount   = customers.filter(c => c.status === 'active').length;
  const inactiveCount = customers.filter(c => c.status === 'inactive').length;

  return (
    <div className="wms-module customer-module">

      {/* Header */}
      <div className="module-header">
        <div className="header-left">
          <h1>🏢 {t('customer.title')}</h1>
          {filterCompany
            ? <span className="header-sub" style={{ color: '#00CC88' }}>
                Customer ของ <strong>{filterCompany}</strong>
                <button onClick={() => setFilterCompany('')}
                  style={{ marginLeft: 10, fontSize: 11, padding: '2px 8px', background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)', color: '#FF6B6B', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                  ✕ ล้าง Filter
                </button>
              </span>
            : <span className="header-sub">{t('customer.subtitle')}</span>
          }
        </div>
        <div className="header-right">
          <button className="primary-btn" onClick={openAdd}>➕ {t('customer.addNew')}</button>
        </div>
      </div>

      {/* Context banner for non-SuperAdmin: shows which company they belong to */}
      {!isSuperAdmin && currentUser?.companyNo && (
        <div style={{ marginBottom: 12, padding: '8px 16px', borderRadius: 7, background: 'rgba(0,188,212,0.07)', border: '1px solid rgba(0,229,255,0.18)', fontSize: 12, color: '#5a8fa8', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🏢</span>
          <span>แสดง Customer ของบริษัท <strong style={{ color: '#00E5FF' }}>{currentUser.companyNo}</strong> — Customer เหล่านี้จะปรากฏใน Billing "Bill To"</span>
        </div>
      )}

      {/* Summary */}
      <div className="cust-summary-row">
        <div className="cust-stat-card">
          <div className="cust-stat-val" style={{ color: '#00E5FF' }}>{customers.length}</div>
          <div className="cust-stat-lbl">{t('customer.total')}</div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-val" style={{ color: '#00CC88' }}>{activeCount}</div>
          <div className="cust-stat-lbl">Active</div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-val" style={{ color: '#FF6B6B' }}>{inactiveCount}</div>
          <div className="cust-stat-lbl">Inactive</div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-val" style={{ color: '#FFD700' }}>{filtered.length}</div>
          <div className="cust-stat-lbl">{t('customer.searchResults')}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="controls" style={{ marginBottom: 14 }}>
        <input
          type="search"
          placeholder={t('customer.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ minWidth: 280 }}
        />
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">{t('customer.allStatus')}</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {isSuperAdmin && companies.length > 0 && (
          <select className="filter-select" value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
            <option value="">🏢 ทุก Company</option>
            {companies.map(co => (
              <option key={co.code} value={co.code}>{co.code} — {co.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="cust-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('customer.colName')}</th>
              <th>{t('customer.colContact')}</th>
              <th>{t('customer.colPhone')}</th>
              <th>{t('customer.colEmail')}</th>
              <th>{t('customer.colTax')}</th>
              <th>{t('customer.colAddress')}</th>
              <th>{t('customer.colStatus')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id}>
                <td className="row-num">{i + 1}</td>
                <td>
                  <div className="cust-name-cell">
                    {c.logo
                      ? <img src={c.logo} alt="logo" className="cust-logo-img" />
                      : <div className="cust-avatar">{c.name.charAt(0)}</div>}
                    <div>
                      <span className="cust-name-txt">{c.name}</span>
                      {isSuperAdmin && c.company_no && (
                        <span style={{ display: 'block', fontSize: 11, color: '#5a8fa8', marginTop: 2 }}>{c.company_no}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td>{c.contact || <span className="muted">-</span>}</td>
                <td><span className="mono cust-tel">{c.tel || '-'}</span></td>
                <td className="muted" style={{ fontSize: 12 }}>{c.email || '-'}</td>
                <td><span className="mono" style={{ fontSize: 12, color: '#a0c8dc' }}>{c.taxNo || '-'}</span></td>
                <td className="cust-addr-cell">{c.address || <span className="muted">-</span>}</td>
                <td>
                  <button className={`status-toggle ${c.status}`} onClick={() => toggleStatus(c.id)}>
                    {c.status === 'active' ? '● Active' : '○ Inactive'}
                  </button>
                </td>
                <td>
                  <button className="icon-btn edit" onClick={() => openEdit(c)}>✏️</button>
                  <button className="icon-btn delete" onClick={() => setDeleteId(c.id)}>🗑️</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="empty-row">{t('customer.noData')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? `✏️ ${t('customer.editTitle')}` : `➕ ${t('customer.addTitle')}`}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {!isSuperAdmin && currentUser?.companyNo && (
                <div style={{ marginBottom: 14, padding: '8px 14px', borderRadius: 7, background: 'rgba(0,188,212,0.08)', border: '1px solid rgba(0,229,255,0.2)', fontSize: 12, color: '#5a8fa8', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15 }}>🏢</span>
                  <span>Customer นี้จะอยู่ภายใต้บริษัท <strong style={{ color: '#00E5FF' }}>{currentUser.companyNo}</strong> และจะปรากฏใน Billing "Bill To"</span>
                </div>
              )}
              <div className="form-group">
                <label>{t('customer.nameLabel')}</label>
                <input type="text" value={form.name}
                  onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setFormError(''); }}
                  placeholder="บริษัท ABC จำกัด" />
              </div>
              <div className="form-group">
                <label>{t('customer.addressLabel')}</label>
                <textarea rows={2} value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="123 ถ.สุขุมวิท กรุงเทพฯ 10110" />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('customer.phoneLabel')}</label>
                  <input type="text" value={form.tel}
                    onChange={e => setForm(p => ({ ...p, tel: e.target.value }))}
                    placeholder="02-123-4567" />
                </div>
                <div className="form-group">
                  <label>{t('customer.taxLabel')}</label>
                  <input type="text" value={form.taxNo}
                    onChange={e => setForm(p => ({ ...p, taxNo: e.target.value }))}
                    placeholder="0105555000123" />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('customer.contactLabel')}</label>
                  <input type="text" value={form.contact}
                    onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                    placeholder="คุณสมชาย" />
                </div>
                <div className="form-group">
                  <label>{t('customer.emailLabel')}</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="example@company.th" />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>💳 เครดิต (วัน)</label>
                  <div className="credit-input-wrap">
                    <input
                      type="number" min="0" max="365"
                      value={form.creditDays ?? 30}
                      onChange={e => setForm(p => ({ ...p, creditDays: parseInt(e.target.value) || 0 }))}
                      placeholder="30"
                    />
                    <span className="credit-unit">วัน</span>
                  </div>
                  <div className="credit-hint">ครบกำหนดชำระหลังออก Invoice</div>
                </div>
                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                  <div className="credit-preset-label">ตั้งค่าเร็ว</div>
                  <div className="credit-presets">
                    {[7, 15, 30, 45, 60, 90].map(d => (
                      <button key={d} type="button"
                        className={`credit-preset-btn ${form.creditDays === d ? 'active' : ''}`}
                        onClick={() => setForm(p => ({ ...p, creditDays: d }))}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {isSuperAdmin && (
              <div className="form-group">
                <label>🏢 Company <span style={{ fontSize: 11, color: '#FFD700', marginLeft: 6 }}>👑 Super Admin only</span></label>
                <select value={form.company_no} onChange={e => setForm(p => ({ ...p, company_no: e.target.value }))}>
                  <option value="">— ไม่ระบุ —</option>
                  {companies.map(co => (
                    <option key={co.code} value={co.code}>{co.code} — {co.name}</option>
                  ))}
                </select>
              </div>
              )}
              <div className="form-group">
                <label>🖼️ โลโก้</label>
                <div className="logo-upload-row">
                  {form.logo
                    ? <img src={form.logo} alt="logo preview" className="logo-preview" />
                    : <div className="logo-placeholder">🏢</div>}
                  <div className="logo-upload-actions">
                    <button type="button" className="upload-logo-btn" onClick={() => logoInputRef.current?.click()}>
                      📁 เลือกรูปโลโก้
                    </button>
                    {form.logo && (
                      <button type="button" className="remove-logo-btn" onClick={() => setForm(p => ({ ...p, logo: '' }))}>
                        ✕ ลบโลโก้
                      </button>
                    )}
                    <span className="logo-hint">PNG, JPG ขนาดไม่เกิน 500KB</span>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoChange} hidden />
                </div>
              </div>
              <div className="form-group">
                <label>{t('customer.statusLabel')}</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="active">{t('customer.activeOption')}</option>
                  <option value="inactive">{t('customer.inactiveOption')}</option>
                </select>
              </div>
              {formError && <div className="form-error">{formError}</div>}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal}>{t('common.cancel')}</button>
              <button className="primary-btn" onClick={handleSave}>{editId ? `💾 ${t('common.save')}` : `➕ ${t('customer.addBtn')}`}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ {t('customer.deleteTitle')}</h2>
              <button className="modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#b0cdd8', fontSize: 14 }}>
                {t('customer.deleteMsg')} <strong style={{ color: '#FF6B6B' }}>{customers.find(c => c.id === deleteId)?.name}</strong>?<br />
                <span style={{ color: '#5a8fa8', fontSize: 12 }}>{t('common.irrevocable')}</span>
              </p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setDeleteId(null)}>{t('common.cancel')}</button>
              <button className="danger-btn" onClick={async () => {
                try {
                  await customerApi.remove(deleteId);
                  await loadCustomers();
                } catch (err) {
                  alert(err.message || 'ลบไม่สำเร็จ');
                }
                setDeleteId(null);
              }}>
                🗑️ {t('customer.deleteBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
