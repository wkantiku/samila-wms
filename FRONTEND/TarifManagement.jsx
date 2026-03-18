import React, { useState, useEffect } from 'react';
import './TarifManagement.css';

function TarifManagement() {
  const [activeTab, setActiveTab] = useState('inbound');
  const [tariffData, setTariffData] = useState({
    inbound: {
      per_pallet: 1000,
      per_carton: 150,
      per_item: 50,
      per_kg: 20,
      per_m3: 5000,
      minimum_charge: 500,
      qc_required: true,
      qc_fee: 500
    },
    storage: {
      per_pallet_day: 50,
      per_m3_day: 200,
      per_item_month: 10,
      per_pallet_month: 1000,
      per_m3_month: 4000,
      monthly_minimum: 1000,
      free_storage_days: 3
    },
    outbound: {
      per_order: 200,
      per_item: 50,
      per_box: 100,
      per_pallet: 1000,
      minimum_charge: 500,
      hazmat_fee: 2000,
      fragile_fee: 500
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
      const item = tariffData.vas.find(v => v.id === id);
      setEditValues(item);
    } else if (activeTab === 'special') {
      const item = tariffData.special.find(s => s.id === id);
      setEditValues(item);
    }
  };

  const handleEditSave = () => {
    if (activeTab === 'vas') {
      setTariffData({
        ...tariffData,
        vas: tariffData.vas.map(v => v.id === editingId ? editValues : v)
      });
    } else if (activeTab === 'special') {
      setTariffData({
        ...tariffData,
        special: tariffData.special.map(s => s.id === editingId ? editValues : s)
      });
    }
    setEditingId(null);
  };

  const handleInputChange = (field, value) => {
    if (activeTab === 'inbound' || activeTab === 'storage' || activeTab === 'outbound') {
      setTariffData({
        ...tariffData,
        [activeTab]: {
          ...tariffData[activeTab],
          [field]: isNaN(value) ? value : parseFloat(value)
        }
      });
    } else {
      setEditValues({
        ...editValues,
        [field]: value
      });
    }
  };

  const handleDeleteItem = (id) => {
    if (activeTab === 'vas') {
      setTariffData({
        ...tariffData,
        vas: tariffData.vas.filter(v => v.id !== id)
      });
    } else if (activeTab === 'special') {
      setTariffData({
        ...tariffData,
        special: tariffData.special.filter(s => s.id !== id)
      });
    }
  };

  return (
    <div className="tarif-container">
      <div className="tarif-header">
        <h2>💰 Tarif Management</h2>
        <p>Configure pricing for all WMS services</p>
      </div>

      {/* Tabs */}
      <div className="tarif-tabs">
        <button 
          className={`tab-btn ${activeTab === 'inbound' ? 'active' : ''}`}
          onClick={() => handleTabChange('inbound')}
        >
          📥 Inbound
        </button>
        <button 
          className={`tab-btn ${activeTab === 'storage' ? 'active' : ''}`}
          onClick={() => handleTabChange('storage')}
        >
          📦 Storage
        </button>
        <button 
          className={`tab-btn ${activeTab === 'outbound' ? 'active' : ''}`}
          onClick={() => handleTabChange('outbound')}
        >
          📤 Outbound
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vas' ? 'active' : ''}`}
          onClick={() => handleTabChange('vas')}
        >
          ⭐ VAS
        </button>
        <button 
          className={`tab-btn ${activeTab === 'special' ? 'active' : ''}`}
          onClick={() => handleTabChange('special')}
        >
          🔧 Special
        </button>
      </div>

      {/* Inbound Tarif */}
      {activeTab === 'inbound' && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>Inbound/Receiving Tarif</h3>
            <div className="tarif-grid">
              <div className="tarif-field">
                <label>Per Pallet (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.inbound.per_pallet}
                  onChange={(e) => handleInputChange('per_pallet', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Per Carton (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.inbound.per_carton}
                  onChange={(e) => handleInputChange('per_carton', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Per Item (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.inbound.per_item}
                  onChange={(e) => handleInputChange('per_item', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Per KG (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.inbound.per_kg}
                  onChange={(e) => handleInputChange('per_kg', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Per M3 (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.inbound.per_m3}
                  onChange={(e) => handleInputChange('per_m3', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Minimum Charge (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.inbound.minimum_charge}
                  onChange={(e) => handleInputChange('minimum_charge', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>QC Fee (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.inbound.qc_fee}
                  onChange={(e) => handleInputChange('qc_fee', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field checkbox">
                <label>
                  <input 
                    type="checkbox" 
                    checked={tariffData.inbound.qc_required}
                    onChange={(e) => handleInputChange('qc_required', e.target.checked)}
                  />
                  Require QC
                </label>
              </div>
            </div>
            <button className="save-btn">💾 Save Inbound Tarif</button>
          </div>
        </div>
      )}

      {/* Storage Tarif */}
      {activeTab === 'storage' && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>Storage/Warehousing Tarif</h3>
            <div className="tarif-grid">
              <div className="tarif-field">
                <label>Per Pallet/Day (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.storage.per_pallet_day}
                  onChange={(e) => handleInputChange('per_pallet_day', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Per M3/Day (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.storage.per_m3_day}
                  onChange={(e) => handleInputChange('per_m3_day', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Per Item/Month (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.storage.per_item_month}
                  onChange={(e) => handleInputChange('per_item_month', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Per Pallet/Month (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.storage.per_pallet_month}
                  onChange={(e) => handleInputChange('per_pallet_month', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Per M3/Month (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.storage.per_m3_month}
                  onChange={(e) => handleInputChange('per_m3_month', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Monthly Minimum (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.storage.monthly_minimum}
                  onChange={(e) => handleInputChange('monthly_minimum', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Free Storage Days</label>
                <input 
                  type="number" 
                  value={tariffData.storage.free_storage_days}
                  onChange={(e) => handleInputChange('free_storage_days', e.target.value)}
                  className="tarif-input"
                />
              </div>
            </div>
            <button className="save-btn">💾 Save Storage Tarif</button>
          </div>
        </div>
      )}

      {/* Outbound Tarif */}
      {activeTab === 'outbound' && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>Outbound/Shipping Tarif</h3>
            <div className="tarif-grid">
              <div className="tarif-field">
                <label>Per Order (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.outbound.per_order}
                  onChange={(e) => handleInputChange('per_order', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Per Item (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.outbound.per_item}
                  onChange={(e) => handleInputChange('per_item', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Per Box (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.outbound.per_box}
                  onChange={(e) => handleInputChange('per_box', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Per Pallet (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.outbound.per_pallet}
                  onChange={(e) => handleInputChange('per_pallet', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Minimum Charge (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.outbound.minimum_charge}
                  onChange={(e) => handleInputChange('minimum_charge', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Hazmat Fee (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.outbound.hazmat_fee}
                  onChange={(e) => handleInputChange('hazmat_fee', e.target.value)}
                  className="tarif-input"
                />
              </div>
              <div className="tarif-field">
                <label>Fragile Fee (บาท)</label>
                <input 
                  type="number" 
                  value={tariffData.outbound.fragile_fee}
                  onChange={(e) => handleInputChange('fragile_fee', e.target.value)}
                  className="tarif-input"
                />
              </div>
            </div>
            <button className="save-btn">💾 Save Outbound Tarif</button>
          </div>
        </div>
      )}

      {/* Value Added Services */}
      {activeTab === 'vas' && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>Value Added Services (VAS)</h3>
            <table className="tarif-table">
              <thead>
                <tr>
                  <th>Service Code</th>
                  <th>Service Name</th>
                  <th>Rate (บาท)</th>
                  <th>Unit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tariffData.vas.map(vas => (
                  <tr key={vas.id}>
                    {editingId === vas.id ? (
                      <>
                        <td><input type="text" value={editValues.code} onChange={(e) => setEditValues({...editValues, code: e.target.value})} /></td>
                        <td><input type="text" value={editValues.name} onChange={(e) => setEditValues({...editValues, name: e.target.value})} /></td>
                        <td><input type="number" value={editValues.rate} onChange={(e) => setEditValues({...editValues, rate: parseFloat(e.target.value)})} /></td>
                        <td><input type="text" value={editValues.unit} onChange={(e) => setEditValues({...editValues, unit: e.target.value})} /></td>
                        <td>
                          <button onClick={handleEditSave} className="save-mini">✓</button>
                          <button onClick={() => setEditingId(null)} className="cancel-mini">✕</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{vas.code}</td>
                        <td>{vas.name}</td>
                        <td>฿{vas.rate.toLocaleString()}</td>
                        <td>{vas.unit}</td>
                        <td>
                          <button onClick={() => handleEditStart(vas.id)} className="edit-btn">✏️</button>
                          <button onClick={() => handleDeleteItem(vas.id)} className="delete-btn">🗑️</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-btn">➕ Add VAS</button>
          </div>
        </div>
      )}

      {/* Special Services */}
      {activeTab === 'special' && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>Special Services</h3>
            <table className="tarif-table">
              <thead>
                <tr>
                  <th>Service Code</th>
                  <th>Service Name</th>
                  <th>Rate (บาท)</th>
                  <th>Unit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tariffData.special.map(special => (
                  <tr key={special.id}>
                    {editingId === special.id ? (
                      <>
                        <td><input type="text" value={editValues.code} onChange={(e) => setEditValues({...editValues, code: e.target.value})} /></td>
                        <td><input type="text" value={editValues.name} onChange={(e) => setEditValues({...editValues, name: e.target.value})} /></td>
                        <td><input type="number" value={editValues.rate} onChange={(e) => setEditValues({...editValues, rate: parseFloat(e.target.value)})} /></td>
                        <td><input type="text" value={editValues.unit} onChange={(e) => setEditValues({...editValues, unit: e.target.value})} /></td>
                        <td>
                          <button onClick={handleEditSave} className="save-mini">✓</button>
                          <button onClick={() => setEditingId(null)} className="cancel-mini">✕</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{special.code}</td>
                        <td>{special.name}</td>
                        <td>฿{special.rate.toLocaleString()}</td>
                        <td>{special.unit}</td>
                        <td>
                          <button onClick={() => handleEditStart(special.id)} className="edit-btn">✏️</button>
                          <button onClick={() => handleDeleteItem(special.id)} className="delete-btn">🗑️</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-btn">➕ Add Special Service</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TarifManagement;
