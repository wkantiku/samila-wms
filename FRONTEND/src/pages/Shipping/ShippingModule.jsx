import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UNIT_GROUPS } from '../../constants/units';
import { shippingApi } from '../../services/api';

function ShippingModule() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([
    { id: 1, entryNumber: 'EN-2026-0001', sku: 'SKU001', quantity: 100, box: 'BOX001', unit: 'PCS' }
  ]);
  const [form, setForm] = useState({ soNumber: '', carrier: '', tracking: '', delivery: '' });
  const [submitting, setSubmitting] = useState(false);
  const [notify, setNotify] = useState(null);

  const setField = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const showNotify = (msg, type = 'success') => {
    setNotify({ msg, type });
    setTimeout(() => setNotify(null), 3500);
  };

  const handleShip = async (e) => {
    e.preventDefault();
    if (!form.soNumber.trim()) { showNotify('กรุณากรอก SO Number', 'error'); return; }
    if (!form.carrier.trim())  { showNotify('กรุณากรอก Carrier', 'error'); return; }
    setSubmitting(true);
    try {
      await shippingApi.ship({ ...form, items });
      showNotify(`จัดส่งสำเร็จ — ${form.soNumber}`);
      setForm({ soNumber: '', carrier: '', tracking: '', delivery: '' });
    } catch (err) {
      showNotify(err.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScan = async (item) => {
    try {
      const result = await shippingApi.track(item.entryNumber);
      showNotify(`Scan OK — ${item.sku} → ${result?.status || 'tracked'}`, 'info');
    } catch {
      showNotify(`Scanned: ${item.sku} (${item.entryNumber})`, 'info');
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  const updateItemUnit = (id, unit) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, unit } : item));
  };

  const unitSelectStyle = {
    padding: '6px 10px', background: 'rgba(0,20,40,0.8)',
    border: '1px solid rgba(0,188,212,0.4)', borderRadius: 6,
    fontSize: 12, color: '#ffffff', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600
  };

  return (
    <div className="wms-module shipping-module">
      <div className="module-header">
        <h1>{t('shipping.title')}</h1>
        <button onClick={toggleLanguage} className="lang-btn">
          {i18n.language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
        </button>
      </div>

      <div className="module-content">
        {notify && (
          <div style={{ margin: '0 0 12px', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: notify.type === 'error' ? 'rgba(255,107,107,0.12)' : 'rgba(0,204,136,0.12)',
            border: `1px solid ${notify.type === 'error' ? 'rgba(255,107,107,0.35)' : 'rgba(0,204,136,0.35)'}`,
            color: notify.type === 'error' ? '#FF6B6B' : '#00CC88' }}>
            {notify.msg}
          </div>
        )}
        <div className="shipping-container">
          <form className="shipping-form" onSubmit={handleShip}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,maxWidth:640}}>
              <div className="form-group" style={{marginBottom:0}}>
                <label>{t('shipping.soNumber')}</label>
                <input type="text" placeholder="SO-2026-0001" value={form.soNumber} onChange={setField('soNumber')} />
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label>{t('shipping.carrier')}</label>
                <input type="text" placeholder="Kerry Express" value={form.carrier} onChange={setField('carrier')} />
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label>{t('shipping.tracking')}</label>
                <input type="text" placeholder="TRACK123456" value={form.tracking} onChange={setField('tracking')} />
              </div>
            </div>
            <div className="form-group" style={{maxWidth:640,marginTop:12}}>
              <label>{t('shipping.delivery')}</label>
              <textarea placeholder="Delivery address" style={{minHeight:70}} value={form.delivery} onChange={setField('delivery')}></textarea>
            </div>
            <button type="submit" className="ship-btn" disabled={submitting}>
              {submitting ? '⏳ กำลังส่ง...' : `📤 ${t('shipping.ship')}`}
            </button>
          </form>

          <div className="shipping-items">
            <h3>{t('shipping.shipment')}</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entry No.</th>
                  <th>{t('common.sku')}</th>
                  <th>{t('inventory.quantity')}</th>
                  <th>{t('shipping.unit')}</th>
                  <th>{t('shipping.box')}</th>
                  <th>{t('shipping.action')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#FFD700', fontWeight: 700 }}>{item.entryNumber || '-'}</td>
                    <td>{item.sku}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <select value={item.unit} onChange={e => updateItemUnit(item.id, e.target.value)} style={unitSelectStyle}>
                        <option value="">{t('shipping.selectUnit')}</option>
                        {UNIT_GROUPS.map(g => (
                          <optgroup key={g.group} label={g.group}>
                            {g.units.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </td>
                    <td>{item.box}</td>
                    <td><button type="button" className="scan-btn" onClick={() => handleScan(item)}>📱</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShippingModule;
