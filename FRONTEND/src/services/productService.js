import apiClient from './apiClient';

export const productService = {
  async getAll(params = {}) {
    const q = new URLSearchParams(params).toString();
    return (await apiClient.get(`/api/products${q ? '?' + q : ''}`)).data;
  },
  async getBySku(sku)      { return (await apiClient.get(`/api/products/sku/${sku}`)).data; },
  async getById(id)        { return (await apiClient.get(`/api/products/${id}`)).data; },
  async create(data)       { return (await apiClient.post('/api/products', data)).data; },
  async update(id, data)   { return (await apiClient.put(`/api/products/${id}`, data)).data; },
  async delete(id)         { return (await apiClient.delete(`/api/products/${id}`)).data; },
};
