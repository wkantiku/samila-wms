import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { customerService } from '../../services/customerService';
import './CustomerModule.css';

const initCustomers = [
  { id: 1, name: 'บริษัท ABC จำกัด',           address: '123 ถ.สุขุมวิท กรุงเทพฯ 10110',         tel: '02-123-4567', taxNo: '0105555000123', contact: 'คุณสมชาย',  email: 'somchai@abc.th',    status: 'active'   },
  { id: 2, name: 'บริษัท XYZ (Thailand) จำกัด', address: '88 นิคมอุตสาหกรรม อมตะ ชลบุรี 20000', tel: '038-456-789',  taxNo: '0205566000456', contact: 'คุณวิชัย',  email: 'wichai@xyz.th',    status: 'active'   },
  { id: 3, name: 'ห้างหุ้นส่วน DEF',            address: '45 ถ.เพชรบุรี กรุงเทพฯ 10400',          tel: '02-987-6543', taxNo: '0305577000789', contact: 'คุณสุภาพร', email: 'sup@def.th',       status: 'active'   },
  { id: 4, name: 'Nayong Hospital',              address: '123 ถ.พัทลุง เมือง ตรัง 92000',          tel: '074-611-001', taxNo: '0107559000123', contact: 'คุณนภา',   email: 'napa@nayong.th',   status: 'active'   },
  { id: 5, name: 'ThaiBev Co., Ltd.',            address: '14 ถ.วิภาวดีรังสิต กรุงเทพฯ 10900',    tel: '02-785-5555', taxNo: '0107538000456', contact: 'คุณธนา',   email: 'thana@thaibev.th', status: 'active'   },
  { id: 6, name: 'SCG Logistics Co., Ltd.',      address: '1 ถ.ปูนซิเมนต์ไทย บางซื่อ กรุงเทพฯ',  tel: '02-586-2000', taxNo: '0107521000789', contact: 'คุณปรีชา', email: 'pre@scg.th',       status: 'inactive' },
];

const emptyForm = { name: '', address: '', tel: '', taxNo: '', contact: '', email: '', status: 'active' };

export default function CustomerModule() {
  const { t } = useTranslation();
  const [customers, setCustomers]     = useState(initCustomers);

  useEffect(() => {
    customerService.getAll().then(data => {
      if (Array.isArray(data) && data.length > 0) setCustomers(data);
    }).catch(() => {});
  }, []);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal]     = useState(false);
  const [editId, setEditId]           = useState(null);
  const [form, setForm]               = useState(emptyForm);
  const [formError, setFormError]     = useState('');
  const [deleteId, setDeleteId]       = useState(null);

  const filtered = customers.filter(c =>
    (filterStatus === 'all' || c.status === filterStatus) &&
    (c.name.includes(search) || c.contact.includes(search) || c.taxNo.includes(search) || c.tel.includes(search))
  );

  const openAdd  = () => { setForm(emptyForm); setEditId(null); setFormError(''); setShowModal(true); };
  const openEdit = (c) => { setForm({ ...c }); setEditId(c.id); setFormError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditId(null); setFormError(''); };

  const handleSave = () => {
    if (!form.name.trim()) { setFormError('กรุณากรอกชื่อลูกค้า'); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError('รูปแบบ Email ไม่ถูกต้อง'); return;
    }
    if (form.tel && !/^[\d\-+() ]{6,20}$/.test(form.tel)) {
      setFormError('รูปแบบเบอร์โทรไม่ถูกต้อง (ตัวเลข, -, +, วงเล็บ)'); return;
    }
    if (editId) {
      customerService.update(editId, form).catch(() => {});
      setCustomers(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
    } else {
      customerService.create(form).then(created => {
        if (created?.id) setCustomers(prev => prev.map(c => c.id === Date.now() ? { ...c, id: created.id } : c));
      }).catch(() => {});
      setCustomers(prev => [...prev, { id: Date.now(), ...form }]);
    }
    closeModal();
  };

  const toggleStatus = (id) => {
    const cust = customers.find(c => c.id === id);
    if (cust) {
      const newStatus = cust.status === 'active' ? 'inactive' : 'active';
      customerService.update(id, { ...cust, status: newStatus }).catch(() => {});
    }
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));
  };

  const activeCount   = customers.filter(c => c.status === 'active').length;
  const inactiveCount = customers.filter(c => c.status === 'inactive').length;

  return (
    <div className="wms-module customer-module">

      {/* Header */}
      <div className="module-header">
        <div className="header-left">
          <h1>🏢 {t('customer.title')}</h1>
          <span className="header-sub">{t('customer.subtitle')}</span>
        </div>
        <div className="header-right">
          <button className="primary-btn" onClick={openAdd}>➕ {t('customer.addNew')}</button>
        </div>
      </div>

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
                    <div className="cust-avatar">{c.name.charAt(0)}</div>
                    <span className="cust-name-txt">{c.name}</span>
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
              <button className="danger-btn" onClick={() => { customerService.delete(deleteId).catch(() => {}); setCustomers(prev => prev.filter(c => c.id !== deleteId)); setDeleteId(null); }}>
                🗑️ {t('customer.deleteBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
