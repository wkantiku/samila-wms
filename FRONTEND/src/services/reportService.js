import apiClient from './apiClient';

export const reportService = {
  async getSummary()          { return (await apiClient.get('/api/reports/summary')).data; },
  async getByCustomer()       { return (await apiClient.get('/api/reports/inventory-by-customer')).data; },
  async getMovements(days=30) { return (await apiClient.get(`/api/reports/movements?days=${days}`)).data; },
  async getKPI()              { return (await apiClient.get('/api/reports/kpi')).data; },
};
