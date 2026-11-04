import { httpClient } from '@bank/shared';

export const transferService = {
  // The form needs both lists before it can render, so fetch them together.
  async getFormData({ signal } = {}) {
    const [accounts, beneficiaries] = await Promise.all([
      httpClient.get('/accounts', { signal }),
      httpClient.get('/beneficiaries', { signal }),
    ]);
    return { accounts: accounts.data, beneficiaries: beneficiaries.data };
  },

  async createTransfer(payload) {
    const { data } = await httpClient.post('/transfers', payload);
    return data;
  },
};
