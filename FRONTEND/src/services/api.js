/**
 * Centralized API service — Samila WMS 3PL
 * Single source of truth for all backend calls.
 * Uses native fetch with timeout + retry.
 * Fallback chain: FastAPI → Supabase → []
 */
import { supabase } from '../config/supabase';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;

// ── Token management ─────────────────────────────────────────────────────────
let _accessToken = null;

export const auth = {
  setToken: (token) => { _accessToken = token; },
  clearToken: () => { _accessToken = null; },
  getToken: () => _accessToken,
};

// ── Core fetch with timeout ───────────────────────────────────────────────────
async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(tid);
  }
}

// ── Retry wrapper ─────────────────────────────────────────────────────────────
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetchWithTimeout(url, options);
      return res;
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError') throw err; // timeout → don't retry
      if (i < retries) await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastError;
}

// ── Build default headers ─────────────────────────────────────────────────────
function getToken() {
  if (_accessToken) return _accessToken;
  // Fall back to token stored by authService in localStorage
  try {
    const s = localStorage.getItem('wms_session');
    if (s) return JSON.parse(s)?.token || null;
  } catch {}
  return null;
}

function buildHeaders(extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ── Generic request ───────────────────────────────────────────────────────────
async function request(method, path, body, options = {}) {
  const url = `${BASE_URL}${path}`;
  const fetchOptions = {
    method,
    headers: buildHeaders(options.headers),
  };
  if (body !== undefined) fetchOptions.body = JSON.stringify(body);

  const res = await fetchWithRetry(url, fetchOptions);

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { const d = await res.json(); detail = d.detail || d.message || detail; } catch { /* noop */ }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }

  // Handle 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ── Public API methods ────────────────────────────────────────────────────────
const api = {
  get:    (path, opts)       => request('GET',    path, undefined, opts),
  post:   (path, body, opts) => request('POST',   path, body,      opts),
  put:    (path, body, opts) => request('PUT',    path, body,      opts),
  patch:  (path, body, opts) => request('PATCH',  path, body,      opts),
  delete: (path, opts)       => request('DELETE', path, undefined, opts),
};

// ── Domain endpoints ──────────────────────────────────────────────────────────

export const healthApi = {
  check: ()  => api.get('/health'),
  info:  ()  => api.get('/api/info'),
};

export const tarifApi = {
  getInbound:  (cid) => api.get(`/api/v1/tarif/inbound-tarif/${cid}`),
  saveInbound: (id, body) => api.put(`/api/v1/tarif/inbound-tarif/${id}`, body),

  getStorage:  (cid) => api.get(`/api/v1/tarif/storage-tarif/${cid}`),
  saveStorage: (id, body) => api.put(`/api/v1/tarif/storage-tarif/${id}`, body),

  getOutbound:  (cid) => api.get(`/api/v1/tarif/outbound-tarif/${cid}`),
  saveOutbound: (id, body) => api.put(`/api/v1/tarif/outbound-tarif/${id}`, body),

  listVAS:    (cid) => api.get(`/api/v1/tarif/vas/list/${cid}`),
  createVAS:  (body) => api.post('/api/v1/tarif/vas/create', body),
  updateVAS:  (id, body) => api.put(`/api/v1/tarif/vas/${id}`, body),
  deleteVAS:  (id) => api.delete(`/api/v1/tarif/vas/${id}`),

  listSpecial:   (cid) => api.get(`/api/v1/tarif/special/list/${cid}`),
  createSpecial: (body) => api.post('/api/v1/tarif/special/create', body),
  updateSpecial: (id, body) => api.put(`/api/v1/tarif/special/${id}`, body),
  deleteSpecial: (id) => api.delete(`/api/v1/tarif/special/${id}`),

  calculateBilling: (body) => api.post('/api/v1/tarif/billing/calculate', body),
  createInvoice:    (body) => api.post('/api/v1/tarif/invoice/create', body),
  listInvoices:     (cid) => api.get(`/api/v1/tarif/invoice/list/${cid}`),
  getHistory:       (cid) => api.get(`/api/v1/tarif/history/${cid}`),
};

export const receivingApi = {
  list:   ()     => api.get('/api/v1/wms/receiving'),
  create: (body) => api.post('/api/v1/wms/receiving', body),
  update: (id, body) => api.put(`/api/v1/wms/receiving/${id}`, body),
  remove: (id)   => api.delete(`/api/v1/wms/receiving/${id}`),
  importXlsx: (formData) => {
    // multipart/form-data — no Content-Type header (browser sets boundary)
    return fetchWithRetry(`${BASE_URL}/api/v1/wms/import/receiving`, {
      method: 'POST',
      headers: _accessToken ? { Authorization: `Bearer ${_accessToken}` } : {},
      body: formData,
    }).then(r => r.json());
  },
  exportXlsx: () => api.get('/api/v1/wms/export/receiving'),
};

export const inventoryApi = {
  list:   ()     => api.get('/api/v1/wms/inventory'),
  adjust: (body) => api.post('/api/v1/wms/inventory/adjust', body),
  move:   (body) => api.post('/api/v1/wms/inventory/move', body),
};

export const orderApi = {
  list:         ()     => api.get('/api/v1/wms/orders'),
  create:       (body) => api.post('/api/v1/wms/orders', body),
  updateStatus: (id, status) => api.patch(`/api/v1/wms/orders/${id}/status`, { status }),
  remove:       (id)   => api.delete(`/api/v1/wms/orders/${id}`),
};

export const packingApi = {
  list:    ()              => api.get('/api/packing'),
  create:  (body)          => api.post('/api/packing', body),
  confirm: (id, body)      => api.put(`/api/packing/${id}/confirm`, body),
  remove:  (id)            => api.delete(`/api/packing/${id}`),
};

export const shippingApi = {
  ship:  (body) => api.post('/api/v1/wms/shipments', body),
  track: (so)   => api.get(`/api/v1/wms/shipments/track/${so}`),
};

// Map Supabase snake_case → frontend camelCase (same shape as _wh_out in backend)
const _mapSupabaseWh = (w) => ({
  id: w.id, code: w.code,
  name: w.name_en, name_th: w.name_th || w.name_en,
  location: w.city || '', province: w.city || '',
  active: w.is_active !== false, icon: w.icon || '🏭',
  companyNo: w.company_no || 'COMP-001',
  type: w.wh_type || 'General',
  zones: w.zones || 0, staff: w.staff || 0,
  capacity: w.total_capacity || 0, used: w.used_sqm || 0,
});

export const warehouseApi = {
  list: async () => {
    try {
      return await api.get('/api/warehouses');
    } catch {
      // FastAPI offline → fallback to Supabase
      const { data } = await supabase.from('warehouses').select('*').order('id');
      return (data || []).map(_mapSupabaseWh);
    }
  },
  create: (body)      => api.post('/api/warehouses', body),
  update: (id, body)  => api.put(`/api/warehouses/${id}`, body),
  toggle: (id)        => api.patch(`/api/warehouses/${id}/toggle`),
  remove: (id)        => api.delete(`/api/warehouses/${id}`),
};

export const customerApi = {
  list:         (companyNo) => api.get(companyNo ? `/api/customers?company_no=${encodeURIComponent(companyNo)}` : '/api/customers'),
  create:       (body)      => api.post('/api/customers', body),
  update:       (id, body)  => api.put(`/api/customers/${id}`, body),
  remove:       (id)        => api.delete(`/api/customers/${id}`),
};

export default api;
