import apiClient from './apiClient';

export const warehouseService = {
  async getAll()           { return (await apiClient.get('/api/warehouses')).data; },
  async create(data)       { return (await apiClient.post('/api/warehouses', data)).data; },
  async update(id, data)   { return (await apiClient.put(`/api/warehouses/${id}`, data)).data; },
  async delete(id)         { return (await apiClient.delete(`/api/warehouses/${id}`)).data; },
};
