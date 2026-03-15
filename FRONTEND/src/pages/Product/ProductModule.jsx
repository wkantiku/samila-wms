import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MAIN_UNIT_GROUPS, SUB_UNIT_GROUPS } from '../../constants/units';
import * as XLSX from 'xlsx';

const initProducts = [
  { id: 1, sku: 'SKU001', barcode: 'BC001', name: 'Product 1', category: 'Electronics', mainUnit: 'PCS', subUnit: 'BOX', price: 1000, batNumber: 'BAT-001', lotNumber: 'LOT-001', manufactureDate: '2025-01-15', expiryDate: '2027-01-15', weightKg: '', weightG: '', dimW: '', dimL: '', dimH: '' },
];

const emptyForm = { sku: '', barcode: '', name: '', category: 'Electronics', mainUnit: 'PCS', subUnit: 'BOX', price: '', batNumber: '', lotNumber: '', manufactureDate: '', expiryDate: '', weightKg: '', weightG: '', dimW: '', dimL: '', dimH: '' };

function ProductModule() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('list');
  const [products, setProducts] = useState(initProducts);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  const openCreate = () => { setForm(emptyForm); setEditId(null); setFormError(''); setShowModal(true); };

  const downloadTemplate = () => {
    const headers = ['SKU','Barcode','Name','Category','Main Unit','Sub Unit','Price','Batch Number','Lot Number','Manufacture Date (YYYY-MM-DD)','Expiry Date (YYYY-MM-DD)','Weight KG','Weight G','Width (CM)','Length (CM)','Height (CM)'];
    const example = ['SKU001','BC001','Product Name','Electronics','PCS','BOX','1000','BAT-001','LOT-001','2025-01-15','2027-01-15','1.5','','30','20','10'];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Product Template');
    XLSX.writeFile(wb, 'template_product.xlsx');
  };
  const openEdit = (p) => { setForm({ ...p }); setEditId(p.id); setFormError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditId(null); setFormError(''); };

  const handleSave = () => {
    if (!form.sku.trim()) { setFormError(t('product.errorSKU')); return; }
    if (!form.name.trim()) { setFormError(t('product.errorName')); return; }
    if (editId) {
      setProducts(prev => prev.map(p => p.id === editId ? { ...p, ...form } : p));
    } else {
      setProducts(prev => [...prev, { id: Date.now(), ...form, price: Number(form.price) || 0 }]);
    }
    closeModal();
  };

  const INLINE_COUNT = 10;
  const emptyInlineRow = () => ({ sku: '', barcode: '', name: '', category: 'Electronics', mainUnit: 'PCS', subUnit: 'BOX', price: '', batNumber: '', lotNumber: '', manufactureDate: '', expiryDate: '' });
  const [inlineRows, setInlineRows] = useState(() => Array.from({ length: INLINE_COUNT }, emptyInlineRow));

  const updateInlineRow = (idx, field, value) => {
    setInlineRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const saveInlineRow = (idx) => {
    const row = inlineRows[idx];
    if (!row.sku.trim()) { alert(t('product.errorSKU')); return; }
    if (!row.name.trim()) { alert(t('product.errorName')); return; }
    setProducts(prev => [...prev, { id: Date.now() + idx, ...row, price: Number(row.price) || 0, weightKg: '', weightG: '', dimW: '', dimL: '', dimH: '' }]);
    setInlineRows(prev => prev.map((r, i) => i === idx ? emptyInlineRow() : r));
  };

  const selectStyle = { padding: '9px 12px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,188,212,0.4)', borderRadius: 6, fontSize: 13, color: '#ffffff', fontFamily: 'inherit', width: '100%', fontWeight: 600 };

  const MainUnitSelect = ({ field, value }) => (
    <select value={value} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={selectStyle}>
      <option value="">-- เลือกหน่วยหลัก --</option>
      {MAIN_UNIT_GROUPS.map(g => (
        <optgroup key={g.group} label={g.group}>
          {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </optgroup>
      ))}
    </select>
  );

  const SubUnitSelect = ({ field, value }) => (
    <select value={value} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={selectStyle}>
      <option value="">-- เลือกหน่วยรอง --</option>
      {SUB_UNIT_GROUPS.map(g => (
        <optgroup key={g.group} label={g.group}>
          {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </optgroup>
      ))}
    </select>
  );

  return (
    <div className="wms-module product-module">
      <div className="module-header">
        <h1>{t('product.title')}</h1>
        <button onClick={toggleLanguage} className="lang-btn">
          {i18n.language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
        </button>
      </div>

      <div className="module-tabs">
        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
          📋 {t('product.list')}
        </button>
        <button className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => { setActiveTab('create'); openCreate(); }}>
          ➕ {t('product.create')}
        </button>
      </div>

      <div className="module-content">
        {activeTab === 'list' && (
          <div className="product-list">
            <div className="controls">
              <label className="import-btn">
                📥 {t('product.import')}
                <input type="file" accept=".xlsx" hidden />
              </label>
              <button className="export-btn">📤 {t('product.export')}</button>
              <button onClick={downloadTemplate} className="export-btn" style={{background:'rgba(0,204,136,0.12)',color:'#00CC88',border:'1px solid rgba(0,204,136,0.3)'}}>📋 Download Template</button>
              <button className="create-btn" onClick={openCreate}>➕ {t('product.create')}</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('product.sku')}</th>
                  <th>{t('product.barcode')}</th>
                  <th>{t('product.name')}</th>
                  <th>{t('product.category')}</th>
                  <th>Main Unit</th>
                  <th>Sub Unit</th>
                  <th>{t('product.price')}</th>
                  <th>BAT No.</th>
                  <th>Lot No.</th>
                  <th>MFG Date</th>
                  <th>Expiry Date</th>
                  <th>Weight</th>
                  <th>Dimension (W×L×H)</th>
                  <th>{t('product.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && inlineRows.every(r => !r.sku && !r.name) && (
                  <tr><td colSpan={14} style={{ textAlign: 'center', padding: 28, color: '#3a6a82', fontSize: 13 }}>No products</td></tr>
                )}
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', color: '#a0c8dc' }}>{p.sku}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.barcode || '-'}</td>
                    <td style={{ fontWeight: 600, color: '#cce4ef' }}>{p.name}</td>
                    <td style={{ fontSize: 12, color: '#7a9fb5' }}>{p.category}</td>
                    <td><span style={{ background: 'rgba(0,188,212,0.1)', color: '#00E5FF', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{p.mainUnit || '-'}</span></td>
                    <td><span style={{ background: 'rgba(0,204,136,0.1)', color: '#00CC88', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{p.subUnit || '-'}</span></td>
                    <td>฿{Number(p.price).toLocaleString()}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#00E5FF' }}>{p.batNumber || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#00CC88' }}>{p.lotNumber || '-'}</td>
                    <td style={{ fontSize: 12 }}>{p.manufactureDate || '-'}</td>
                    <td style={{ fontSize: 12, color: p.expiryDate ? '#FFD700' : undefined }}>{p.expiryDate || '-'}</td>
                    <td style={{ fontSize: 11, color: '#a0c8dc', whiteSpace: 'nowrap' }}>
                      {p.weightKg ? <span>{p.weightKg} KG</span> : ''}
                      {p.weightKg && p.weightG ? <span style={{ color: '#3a6a82' }}> / </span> : ''}
                      {p.weightG ? <span>{p.weightG} G</span> : ''}
                      {!p.weightKg && !p.weightG ? '-' : ''}
                    </td>
                    <td style={{ fontSize: 11, color: '#a0c8dc', whiteSpace: 'nowrap' }}>
                      {(p.dimW || p.dimL || p.dimH)
                        ? `${p.dimW || '?'} × ${p.dimL || '?'} × ${p.dimH || '?'} cm`
                        : '-'}
                    </td>
                    <td>
                      <button className="action-btn edit" onClick={() => openEdit(p)}>✏️</button>
                    </td>
                  </tr>
                ))}
                {/* ── 10 Inline Input Rows ── */}
                {inlineRows.map((row, idx) => {
                  const iStyle = { background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)', borderRadius: 4, color: '#cce4ef', padding: '4px 6px', fontSize: 11, width: '100%', minWidth: 50, boxSizing: 'border-box' };
                  const selStyle = { ...iStyle, cursor: 'pointer' };
                  return (
                    <tr key={`inline-${idx}`} style={{ background: 'rgba(0,229,255,0.02)' }}>
                      <td><input value={row.sku} onChange={e => updateInlineRow(idx, 'sku', e.target.value)} placeholder="SKU *" style={{ ...iStyle, borderColor: 'rgba(0,229,255,0.35)' }} /></td>
                      <td><input value={row.barcode} onChange={e => updateInlineRow(idx, 'barcode', e.target.value)} placeholder="BC..." style={iStyle} /></td>
                      <td><input value={row.name} onChange={e => updateInlineRow(idx, 'name', e.target.value)} placeholder="Product Name *" style={{ ...iStyle, borderColor: 'rgba(0,229,255,0.35)' }} /></td>
                      <td>
                        <select value={row.category} onChange={e => updateInlineRow(idx, 'category', e.target.value)} style={selStyle}>
                          <option>Electronics</option><option>Clothing</option><option>Food</option>
                          <option>Medical</option><option>Chemicals</option><option>Other</option>
                        </select>
                      </td>
                      <td>
                        <select value={row.mainUnit} onChange={e => updateInlineRow(idx, 'mainUnit', e.target.value)} style={selStyle}>
                          {MAIN_UNIT_GROUPS.map(g => <optgroup key={g.group} label={g.group}>{g.units.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}</optgroup>)}
                        </select>
                      </td>
                      <td>
                        <select value={row.subUnit} onChange={e => updateInlineRow(idx, 'subUnit', e.target.value)} style={selStyle}>
                          {SUB_UNIT_GROUPS.map(g => <optgroup key={g.group} label={g.group}>{g.units.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}</optgroup>)}
                        </select>
                      </td>
                      <td><input type="number" min="0" value={row.price} onChange={e => updateInlineRow(idx, 'price', e.target.value)} placeholder="0" style={{ ...iStyle, maxWidth: 70 }} /></td>
                      <td><input value={row.batNumber} onChange={e => updateInlineRow(idx, 'batNumber', e.target.value)} placeholder="BAT-001" style={iStyle} /></td>
                      <td><input value={row.lotNumber} onChange={e => updateInlineRow(idx, 'lotNumber', e.target.value)} placeholder="LOT-001" style={iStyle} /></td>
                      <td><input type="date" value={row.manufactureDate} onChange={e => updateInlineRow(idx, 'manufactureDate', e.target.value)} style={iStyle} /></td>
                      <td><input type="date" value={row.expiryDate} onChange={e => updateInlineRow(idx, 'expiryDate', e.target.value)} style={iStyle} /></td>
                      <td style={{ color: '#3a6a82', fontSize: 11 }}>-</td>
                      <td style={{ color: '#3a6a82', fontSize: 11 }}>-</td>
                      <td>
                        <button onClick={() => saveInlineRow(idx)} style={{ background: 'rgba(0,204,136,0.15)', color: '#00CC88', border: '1px solid rgba(0,204,136,0.3)', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>+ Save</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="rcv-modal-overlay" onClick={closeModal}>
          <div className="rcv-modal-box" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="rcv-modal-header">
              <h2>{editId ? `✏️ ${t('product.editProduct')}` : `➕ ${t('product.addProduct')}`}</h2>
              <button className="rcv-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="rcv-modal-body">
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>{t('product.sku')} *</label>
                  <input type="text" value={form.sku} onChange={e => { setForm(p => ({ ...p, sku: e.target.value })); setFormError(''); }} placeholder="SKU001" />
                </div>
                <div className="rcv-form-group">
                  <label>{t('product.barcode')}</label>
                  <input type="text" value={form.barcode} onChange={e => setForm(p => ({ ...p, barcode: e.target.value }))} placeholder="BC001" />
                </div>
              </div>
              <div className="rcv-form-group">
                <label>{t('product.nameLabel')}</label>
                <input type="text" value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setFormError(''); }} placeholder="Product Name" />
              </div>
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>{t('product.category')}</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    style={{ padding: '9px 12px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,188,212,0.4)', borderRadius: 6, fontSize: 13, color: '#ffffff', fontFamily: 'inherit', fontWeight: 600 }}>
                    <option>Electronics</option>
                    <option>Clothing</option>
                    <option>Food</option>
                    <option>Medical</option>
                    <option>Chemicals</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="rcv-form-group">
                  <label>{t('product.priceLabel')}</label>
                  <input type="number" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0" />
                </div>
              </div>
              <div style={{ background: 'rgba(0,188,212,0.05)', border: '1px solid rgba(0,188,212,0.1)', borderRadius: 8, padding: '14px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5a8fa8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>BAT / LOT / MFG Date / Expiry Date</div>
                <div className="rcv-form-row2" style={{ marginBottom: 12 }}>
                  <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                    <label>BAT No.</label>
                    <input type="text" value={form.batNumber} onChange={e => setForm(p => ({ ...p, batNumber: e.target.value }))} placeholder="BAT-001" />
                  </div>
                  <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                    <label>Lot No.</label>
                    <input type="text" value={form.lotNumber} onChange={e => setForm(p => ({ ...p, lotNumber: e.target.value }))} placeholder="LOT-001" />
                  </div>
                </div>
                <div className="rcv-form-row2" style={{ marginBottom: 0 }}>
                  <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                    <label>MFG Date</label>
                    <input type="date" value={form.manufactureDate} onChange={e => setForm(p => ({ ...p, manufactureDate: e.target.value }))} />
                  </div>
                  <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                    <label>Expiry Date</label>
                    <input type="date" value={form.expiryDate} onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div style={{ background: 'rgba(0,188,212,0.05)', border: '1px solid rgba(0,188,212,0.1)', borderRadius: 8, padding: '14px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5a8fa8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>หน่วยนับ (Units)</div>
                <div className="rcv-form-row2" style={{ gap: 12 }}>
                  <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                    <label>Main Unit (หน่วยหลัก)</label>
                    <MainUnitSelect field="mainUnit" value={form.mainUnit} />
                  </div>
                  <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                    <label>Sub Unit (หน่วยรอง)</label>
                    <SubUnitSelect field="subUnit" value={form.subUnit} />
                  </div>
                </div>
              </div>
              <div style={{ background: 'rgba(0,188,212,0.05)', border: '1px solid rgba(0,188,212,0.1)', borderRadius: 8, padding: '14px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5a8fa8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>⚖️ Weight & 📐 Dimension</div>
                <div className="rcv-form-row2" style={{ marginBottom: 12 }}>
                  <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                    <label>Weight KG</label>
                    <input type="number" min="0" step="0.001" value={form.weightKg} onChange={e => setForm(p => ({ ...p, weightKg: e.target.value }))} placeholder="0.000" />
                  </div>
                  <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                    <label>Weight G (กรัม)</label>
                    <input type="number" min="0" step="0.1" value={form.weightG} onChange={e => setForm(p => ({ ...p, weightG: e.target.value }))} placeholder="0.0" />
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5a8fa8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Dimension W × L × H (CM)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                    <label>W — ความกว้าง</label>
                    <input type="number" min="0" step="0.1" value={form.dimW} onChange={e => setForm(p => ({ ...p, dimW: e.target.value }))} placeholder="cm" />
                  </div>
                  <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                    <label>L — ความยาว</label>
                    <input type="number" min="0" step="0.1" value={form.dimL} onChange={e => setForm(p => ({ ...p, dimL: e.target.value }))} placeholder="cm" />
                  </div>
                  <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                    <label>H — ความสูง</label>
                    <input type="number" min="0" step="0.1" value={form.dimH} onChange={e => setForm(p => ({ ...p, dimH: e.target.value }))} placeholder="cm" />
                  </div>
                </div>
              </div>
              {formError && <div className="rcv-form-error">{formError}</div>}
            </div>
            <div className="rcv-modal-footer">
              <button className="rcv-cancel-btn" onClick={closeModal}>{t('buttons.cancel')}</button>
              <button className="rcv-save-btn" onClick={handleSave}>{editId ? `💾 ${t('buttons.save')}` : `➕ ${t('product.addProductBtn')}`}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductModule;
