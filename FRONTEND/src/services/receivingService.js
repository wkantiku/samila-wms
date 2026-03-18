import apiClient from './apiClient';

export const receivingService = {
  async getAll()              { return (await apiClient.get('/api/receiving')).data; },
  async getById(id)           { return (await apiClient.get(`/api/receiving/${id}`)).data; },
  async create(data)          { return (await apiClient.post('/api/receiving', data)).data; },
  async updateStatus(id, status) { return (await apiClient.put(`/api/receiving/${id}/status`, { status })).data; },
};
