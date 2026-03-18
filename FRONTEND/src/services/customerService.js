import apiClient from './apiClient';

export const customerService = {
  async getAll(search = '') { return (await apiClient.get(`/api/customers${search ? '?search=' + encodeURIComponent(search) : ''}`)).data; },
  async getById(id)         { return (await apiClient.get(`/api/customers/${id}`)).data; },
  async create(data)        { return (await apiClient.post('/api/customers', data)).data; },
  async update(id, data)    { return (await apiClient.put(`/api/customers/${id}`, data)).data; },
  async delete(id)          { return (await apiClient.delete(`/api/customers/${id}`)).data; },
};
