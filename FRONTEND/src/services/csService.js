import apiClient from './apiClient';

export const csService = {
  async getAll(status = '') { return (await apiClient.get(`/api/cs${status ? '?status=' + status : ''}`)).data; },
  async getById(id)         { return (await apiClient.get(`/api/cs/${id}`)).data; },
  async create(data)        { return (await apiClient.post('/api/cs', data)).data; },
  async update(id, data)    { return (await apiClient.put(`/api/cs/${id}`, data)).data; },
  async delete(id)          { return (await apiClient.delete(`/api/cs/${id}`)).data; },
  async addNote(id, text, type = 'update') {
    return (await apiClient.post(`/api/cs/${id}/note`, { text, type })).data;
  },
};
