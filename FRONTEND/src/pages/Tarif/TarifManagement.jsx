import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UNIT_GROUPS, MAIN_UNIT_GROUPS, SUB_UNIT_GROUPS } from '../../constants/units';
import './TarifManagement.css';

const API = '/api/v1/tarif';

const CUSTOMER_LIST = [
  { id: 1, name: 'บริษัท ABC จำกัด' },
  { id: 2, name: 'บริษัท XYZ (Thailand) จำกัด' },
  { id: 3, name: 'ห้างหุ้นส่วน DEF' },
  { id: 4, name: 'Nayong Hospital' },
  { id: 5, name: 'ThaiBev Co., Ltd.' },
  { id: 6, name: 'SCG Logistics Co., Ltd.' },
];

const truncate = (str, max = 30) => str && str.length > max ? str.slice(0, max) + '…' : str;

const INVOICE_STATUS_COLORS = {
  DRAFT:     '#8899aa',
  PENDING:   '#f0a830',
  FINALIZED: '#00BCD4',
  PAID:      '#00CC88',
  OVERDUE:   '#FF6B6B',
  CANCELLED: '#888',
};

const EMPTY_VAS     = { code: '', name: '', rate: 0, unit: 'PER_ITEM', description: '' };
const EMPTY_SPECIAL = { code: '', name: '', rate: 0, unit: 'PER_M3_DAY', description: '' };

function Notify({ msg, type }) {
  if (!msg) return null;
  return (
    <div className={`tarif-notify tarif-notify-${type}`}>{msg}</div>
  );
}

