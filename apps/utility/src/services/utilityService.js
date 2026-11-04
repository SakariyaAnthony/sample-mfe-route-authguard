import { httpClient } from '@bank/shared';

export const utilityService = {
  async getBillers({ signal } = {}) {
    const { data } = await httpClient.get('/billers', { signal });
    return data;
  },

  async getBiller(id, { signal } = {}) {
    const { data } = await httpClient.get(`/billers/${id}`, { signal });
    return data;
  },

  async getAccounts({ signal } = {}) {
    const { data } = await httpClient.get('/accounts', { signal });
    return data;
  },

  async payBill(payload) {
    const { data } = await httpClient.post('/payments', payload);
    return data;
  },
};
