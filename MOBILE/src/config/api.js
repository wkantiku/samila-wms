// API Configuration
// Change BASE_URL to your server IP/domain when deploying
export const BASE_URL = 'http://192.168.1.100:8000';

export const API = {
  // Receiving
  productBarcode:  (bc)  => `${BASE_URL}/api/v1/wms/product/barcode/${bc}`,
  receivingComplete:     `${BASE_URL}/api/v1/wms/receiving/order/complete`,

  // Putaway
  putawayList:           `${BASE_URL}/api/v1/wms/putaway/list`,
  putawayComplete: (id)  => `${BASE_URL}/api/v1/wms/putaway/${id}/complete`,

  // Picking
  pickingList:           `${BASE_URL}/api/v1/wms/picking/list`,
  pickingItemScan:       `${BASE_URL}/api/v1/wms/picking/item/scan`,
  pickingComplete: (id)  => `${BASE_URL}/api/v1/wms/picking/list/${id}/complete`,

  // Shipping
  shippingCreate:        `${BASE_URL}/api/v1/wms/shipping/order/create`,
  shippingPack:          `${BASE_URL}/api/v1/wms/shipping/item/pack`,

  // Stock Count
  stockCountCreate:      `${BASE_URL}/api/v1/wms/inventory/stock-count/create`,
  stockCountItem: (id)   => `${BASE_URL}/api/v1/wms/inventory/stock-count/${id}/item`,
};
