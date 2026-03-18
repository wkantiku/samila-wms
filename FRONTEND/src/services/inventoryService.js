import apiClient from './apiClient';

export const inventoryService = {
  async getAll(params = {}) {
    const q = new URLSearchParams(params).toString();
    return (await apiClient.get(`/api/inventory${q ? '?' + q : ''}`)).data;
  },
  async receive(data)      { return (await apiClient.post('/api/inventory/receive', data)).data; },
  async adjust(data)       { return (await apiClient.put('/api/inventory/adjust', data)).data; },
  async getMovements(sku)  { return (await apiClient.get(`/api/inventory/movements${sku ? '?sku=' + sku : ''}`)).data; },
};