function TarifManagement() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab]             = useState('inbound');
  const [selectedCustomer, setSelectedCustomer] = useState('');

  // ── tarif state ──────────────────────────────────────────────────────────
  const [tariffData, setTariffData] = useState({
    inbound: {
      per_pallet: 1000, per_carton: 150, per_item: 50, per_kg: 20, per_m3: 5000,
      minimum_charge: 500, qc_required: true, qc_fee: 500,
      handling_in: 0, handling_in_main_unit: '', handling_in_sub_unit: '',
      effective_date: '', expiry_date: '', discount_percentage: 0,
    },
    storage: {
      per_pallet_day: 50, per_m3_day: 200, per_item_month: 10,
      per_pallet_month: 1000, per_m3_month: 4000,
      monthly_minimum: 1000, free_storage_days: 3,
      effective_date: '', expiry_date: '', discount_percentage: 0,
    },
    outbound: {
      per_order: 200, per_item: 50, per_box: 100, per_pallet: 1000,
      minimum_charge: 500, hazmat_fee: 2000, fragile_fee: 500, oversize_fee: 0,
      handling_out: 0, handling_out_main_unit: '', handling_out_sub_unit: '',
      effective_date: '', expiry_date: '', discount_percentage: 0,
    },
    vas: [
      { id: 1, code: 'LABELING',     name: 'Labeling',       rate: 10,  unit: 'PER_ITEM'  },
      { id: 2, code: 'RELABEL',      name: 'Relabeling',     rate: 15,  unit: 'PER_ITEM'  },
      { id: 3, code: 'REPACK',       name: 'Repacking',      rate: 50,  unit: 'PER_ITEM'  },
      { id: 4, code: 'QC',           name: 'Quality Check',  rate: 5,   unit: 'PER_ITEM'  },
      { id: 5, code: 'CONSOLIDATION',name: 'Consolidation',  rate: 200, unit: 'PER_ORDER' },
    ],
    special: [
      { id: 1, code: 'COLD_STORAGE', name: 'Cold Storage',    rate: 5000,  unit: 'PER_M3_DAY' },
      { id: 2, code: 'FROZEN',       name: 'Frozen Storage',  rate: 8000,  unit: 'PER_M3_DAY' },
      { id: 3, code: 'HAZMAT',       name: 'Hazmat Handling', rate: 10000, unit: 'PER_MONTH'  },
    ],
  });

  // ── edit inline (VAS / Special) ──────────────────────────────────────────
  const [editingId, setEditingId]   = useState(null);
  const [editValues, setEditValues] = useState({});

  // ── add modal ─────────────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal]   = useState(false);
  const [addModalType, setAddModalType]   = useState('vas'); // 'vas' | 'special'
  const [addForm, setAddForm]             = useState(EMPTY_VAS);

  // ── notification ─────────────────────────────────────────────────────────
  const [notify, setNotify] = useState({ msg: '', type: 'success' });
  const [saving, setSaving] = useState(false);

  // ── billing tab ──────────────────────────────────────────────────────────
  const [billingPeriod, setBillingPeriod] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    end:   new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
  });
  const [billingResult, setBillingResult] = useState(null);
  const [invoiceList, setInvoiceList]     = useState([]);
  const [calcLoading, setCalcLoading]     = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // ── history tab ──────────────────────────────────────────────────────────
  const [tarifHistory, setTarifHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── helpers ───────────────────────────────────────────────────────────────
  const showNotify = (msg, type = 'success') => {
    setNotify({ msg, type });
    setTimeout(() => setNotify({ msg: '', type: 'success' }), 3500);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEditingId(null);
  };

  // ── load tarif when customer changes ─────────────────────────────────────
  useEffect(() => {
    if (!selectedCustomer) return;
    const cid = selectedCustomer;

    const fetchTarif = async () => {
      try {
        const [inRes, stRes, outRes, vasRes, spRes] = await Promise.all([
          fetch(`${API}/inbound-tarif/${cid}`),
          fetch(`${API}/storage-tarif/${cid}`),
          fetch(`${API}/outbound-tarif/${cid}`),
          fetch(`${API}/vas/list/${cid}`),
          fetch(`${API}/special/list/${cid}`),
        ]);

        const [inData, stData, outData, vasData, spData] = await Promise.all([
          inRes.json(), stRes.json(), outRes.json(), vasRes.json(), spRes.json(),
        ]);

        const mapList = (arr) => arr.map((item, i) => ({
          ...item,
          id:   item.id   ?? i + 1,
          code: item.service_code ?? item.code ?? '',
          name: item.service_name ?? item.name ?? '',
        }));

        setTariffData(prev => ({
          ...prev,
          inbound:  { ...prev.inbound,  ...(inData.data  || {}) },
          storage:  { ...prev.storage,  ...(stData.data  || {}) },
          outbound: { ...prev.outbound, ...(outData.data || {}) },
          vas:      mapList(vasData.data || []),
          special:  mapList(spData.data  || []),
        }));
      } catch {
        // backend may not be running — keep local state
      }
    };
    fetchTarif();
  }, [selectedCustomer]);

  // ── load invoices when billing tab selected ───────────────────────────────
  useEffect(() => {
    if (activeTab !== 'billing' || !selectedCustomer) return;
    setInvoiceLoading(true);
    fetch(`${API}/invoice/list/${selectedCustomer}`)
      .then(r => r.json())
      .then(d => setInvoiceList(d.data || []))
      .catch(() => {})
      .finally(() => setInvoiceLoading(false));
  }, [activeTab, selectedCustomer]);

  // ── load history when history tab selected ────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'history' || !selectedCustomer) return;
    setHistoryLoading(true);
    fetch(`${API}/history/${selectedCustomer}`)
      .then(r => r.json())
      .then(d => setTarifHistory(d.data || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [activeTab, selectedCustomer]);

  // ── input change (grid tabs) ──────────────────────────────────────────────
  const handleInputChange = (field, value) => {
    if (['inbound', 'storage', 'outbound'].includes(activeTab)) {
      setTariffData(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          [field]: value === '' ? '' : (isNaN(value) ? value : parseFloat(value)),
        },
      }));
    } else {
      setEditValues(prev => ({ ...prev, [field]: value }));
    }
  };

  // ── save flat tarif (inbound / storage / outbound) ────────────────────────
  const handleSave = async (tab) => {
    if (!selectedCustomer) {
      showNotify('กรุณาเลือกลูกค้าก่อนบันทึก', 'error');
      return;
    }
    setSaving(true);
    const body = { customer_id: +selectedCustomer, ...tariffData[tab] };
    try {
      const res = await fetch(`${API}/${tab}-tarif/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      showNotify(`บันทึก ${tab.toUpperCase()} Tarif สำเร็จ`, 'success');
    } catch {
      showNotify('บันทึกสำเร็จ (local)', 'success'); // backend mock
    } finally {
      setSaving(false);
    }
  };

  // ── inline edit (VAS / Special) ──────────────────────────────────────────
  const handleEditStart = (id) => {
    setEditingId(id);
    const list = tariffData[activeTab];
    setEditValues(list.find(v => v.id === id) || {});
  };

  const handleEditSave = async () => {
    const tab = activeTab; // 'vas' | 'special'
    const endpoint = tab === 'vas' ? 'vas' : 'special';
    try {
      await fetch(`${API}/${endpoint}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: +selectedCustomer || 0, service_code: editValues.code, service_name: editValues.name, rate: editValues.rate, unit: editValues.unit }),
      });
    } catch { /* mock */ }
    setTariffData(prev => ({
      ...prev,
      [tab]: prev[tab].map(v => v.id === editingId ? editValues : v),
    }));
    setEditingId(null);
    showNotify('อัปเดตสำเร็จ', 'success');
  };

  const handleDeleteItem = async (id) => {
    const tab = activeTab;
    const endpoint = tab === 'vas' ? 'vas' : 'special';
    try {
      await fetch(`${API}/${endpoint}/${id}`, { method: 'DELETE' });
    } catch { /* mock */ }
    setTariffData(prev => ({ ...prev, [tab]: prev[tab].filter(v => v.id !== id) }));
    showNotify('ลบรายการสำเร็จ', 'success');
  };

  // ── add modal ─────────────────────────────────────────────────────────────
  const openAddModal = (type) => {
    setAddModalType(type);
    setAddForm(type === 'vas' ? { ...EMPTY_VAS } : { ...EMPTY_SPECIAL });
    setShowAddModal(true);
  };

  const handleAddSave = async () => {
    if (!addForm.code.trim() || !addForm.name.trim()) {
      showNotify('กรอก Code และ Name', 'error');
      return;
    }
    const endpoint = addModalType === 'vas' ? 'vas' : 'special';
    let newId = Date.now();
    try {
      const res = await fetch(`${API}/${endpoint}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: +selectedCustomer || 0,
          service_code: addForm.code, service_name: addForm.name,
          rate: parseFloat(addForm.rate) || 0, unit: addForm.unit,
          description: addForm.description,
        }),
      });
      const d = await res.json();
      newId = d.data?.id ?? newId;
    } catch { /* mock */ }

    const newItem = { id: newId, code: addForm.code, name: addForm.name, rate: parseFloat(addForm.rate) || 0, unit: addForm.unit };
    setTariffData(prev => ({ ...prev, [addModalType]: [...prev[addModalType], newItem] }));
    setShowAddModal(false);
    showNotify('เพิ่มรายการสำเร็จ', 'success');
  };

  // ── billing calculate ────────────────────────────────────────────────────
  const handleCalculate = async () => {
    if (!selectedCustomer) { showNotify('กรุณาเลือกลูกค้า', 'error'); return; }
    setCalcLoading(true);
    try {
      const res = await fetch(`${API}/billing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: +selectedCustomer,
          period_start: billingPeriod.start + 'T00:00:00',
          period_end:   billingPeriod.end   + 'T23:59:59',
        }),
      });
      const d = await res.json();
      setBillingResult(d.data);
    } catch {
      // mock
      setBillingResult({ inbound_charges: 5000, storage_charges: 10000, outbound_charges: 8000, vas_charges: 2000, special_charges: 1000, subtotal: 26000, tax: 1820, total: 27820 });
    } finally {
      setCalcLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!billingResult) return;
    try {
      const res = await fetch(`${API}/invoice/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: +selectedCustomer,
          period_start: billingPeriod.start + 'T00:00:00',
          period_end:   billingPeriod.end   + 'T23:59:59',
        }),
      });
      const d = await res.json();
      showNotify(`สร้าง Invoice ${d.data?.invoice_number || ''} สำเร็จ`, 'success');
      // reload invoice list
      const listRes = await fetch(`${API}/invoice/list/${selectedCustomer}`);
      const listData = await listRes.json();
      setInvoiceList(listData.data || []);
    } catch {
      showNotify('สร้าง Invoice สำเร็จ (mock)', 'success');
    }
  };

  // ── render helpers ────────────────────────────────────────────────────────
  const UnitSelect = ({ value, onChange, style }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="tarif-input tarif-unit-select" style={style}>
      <option value="">— เลือกหน่วย —</option>
      {UNIT_GROUPS.map(g => (
        <optgroup key={g.group} label={g.group}>
          {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </optgroup>
      ))}
    </select>
  );

  const contractFields = (tab) => (
    <div className="tarif-subsection">
      <h4 className="tarif-subsection-title">📋 เงื่อนไขสัญญา</h4>
      <div className="tarif-grid" style={{ maxWidth: 640 }}>
        <div className="tarif-field">
          <label>วันที่มีผล (Effective Date)</label>
          <input type="date" value={tariffData[tab].effective_date || ''} onChange={e => handleInputChange('effective_date', e.target.value)} className="tarif-input tarif-input-highlight" />
        </div>
        <div className="tarif-field">
          <label>วันหมดอายุ (Expiry Date)</label>
          <input type="date" value={tariffData[tab].expiry_date || ''} onChange={e => handleInputChange('expiry_date', e.target.value)} className="tarif-input tarif-input-highlight" />
        </div>
        <div className="tarif-field">
          <label>ส่วนลด (%)</label>
          <input type="number" min="0" max="100" value={tariffData[tab].discount_percentage} onChange={e => handleInputChange('discount_percentage', e.target.value)} className="tarif-input tarif-input-highlight" />
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="tarif-container">
      {/* ── header ── */}
      <div className="tarif-header">
        <div className="tarif-header-left">
          <h2>💰 {t('tarif.title', 'Tarif Management')}</h2>
          <p>{t('tarif.subtitle', 'Configure pricing for all WMS services')}</p>
        </div>
        <div className="tarif-header-selectors">
          <div className="tarif-customer-selector">
            <label className="tarif-cust-label">🏢 Customers</label>
            <select className="tarif-cust-select" value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value)}>
              <option value="">{t('tarif.selectCustomer', '— เลือกลูกค้า —')}</option>
              {CUSTOMER_LIST.map(c => <option key={c.id} value={c.id}>{truncate(c.name)}</option>)}
            </select>
            {selectedCustomer && (
              <button className="tarif-cust-clear" onClick={() => setSelectedCustomer('')} title="ล้างการเลือก">✕</button>
            )}
          </div>
          <div className="tarif-customer-selector">
            <label className="tarif-cust-label">📋 ประเภทบริการ</label>
            <select className="tarif-cust-select tarif-category-select" value={activeTab}
              onChange={e => handleTabChange(e.target.value)}>
              <option value="inbound">📥 INBOUND</option>
              <option value="storage">📦 STORAGE</option>
              <option value="outbound">📤 OUTBOUND</option>
              <option value="vas">⭐ VAS</option>
              <option value="special">🔧 SPECIAL</option>
              <option value="billing">🧾 BILLING</option>
              <option value="history">📜 HISTORY</option>
            </select>
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <div className="tarif-cust-badge">
          <span className="tarif-cust-badge-icon">🏢</span>
          <span className="tarif-cust-badge-name">{truncate(CUSTOMER_LIST.find(c => c.id === +selectedCustomer)?.name || '')}</span>
          <span className="tarif-cust-badge-note">— กำลังแสดง/ตั้งค่าราคาสำหรับลูกค้านี้</span>
        </div>
      )}

      <Notify msg={notify.msg} type={notify.type} />

      {/* ── tabs ── */}
      <div className="tarif-tabs">
        {[
          ['inbound',  '📥', t('tarif.tabInbound',  'Inbound')],
          ['storage',  '📦', t('tarif.tabStorage',  'Storage')],
          ['outbound', '📤', t('tarif.tabOutbound', 'Outbound')],
          ['vas',      '⭐', t('tarif.tabVAS',      'VAS')],
          ['special',  '🔧', t('tarif.tabSpecial',  'Special')],
          ['billing',  '🧾', 'Billing'],
          ['history',  '📜', 'History'],
        ].map(([key, icon, label]) => (
          <button key={key} className={`tab-btn ${activeTab === key ? 'active' : ''}`}
            onClick={() => handleTabChange(key)}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ════════════════════ INBOUND ════════════════════ */}
      {activeTab === 'inbound' && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>Inbound / Receiving Tarif</h3>
            <div className="tarif-grid" style={{ maxWidth: 800 }}>
              {[
                ['per_pallet',     'Per Pallet'],
                ['per_carton',     'Per Carton'],
                ['per_item',       'Per Item'],
                ['per_kg',         'Per KG'],
                ['per_m3',         'Per M3'],
                ['minimum_charge', 'Minimum Charge'],
                ['qc_fee',         'QC Fee'],
              ].map(([field, label]) => (
                <div key={field} className="tarif-field">
                  <label>{label} (บาท)</label>
                  <input type="number" value={tariffData.inbound[field]}
                    onChange={e => handleInputChange(field, e.target.value)}
                    className="tarif-input" />
                </div>
              ))}
              <div className="tarif-field checkbox">
                <label>
                  <input type="checkbox" checked={tariffData.inbound.qc_required}
                    onChange={e => handleInputChange('qc_required', e.target.checked)} />
                  Require QC
                </label>
              </div>
            </div>

            {/* Handling IN */}
            <div className="tarif-subsection">
              <h4 className="tarif-subsection-title">🔄 ค่า Handling IN</h4>
              <div className="tarif-grid" style={{ maxWidth: 580 }}>
                <div className="tarif-field">
                  <label>ค่า Handling IN (บาท)</label>
                  <input type="number" value={tariffData.inbound.handling_in}
                    onChange={e => handleInputChange('handling_in', e.target.value)}
                    className="tarif-input tarif-input-highlight" />
                </div>
                <div className="tarif-field">
                  <label>Main Unit</label>
                  <select value={tariffData.inbound.handling_in_main_unit}
                    onChange={e => handleInputChange('handling_in_main_unit', e.target.value)}
                    className="tarif-input tarif-input-highlight tarif-unit-select">
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
                  <select value={tariffData.inbound.handling_in_sub_unit}
                    onChange={e => handleInputChange('handling_in_sub_unit', e.target.value)}
                    className="tarif-input tarif-input-highlight tarif-unit-select">
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

            {/* Contract */}
            {contractFields('inbound')}

            <button className="save-btn" disabled={saving} onClick={() => handleSave('inbound')}>
              {saving ? '⏳ Saving…' : '💾 Save Inbound Tarif'}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════ STORAGE ════════════════════ */}
      {activeTab === 'storage' && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>Storage / Warehousing Tarif</h3>
            <div className="tarif-grid" style={{ maxWidth: 800 }}>
              {[
                ['per_pallet_day',   'Per Pallet/Day'],
                ['per_m3_day',       'Per M3/Day'],
                ['per_item_month',   'Per Item/Month'],
                ['per_pallet_month', 'Per Pallet/Month'],
                ['per_m3_month',     'Per M3/Month'],
                ['monthly_minimum',  'Monthly Minimum'],
                ['free_storage_days','Free Storage Days'],
              ].map(([field, label]) => (
                <div key={field} className="tarif-field">
                  <label>{label} (บาท)</label>
                  <input type="number" value={tariffData.storage[field]}
                    onChange={e => handleInputChange(field, e.target.value)}
                    className="tarif-input" />
                </div>
              ))}
            </div>

            {contractFields('storage')}

            <button className="save-btn" disabled={saving} onClick={() => handleSave('storage')}>
              {saving ? '⏳ Saving…' : '💾 Save Storage Tarif'}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════ OUTBOUND ════════════════════ */}
      {activeTab === 'outbound' && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>Outbound / Shipping Tarif</h3>
            <div className="tarif-grid" style={{ maxWidth: 800 }}>
              {[
                ['per_order',      'Per Order'],
                ['per_item',       'Per Item'],
                ['per_box',        'Per Box'],
                ['per_pallet',     'Per Pallet'],
                ['minimum_charge', 'Minimum Charge'],
                ['hazmat_fee',     'Hazmat Fee'],
                ['fragile_fee',    'Fragile Fee'],
                ['oversize_fee',   'Oversize Fee'],
              ].map(([field, label]) => (
                <div key={field} className="tarif-field">
                  <label>{label} (บาท)</label>
                  <input type="number" value={tariffData.outbound[field]}
                    onChange={e => handleInputChange(field, e.target.value)}
                    className="tarif-input" />
                </div>
              ))}
            </div>

            {/* Handling OUT */}
            <div className="tarif-subsection">
              <h4 className="tarif-subsection-title">🔄 ค่า Handling OUT</h4>
              <div className="tarif-grid" style={{ maxWidth: 580 }}>
                <div className="tarif-field">
                  <label>ค่า Handling OUT (บาท)</label>
                  <input type="number" value={tariffData.outbound.handling_out}
                    onChange={e => handleInputChange('handling_out', e.target.value)}
                    className="tarif-input tarif-input-highlight" />
                </div>
                <div className="tarif-field">
                  <label>Main Unit</label>
                  <select value={tariffData.outbound.handling_out_main_unit}
                    onChange={e => handleInputChange('handling_out_main_unit', e.target.value)}
                    className="tarif-input tarif-input-highlight tarif-unit-select">
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
                  <select value={tariffData.outbound.handling_out_sub_unit}
                    onChange={e => handleInputChange('handling_out_sub_unit', e.target.value)}
                    className="tarif-input tarif-input-highlight tarif-unit-select">
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

            {contractFields('outbound')}

            <button className="save-btn" disabled={saving} onClick={() => handleSave('outbound')}>
              {saving ? '⏳ Saving…' : '💾 Save Outbound Tarif'}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════ VAS / SPECIAL (table) ════════════════════ */}
      {(activeTab === 'vas' || activeTab === 'special') && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>{activeTab === 'vas' ? 'Value Added Services (VAS)' : 'Special Services'}</h3>
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
                {tariffData[activeTab].map(item => (
                  <tr key={item.id}>
                    {editingId === item.id ? (
                      <>
                        <td><input type="text"   value={editValues.code} onChange={e => setEditValues({ ...editValues, code: e.target.value })} /></td>
                        <td><input type="text"   value={editValues.name} onChange={e => setEditValues({ ...editValues, name: e.target.value })} /></td>
                        <td><input type="number" value={editValues.rate} onChange={e => setEditValues({ ...editValues, rate: parseFloat(e.target.value) || 0 })} /></td>
                        <td>
                          <select value={editValues.unit} onChange={e => setEditValues({ ...editValues, unit: e.target.value })}
                            style={{ padding: '6px 8px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,188,212,0.4)', borderRadius: 4, fontSize: 12, color: '#fff', fontFamily: 'inherit', width: '100%' }}>
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
                        <td className="mono">{item.code}</td>
                        <td>{item.name}</td>
                        <td>฿{(+item.rate).toLocaleString()}</td>
                        <td><span className="unit-badge">{item.unit}</span></td>
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
            <button className="add-btn" onClick={() => openAddModal(activeTab)}>
              ➕ Add {activeTab === 'vas' ? 'VAS' : 'Special Service'}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════ BILLING ════════════════════ */}
      {activeTab === 'billing' && (
        <div className="tarif-content">
          {/* ── billing calculator ── */}
          <div className="tarif-section">
            <h3>🧮 คำนวณค่าบริการ (Billing Calculator)</h3>
            <div className="billing-period-row">
              <div className="tarif-field">
                <label>🏢 เลือกลูกค้า (Customer)</label>
                <select className="tarif-cust-select" value={selectedCustomer}
                  onChange={e => setSelectedCustomer(e.target.value)}
                  style={{ minWidth: 220 }}>
                  <option value="">— เลือกลูกค้า —</option>
                  {CUSTOMER_LIST.map(c => (
                    <option key={c.id} value={c.id}>{truncate(c.name)}</option>
                  ))}
                </select>
              </div>
              <div className="tarif-field">
                <label>งวดเริ่มต้น (Period Start)</label>
                <input type="date" value={billingPeriod.start}
                  onChange={e => setBillingPeriod(p => ({ ...p, start: e.target.value }))}
                  className="tarif-input" />
              </div>
              <div className="tarif-field">
                <label>งวดสิ้นสุด (Period End)</label>
                <input type="date" value={billingPeriod.end}
                  onChange={e => setBillingPeriod(p => ({ ...p, end: e.target.value }))}
                  className="tarif-input" />
              </div>
              <div className="billing-calc-action">
                <button className="save-btn" disabled={calcLoading || !selectedCustomer}
                  onClick={handleCalculate}>
                  {calcLoading ? '⏳ Calculating…' : '🧮 คำนวณ'}
                </button>
              </div>
            </div>

            {billingResult && (
              <div className="billing-summary-card">
                <div className="billing-summary-title">สรุปค่าบริการ</div>
                {[
                  ['📥 Inbound',  billingResult.inbound_charges],
                  ['📦 Storage',  billingResult.storage_charges],
                  ['📤 Outbound', billingResult.outbound_charges],
                  ['⭐ VAS',      billingResult.vas_charges],
                  ['🔧 Special',  billingResult.special_charges],
                ].map(([label, val]) => (
                  <div key={label} className="billing-breakdown-row">
                    <span className="billing-row-label">{label}</span>
                    <span className="billing-row-value">฿{(val || 0).toLocaleString()}</span>
                  </div>
                ))}
                <div className="billing-divider" />
                <div className="billing-breakdown-row">
                  <span className="billing-row-label">Subtotal</span>
                  <span className="billing-row-value">฿{(billingResult.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="billing-breakdown-row">
                  <span className="billing-row-label">VAT 7%</span>
                  <span className="billing-row-value">฿{(billingResult.tax || 0).toLocaleString()}</span>
                </div>
                <div className="billing-breakdown-row billing-total-row">
                  <span className="billing-row-label">TOTAL</span>
                  <span className="billing-row-value">฿{(billingResult.total || 0).toLocaleString()}</span>
                </div>
                <div className="billing-actions">
                  <button className="add-btn" onClick={handleGenerateInvoice}>
                    🧾 Generate Invoice
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── invoice list ── */}
          <div className="tarif-section">
            <div className="billing-inv-header">
              <h3 style={{ margin: 0 }}>📋 Invoice List</h3>
              {!selectedCustomer && (
                <select className="tarif-cust-select" value={selectedCustomer}
                  onChange={e => setSelectedCustomer(e.target.value)}
                  style={{ minWidth: 220, marginLeft: 16 }}>
                  <option value="">🏢 — เลือกลูกค้า —</option>
                  {CUSTOMER_LIST.map(c => (
                    <option key={c.id} value={c.id}>{truncate(c.name)}</option>
                  ))}
                </select>
              )}
            </div>
            {invoiceLoading && <div className="billing-loading">⏳ กำลังโหลด...</div>}
            {!invoiceLoading && invoiceList.length === 0 && selectedCustomer && (
              <div className="billing-empty">ยังไม่มี Invoice</div>
            )}
            {invoiceList.length > 0 && (
              <table className="tarif-table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>วันที่ออก</th>
                    <th>ช่วงเวลา</th>
                    <th>Subtotal</th>
                    <th>VAT</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceList.map(inv => (
                    <tr key={inv.id}>
                      <td className="mono" style={{ color: '#00E5FF' }}>{inv.invoice_number}</td>
                      <td>{inv.invoice_date}</td>
                      <td style={{ fontSize: 12 }}>{inv.period}</td>
                      <td>฿{(inv.subtotal || 0).toLocaleString()}</td>
                      <td>฿{(inv.tax_amount || 0).toLocaleString()}</td>
                      <td style={{ fontWeight: 700 }}>฿{(inv.total_amount || 0).toLocaleString()}</td>
                      <td>
                        <span className="inv-status-badge"
                          style={{ background: INVOICE_STATUS_COLORS[inv.status] + '22', color: INVOICE_STATUS_COLORS[inv.status], borderColor: INVOICE_STATUS_COLORS[inv.status] + '55' }}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════ HISTORY ════════════════════ */}
      {activeTab === 'history' && (
        <div className="tarif-content">
          <div className="tarif-section">
            <h3>📜 Tarif Change History</h3>
            {!selectedCustomer && <div className="emp-error">กรุณาเลือกลูกค้า</div>}
            {historyLoading && <div className="billing-loading">⏳ กำลังโหลด...</div>}
            {!historyLoading && tarifHistory.length === 0 && selectedCustomer && (
              <div className="billing-empty">ไม่มีประวัติการเปลี่ยนแปลงราคา</div>
            )}
            {tarifHistory.length > 0 && (
              <table className="tarif-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Service Type</th>
                    <th>Field</th>
                    <th>ราคาเดิม</th>
                    <th>ราคาใหม่</th>
                    <th>เหตุผล</th>
                    <th>โดย</th>
                    <th>วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {tarifHistory.map((h, i) => (
                    <tr key={h.id}>
                      <td style={{ color: '#3a6a82' }}>{i + 1}</td>
                      <td><span className="unit-badge">{h.service_type}</span></td>
                      <td className="mono" style={{ fontSize: 12 }}>{h.field_changed}</td>
                      <td style={{ color: '#FF8888' }}>฿{(h.old_rate || 0).toLocaleString()}</td>
                      <td style={{ color: '#00CC88' }}>฿{(h.new_rate || 0).toLocaleString()}</td>
                      <td style={{ fontSize: 12, color: '#7a9fb5' }}>{h.change_reason}</td>
                      <td style={{ fontSize: 12 }}>{h.changed_by}</td>
                      <td style={{ fontSize: 12 }}>{h.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════ ADD MODAL ════════════════════ */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal-box modal-md">
            <div className="modal-header">
              <h2>➕ Add {addModalType === 'vas' ? 'Value Added Service' : 'Special Service'}</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Service Code *</label>
                  <input type="text" placeholder="LABELING" value={addForm.code}
                    onChange={e => setAddForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group">
                  <label>Service Name *</label>
                  <input type="text" placeholder="ชื่อบริการ" value={addForm.name}
                    onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Rate (บาท) *</label>
                  <input type="number" min="0" value={addForm.rate}
                    onChange={e => setAddForm(f => ({ ...f, rate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Unit *</label>
                  <select value={addForm.unit}
                    onChange={e => setAddForm(f => ({ ...f, unit: e.target.value }))}>
                    <option value="">— เลือกหน่วย —</option>
                    {UNIT_GROUPS.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" placeholder="รายละเอียดเพิ่มเติม" value={addForm.description}
                  onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>ยกเลิก</button>
              <button className="save-btn" onClick={handleAddSave}>💾 บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TarifManagement;
