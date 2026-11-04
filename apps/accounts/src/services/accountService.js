import { httpClient } from '@bank/shared';

export const accountService = {
  async getAccounts({ signal } = {}) {
    const { data } = await httpClient.get('/accounts', { signal });
    return data;
  },

  async getAccount(id, { signal } = {}) {
    const { data } = await httpClient.get(`/accounts/${id}`, { signal });
    return data;
  },

  async getTransactions(accountId, { signal } = {}) {
    const { data } = await httpClient.get('/transactions', {
      params: { accountId, _sort: 'date', _order: 'desc' },
      signal,
    });
    return data;
  },
};
