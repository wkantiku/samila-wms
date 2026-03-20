// ══════════════════════════════════════════════════════
//  Samila WMS 3PL — Mobile API Configuration
//  Backend: Render.com  (change to your actual URL)
// ══════════════════════════════════════════════════════
export const BASE_URL = 'https://samila-wms-backend.onrender.com';

export const API = {
  // ── Auth ──────────────────────────────────────────
  login:               `${BASE_URL}/api/auth/login`,

  // ── Receiving ─────────────────────────────────────
  receivingList:       `${BASE_URL}/api/receiving`,
  receivingCreate:     `${BASE_URL}/api/receiving`,
  receivingStatus: (id) => `${BASE_URL}/api/receiving/${id}/status`,

  // ── Putaway ───────────────────────────────────────
  putawayList:         `${BASE_URL}/api/putaway`,
  putawayCreate:       `${BASE_URL}/api/putaway`,
  putawayConfirm: (id) => `${BASE_URL}/api/putaway/${id}/confirm`,

  // ── Picking ───────────────────────────────────────
  pickingList:         `${BASE_URL}/api/picking`,
  pickingCreate:       `${BASE_URL}/api/picking`,
  pickingConfirm: (id) => `${BASE_URL}/api/picking/${id}/confirm`,

  // ── Shipping ──────────────────────────────────────
  shippingList:        `${BASE_URL}/api/shipping`,
  shippingCreate:      `${BASE_URL}/api/shipping`,
  shippingStatus: (id) => `${BASE_URL}/api/shipping/${id}/status`,

  // ── Inventory / Stock Count ───────────────────────
  inventoryList:       `${BASE_URL}/api/inventory`,
  productBarcode: (bc) => `${BASE_URL}/api/products/barcode/${bc}`,
};
