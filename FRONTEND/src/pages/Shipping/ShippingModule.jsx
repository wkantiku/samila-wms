import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UNIT_GROUPS } from '../../constants/units';

function ShippingModule() {
  const { t, i18n } = useTranslation();
  const [weightUnit, setWeightUnit] = useState('KG');
  const [items, setItems] = useState([
    { id: 1, entryNumber: 'EN-2026-0001', sku: 'SKU001', quantity: 100, box: 'BOX001', unit: 'PCS' }
  ]);

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
        <div className="shipping-container">
          <form className="shipping-form">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,maxWidth:640}}>
              <div className="form-group" style={{marginBottom:0}}>
                <label>{t('shipping.soNumber')}</label>
                <input type="text" placeholder="SO-2026-0001" />
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label>{t('shipping.carrier')}</label>
                <input type="text" placeholder="Kerry Express" />
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label>{t('shipping.tracking')}</label>
                <input type="text" placeholder="TRACK123456" />
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label>{t('shipping.weight')}</label>
                <div style={{display:'flex',gap:6}}>
                  <input type="number" placeholder="0" style={{width:90}} />
                  <select value={weightUnit} onChange={e => setWeightUnit(e.target.value)} style={unitSelectStyle}>
                    <optgroup label={t('shipping.weightUnitGroup')}>
                      <option value="G">g – กรัม</option>
                      <option value="KG">kg – กิโลกรัม</option>
                      <option value="TON">ton – ตัน</option>
                      <option value="LB">lb – ปอนด์</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
            <div className="form-group" style={{maxWidth:640,marginTop:12}}>
              <label>{t('shipping.delivery')}</label>
              <textarea placeholder="Delivery address" style={{minHeight:70}}></textarea>
            </div>
            <button type="submit" className="ship-btn">📤 {t('shipping.ship')}</button>
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
                    <td><button className="scan-btn">📱</button></td>
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
