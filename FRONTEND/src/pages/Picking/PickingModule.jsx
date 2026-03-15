import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UNIT_GROUPS } from '../../constants/units';
import { ZONES, ZONE_OPTIONS, locationToZone } from '../../constants/zones';
import * as XLSX from 'xlsx';

const initItems = [
  { id: 1, entryNumber: 'EN-2026-0001', sku: 'SKU001', location: 'A-01-1-A', toPick: 100, picked: 50, unit: 'PCS' },
];

function PickingModule() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState(initItems);
  const [unitFilter, setUnitFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  const INLINE_COUNT = 10;
  const emptyInlineRow = () => ({ entryNumber: '', sku: '', location: '', toPick: '', unit: 'PCS' });
  const [inlineRows, setInlineRows] = useState(() => Array.from({ length: INLINE_COUNT }, emptyInlineRow));

  const updateInlineRow = (idx, field, value) => {
    setInlineRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const saveInlineRow = (idx) => {
    const row = inlineRows[idx];
    if (!row.sku.trim()) { alert('กรุณาระบุ SKU'); return; }
    if (!row.toPick || Number(row.toPick) <= 0) { alert('กรุณาระบุ To Pick Qty'); return; }
    setItems(prev => [...prev, { id: Date.now() + idx, sku: row.sku, location: row.location || '-', toPick: Number(row.toPick), picked: 0, unit: row.unit }]);
    setInlineRows(prev => prev.map((r, i) => i === idx ? emptyInlineRow() : r));
  };

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const unitSelectStyle = {
    padding: '6px 8px', background: 'rgba(0,20,40,0.8)',
    border: '1px solid rgba(0,188,212,0.4)', borderRadius: 5,
    fontSize: 12, color: '#ffffff', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600
  };

  const filtered = items
    .filter(i => !unitFilter || i.unit === unitFilter)
    .filter(i => !zoneFilter || locationToZone(i.location) === zoneFilter);

  const downloadTemplate = () => {
    const headers = ['SKU','Location','To Pick (Qty)','Unit'];
    const example = ['SKU001','A-01-1-A','100','PCS'];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Picking Template');
    XLSX.writeFile(wb, 'template_picking.xlsx');
  };

  return (
    <div className="wms-module picking-module">
      <div className="module-header">
        <h1>{t('picking.title')}</h1>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={downloadTemplate} className="export-btn" style={{background:'rgba(0,204,136,0.12)',color:'#00CC88',border:'1px solid rgba(0,204,136,0.3)'}}>📋 Download Template</button>
          <button onClick={toggleLanguage} className="lang-btn">
            {i18n.language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
          </button>
        </div>
      </div>

      <div className="module-content">
        <div className="picking-container">
          <h2>{t('picking.pickList')}</h2>
          <div className="picking-form">
            <div className="form-group" style={{maxWidth:300}}>
              <label>{t('picking.pickList')}</label>
              <input type="text" placeholder="PICK-2026-0001" />
            </div>

            <div className="picking-items">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h3 style={{ margin: 0 }}>{t('picking.items')}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#5a8fa8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zone</span>
                  <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} style={unitSelectStyle}>
                    {ZONE_OPTIONS.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
                  </select>
                  <span style={{ fontSize: 11, color: '#5a8fa8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('picking.filterUnit')}</span>
                  <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)} style={unitSelectStyle}>
                    <option value="">{t('picking.allUnits')}</option>
                    {UNIT_GROUPS.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <table className="scan-table">
                <thead>
                  <tr>
                    <th>Entry No.</th>
                    <th>{t('common.sku')}</th>
                    <th>Zone</th>
                    <th>{t('picking.location')}</th>
                    <th>{t('picking.unit')}</th>
                    <th>{t('picking.toPick')}</th>
                    <th>{t('picking.picked')}</th>
                    <th>{t('picking.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#FFD700', fontWeight: 700 }}>{item.entryNumber || '-'}</td>
                      <td>{item.sku}</td>
                      <td>{(() => { const z = ZONES.find(z => z.id === locationToZone(item.location)); return z ? <span style={{ background: `${z.color}18`, color: z.color, padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{z.label}</span> : '-'; })()}</td>
                      <td>{item.location}</td>
                      <td>
                        <select
                          value={item.unit}
                          onChange={e => updateItem(item.id, 'unit', e.target.value)}
                          style={unitSelectStyle}
                        >
                          <option value="">{t('picking.selectUnit')}</option>
                          {UNIT_GROUPS.map(g => (
                            <optgroup key={g.group} label={g.group}>
                              {g.units.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      </td>
                      <td>{item.toPick}</td>
                      <td>{item.picked}</td>
                      <td>
                        <input type="number" placeholder="0" style={{ width: 60, marginRight: 6 }} />
                        <button className="scan-btn">📱</button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && inlineRows.every(r => !r.sku) && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 20, color: '#3a6a82', fontSize: 13 }}>{t('picking.notFound')}</td></tr>
                  )}
                  {/* ── 10 Inline Input Rows ── */}
                  {inlineRows.map((row, idx) => {
                    const iStyle = { background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)', borderRadius: 4, color: '#cce4ef', padding: '4px 6px', fontSize: 11, width: '100%', minWidth: 50, boxSizing: 'border-box' };
                    const selStyle = { ...iStyle, cursor: 'pointer' };
                    const zoneId = locationToZone(row.location);
                    const z = ZONES.find(z => z.id === zoneId);
                    return (
                      <tr key={`inline-${idx}`} style={{ background: 'rgba(0,229,255,0.02)' }}>
                        <td><input value={row.entryNumber} onChange={e => updateInlineRow(idx, 'entryNumber', e.target.value)} placeholder="EN-2026-..." style={{ ...iStyle, borderColor: 'rgba(255,215,0,0.35)', color: '#FFD700' }} /></td>
                        <td><input value={row.sku} onChange={e => updateInlineRow(idx, 'sku', e.target.value)} placeholder="SKU *" style={{ ...iStyle, borderColor: 'rgba(0,229,255,0.35)' }} /></td>
                        <td>{z ? <span style={{ background: `${z.color}18`, color: z.color, padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{z.label}</span> : <span style={{ color: '#3a6a82', fontSize: 11 }}>Auto</span>}</td>
                        <td><input value={row.location} onChange={e => updateInlineRow(idx, 'location', e.target.value)} placeholder="A-01-1-A" style={iStyle} /></td>
                        <td>
                          <select value={row.unit} onChange={e => updateInlineRow(idx, 'unit', e.target.value)} style={selStyle}>
                            <option value="">{t('picking.selectUnit')}</option>
                            {UNIT_GROUPS.map(g => <optgroup key={g.group} label={g.group}>{g.units.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}</optgroup>)}
                          </select>
                        </td>
                        <td><input type="number" min="1" value={row.toPick} onChange={e => updateInlineRow(idx, 'toPick', e.target.value)} placeholder="Qty *" style={{ ...iStyle, maxWidth: 65 }} /></td>
                        <td style={{ color: '#3a6a82', fontSize: 11 }}>0</td>
                        <td>
                          <button onClick={() => saveInlineRow(idx)} style={{ background: 'rgba(0,204,136,0.15)', color: '#00CC88', border: '1px solid rgba(0,204,136,0.3)', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>+ Save</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button className="complete-btn">{t('buttons.complete')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PickingModule;
