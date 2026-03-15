import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UNIT_GROUPS, MAIN_UNIT_GROUPS, SUB_UNIT_GROUPS } from '../../constants/units';
import './TarifManagement.css';

const customerList = [
  { id: 1,  name: 'บริษัท ABC จำกัด' },
  { id: 2,  name: 'บริษัท XYZ (Thailand) จำกัด' },
  { id: 3,  name: 'ห้างหุ้นส่วน DEF' },
  { id: 4,  name: 'Nayong Hospital' },
  { id: 5,  name: 'ThaiBev Co., Ltd.' },
  { id: 6,  name: 'SCG Logistics Co., Ltd.' },
];

function TarifManagement() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('inbound');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [tariffData, setTariffData] = useState({
    inbound: {
      per_pallet: 1000, per_carton: 150, per_item: 50, per_kg: 20,
      per_m3: 5000, minimum_charge: 500, qc_required: true, qc_fee: 500,
      handling_in: 0, handling_in_main_unit: '', handling_in_sub_unit: '',
    },
    storage: {
      per_pallet_day: 50, per_m3_day: 200, per_item_month: 10,
      per_pallet_month: 1000, per_m3_month: 4000, monthly_minimum: 1000, free_storage_days: 3
    },
    outbound: {
      per_order: 200, per_item: 50, per_box: 100, per_pallet: 1000,
      minimum_charge: 500, hazmat_fee: 2000, fragile_fee: 500,
      handling_out: 0, handling_out_main_unit: '', handling_out_sub_unit: '',
    },
    vas: [
      { id: 1, code: 'LABELING', name: 'Labeling', rate: 10, unit: 'PER_ITEM' },
      { id: 2, code: 'RELABEL', name: 'Relabeling', rate: 15, unit: 'PER_ITEM' },
      { id: 3, code: 'REPACK', name: 'Repacking', rate: 50, unit: 'PER_ITEM' },
      { id: 4, code: 'QC', name: 'Quality Check', rate: 5, unit: 'PER_ITEM' },
      { id: 5, code: 'CONSOLIDATION', name: 'Consolidation', rate: 200, unit: 'PER_ORDER' }
    ],
    special: [
      { id: 1, code: 'COLD_STORAGE', name: 'Cold Storage', rate: 5000, unit: 'PER_M3_DAY' },
      { id: 2, code: 'FROZEN', name: 'Frozen Storage', rate: 8000, unit: 'PER_M3_DAY' },
      { id: 3, code: 'HAZMAT', name: 'Hazmat Handling', rate: 10000, unit: 'PER_MONTH' }
    ]
  });

  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEditingId(null);
  };

  const handleEditStart = (id) => {
    setEditingId(id);
    if (activeTab === 'vas') {
      setEditValues(tariffData.vas.find(v => v.id === id));
    } else if (activeTab === 'special') {
      setEditValues(tariffData.special.find(s => s.id === id));
    }
  };

  const handleEditSave = () => {
    if (activeTab === 'vas') {
      setTariffData({ ...tariffData, vas: tariffData.vas.map(v => v.id === editingId ? editValues : v) });
    } else if (activeTab === 'special') {
      setTariffData({ ...tariffData, special: tariffData.special.map(s => s.id === editingId ? editValues : s) });
    }
    setEditingId(null);
  };

  const handleInputChange = (field, value) => {
    if (['inbound', 'storage', 'outbound'].includes(activeTab)) {
      setTariffData({ ...tariffData, [activeTab]: { ...tariffData[activeTab], [field]: isNaN(value) ? value : parseFloat(value) } });
    } else {
      setEditValues({ ...editValues, [field]: value });
    }
  };

  const handleDeleteItem = (id) => {
    if (activeTab === 'vas') {
      setTariffData({ ...tariffData, vas: tariffData.vas.filter(v => v.id !== id) });
    } else if (activeTab === 'special') {
      setTariffData({ ...tariffData, special: tariffData.special.filter(s => s.id !== id) });
    }
  };

  return (
    <div className="tarif-container">
      <div className="tarif-header">
        <div className="tarif-header-left">
          <h2>💰 {t('tarif.title')}</h2>
          <p>{t('tarif.subtitle')}</p>
        </div>
        <div className="tarif-header-selectors">
          <div className="tarif-customer-selector">
            <label className="tarif-cust-label">🏢 Customers</label>
            <select
              className="tarif-cust-select"
              value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value)}
            >
              <option value="">{t('tarif.selectCustomer')}</option>
              {customerList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {selectedCustomer && (
              <button className="tarif-cust-clear" onClick={() => setSelectedCustomer('')} title="ล้างการเลือก">✕</button>
            )}
          </div>

          <div className="tarif-customer-selector">
            <label className="tarif-cust-label">📋 ประเภทบริการ</label>
            <select
              className="tarif-cust-select tarif-category-select"
              value={activeTab}
              onChange={e => handleTabChange(e.target.value)}
            >
              <option value="inbound">📥 INBOUND</option>
              <option value="storage">📦 STORAGE</option>
              <option value="outbound">📤 OUTBOUND</option>
              <option value="vas">⭐ VAS</option>
              <option value="special">🔧 SPECIAL</option>
            </select>
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <div className="tarif-cust-badge">
          <span className="tarif-cust-badge-icon">🏢</span>
          <span className="tarif-cust-badge-name">
            {customerList.find(c => c.id === +selectedCustomer)?.name}
          </span>
          <span className="tarif-cust-badge-note">— กำลังแสดง/ตั้งค่าราคาสำหรับลูกค้านี้</span>
        </div>
      )}

      <div className="tarif-tabs">
        {['inbound', 'storage', 'outbound', 'vas', 'special'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => handleTabChange(tab)}>
            {tab === 'inbound' ? `📥 ${t('tarif.tabInbound')}` : tab === 'storage' ? `📦 ${t('tarif.tabStorage')}` : tab === 'outbound' ? `📤 ${t('tarif.tabOutbound')}` : tab === 'vas' ? `⭐ ${t('tarif.tabVAS')}` : `🔧 ${t('tarif.tabSpecial')}`}
          </button>
        ))}
      </div>

      {activeTab === 'inbound' && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>Inbound/Receiving Tarif</h3>
            <div className="tarif-grid" style={{maxWidth:760}}>
              {[['per_pallet','Per Pallet'],['per_carton','Per Carton'],['per_item','Per Item'],['per_kg','Per KG'],['per_m3','Per M3'],['minimum_charge','Minimum Charge'],['qc_fee','QC Fee']].map(([field, label]) => (
                <div key={field} className="tarif-field">
                  <label>{label} (บาท)</label>
                  <input type="number" value={tariffData.inbound[field]} onChange={e => handleInputChange(field, e.target.value)} className="tarif-input" />
                </div>
              ))}
              <div className="tarif-field checkbox">
                <label>
                  <input type="checkbox" checked={tariffData.inbound.qc_required} onChange={e => handleInputChange('qc_required', e.target.checked)} />
                  Require QC
                </label>
              </div>
            </div>

            <div className="tarif-subsection">
              <h4 className="tarif-subsection-title">🔄 ค่า Handling IN</h4>
              <div className="tarif-grid" style={{maxWidth:580}}>

                <div className="tarif-field">
                  <label>ค่า Handling IN (บาท)</label>
                  <input type="number" value={tariffData.inbound.handling_in} onChange={e => handleInputChange('handling_in', e.target.value)} className="tarif-input tarif-input-highlight" />
                </div>
                <div className="tarif-field">
                  <label>Main Unit</label>
                  <select value={tariffData.inbound.handling_in_main_unit} onChange={e => handleInputChange('handling_in_main_unit', e.target.value)} className="tarif-input tarif-input-highlight tarif-unit-select">
                    <option value="">— เลือก Main Unit —</option>
                    {MAIN_UNIT_GROUPS.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="tarif-field">
                  <label>Sub Unit</label>
                  <select value={tariffData.inbound.handling_in_sub_unit} onChange={e => handleInputChange('handling_in_sub_unit', e.target.value)} className="tarif-input tarif-input-highlight tarif-unit-select">
                    <option value="">— เลือก Sub Unit —</option>
                    {SUB_UNIT_GROUPS.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button className="save-btn">💾 Save Inbound Tarif</button>
          </div>
        </div>
      )}

      {activeTab === 'storage' && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>Storage/Warehousing Tarif</h3>
            <div className="tarif-grid" style={{maxWidth:760}}>
              {[['per_pallet_day','Per Pallet/Day'],['per_m3_day','Per M3/Day'],['per_item_month','Per Item/Month'],['per_pallet_month','Per Pallet/Month'],['per_m3_month','Per M3/Month'],['monthly_minimum','Monthly Minimum'],['free_storage_days','Free Storage Days']].map(([field, label]) => (
                <div key={field} className="tarif-field">
                  <label>{label} (บาท)</label>
                  <input type="number" value={tariffData.storage[field]} onChange={e => handleInputChange(field, e.target.value)} className="tarif-input" />
                </div>
              ))}
            </div>
            <button className="save-btn">💾 Save Storage Tarif</button>
          </div>
        </div>
      )}

      {activeTab === 'outbound' && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>Outbound/Shipping Tarif</h3>
            <div className="tarif-grid" style={{maxWidth:760}}>
              {[['per_order','Per Order'],['per_item','Per Item'],['per_box','Per Box'],['per_pallet','Per Pallet'],['minimum_charge','Minimum Charge'],['hazmat_fee','Hazmat Fee'],['fragile_fee','Fragile Fee']].map(([field, label]) => (
                <div key={field} className="tarif-field">
                  <label>{label} (บาท)</label>
                  <input type="number" value={tariffData.outbound[field]} onChange={e => handleInputChange(field, e.target.value)} className="tarif-input" />
                </div>
              ))}
            </div>

            <div className="tarif-subsection">
              <h4 className="tarif-subsection-title">🔄 ค่า Handling OUT</h4>
              <div className="tarif-grid" style={{maxWidth:580}}>
                <div className="tarif-field">
                  <label>ค่า Handling OUT (บาท)</label>
                  <input type="number" value={tariffData.outbound.handling_out} onChange={e => handleInputChange('handling_out', e.target.value)} className="tarif-input tarif-input-highlight" />
                </div>
                <div className="tarif-field">
                  <label>Main Unit</label>
                  <select value={tariffData.outbound.handling_out_main_unit} onChange={e => handleInputChange('handling_out_main_unit', e.target.value)} className="tarif-input tarif-input-highlight tarif-unit-select">
                    <option value="">— เลือก Main Unit —</option>
                    {MAIN_UNIT_GROUPS.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="tarif-field">
                  <label>Sub Unit</label>
                  <select value={tariffData.outbound.handling_out_sub_unit} onChange={e => handleInputChange('handling_out_sub_unit', e.target.value)} className="tarif-input tarif-input-highlight tarif-unit-select">
                    <option value="">— เลือก Sub Unit —</option>
                    {SUB_UNIT_GROUPS.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button className="save-btn">💾 Save Outbound Tarif</button>
          </div>
        </div>
      )}

      {(activeTab === 'vas' || activeTab === 'special') && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>{activeTab === 'vas' ? 'Value Added Services (VAS)' : 'Special Services'}</h3>
            <table className="tarif-table">
              <thead>
                <tr><th>Service Code</th><th>Service Name</th><th>Rate (บาท)</th><th>Unit</th><th>Action</th></tr>
              </thead>
              <tbody>
                {tariffData[activeTab].map(item => (
                  <tr key={item.id}>
                    {editingId === item.id ? (
                      <>
                        <td><input type="text" value={editValues.code} onChange={e => setEditValues({...editValues, code: e.target.value})} /></td>
                        <td><input type="text" value={editValues.name} onChange={e => setEditValues({...editValues, name: e.target.value})} /></td>
                        <td><input type="number" value={editValues.rate} onChange={e => setEditValues({...editValues, rate: parseFloat(e.target.value)})} /></td>
                        <td>
                          <select value={editValues.unit} onChange={e => setEditValues({...editValues, unit: e.target.value})}
                            style={{ padding: '6px 8px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,188,212,0.4)', borderRadius: 4, fontSize: 12, color: '#ffffff', fontFamily: 'inherit', width: '100%', fontWeight: 600 }}>
                            <option value="">— เลือกหน่วย —</option>
                            {UNIT_GROUPS.map(g => (
                              <optgroup key={g.group} label={g.group}>
                                {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                              </optgroup>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button onClick={handleEditSave} className="save-mini">✓</button>
                          <button onClick={() => setEditingId(null)} className="cancel-mini">✕</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{item.code}</td>
                        <td>{item.name}</td>
                        <td>฿{item.rate.toLocaleString()}</td>
                        <td>{item.unit}</td>
                        <td>
                          <button onClick={() => handleEditStart(item.id)} className="edit-btn">✏️</button>
                          <button onClick={() => handleDeleteItem(item.id)} className="delete-btn">🗑️</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-btn">➕ Add {activeTab === 'vas' ? 'VAS' : 'Special Service'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TarifManagement;
