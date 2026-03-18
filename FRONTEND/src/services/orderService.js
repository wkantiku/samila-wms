import apiClient from './apiClient';

export const orderService = {
  async getAll()              { return (await apiClient.get('/api/orders')).data; },
  async getById(id)           { return (await apiClient.get(`/api/orders/${id}`)).data; },
  async create(data)          { return (await apiClient.post('/api/orders', data)).data; },
  async updateStatus(id, status) { return (await apiClient.put(`/api/orders/${id}/status`, { status })).data; },
  async delete(id)            { return (await apiClient.delete(`/api/orders/${id}`)).data; },
};
