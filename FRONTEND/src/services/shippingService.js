import apiClient from './apiClient';

export const shippingService = {
  async getAll()              { return (await apiClient.get('/api/shipping')).data; },
  async create(data)          { return (await apiClient.post('/api/shipping', data)).data; },
  async updateStatus(id, status) { return (await apiClient.put(`/api/shipping/${id}/status`, { status })).data; },
  async track(soNumber)       { return (await apiClient.get(`/api/shipping/track/${soNumber}`)).data; },
};
