import apiClient from './apiClient';

export const pickingService = {
  async getAll()            { return (await apiClient.get('/api/picking')).data; },
  async create(data)        { return (await apiClient.post('/api/picking', data)).data; },
  async confirm(id, items)  { return (await apiClient.put(`/api/picking/${id}/confirm`, { items })).data; },
};
