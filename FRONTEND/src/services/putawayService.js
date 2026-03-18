import apiClient from './apiClient';

export const putawayService = {
  async getAll()      { return (await apiClient.get('/api/putaway')).data; },
  async create(data)  { return (await apiClient.post('/api/putaway', data)).data; },
  async confirm(id)   { return (await apiClient.put(`/api/putaway/${id}/confirm`)).data; },
};
