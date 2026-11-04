import { httpClient } from '@bank/shared';

export const beneficiaryService = {
  async getBeneficiaries({ signal } = {}) {
    const { data } = await httpClient.get('/beneficiaries', { signal });
    return data;
  },

  async addBeneficiary(payload) {
    const { data } = await httpClient.post('/beneficiaries', payload);
    return data;
  },

  async deleteBeneficiary(id) {
    await httpClient.delete(`/beneficiaries/${id}`);
    return id;
  },
};
