import apiClient from './apiClient';

export const userService = {
  async getAll()        { return (await apiClient.get('/api/users')).data; },
  async getById(id)     { return (await apiClient.get(`/api/users/${id}`)).data; },
  async create(data)    { return (await apiClient.post('/api/users', data)).data; },
  async update(id, data){ return (await apiClient.put(`/api/users/${id}`, data)).data; },
  async delete(id)      { return (await apiClient.delete(`/api/users/${id}`)).data; },
  async changePassword(id, oldPassword, newPassword) {
    return (await apiClient.post(`/api/users/${id}/change-password`, {
      old_password: oldPassword,
      new_password: newPassword,
    })).data;
  },
};
