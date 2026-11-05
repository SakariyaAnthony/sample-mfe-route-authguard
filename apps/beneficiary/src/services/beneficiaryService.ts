import { httpClient, type Beneficiary, type NewBeneficiary } from '@bank/shared';

export const beneficiaryService = {
  async addBeneficiary(payload: NewBeneficiary): Promise<Beneficiary> {
    const { data } = await httpClient.post<Beneficiary>('/beneficiaries', payload);
    return data;
  },

  async deleteBeneficiary(id: number): Promise<number> {
    await httpClient.delete(`/beneficiaries/${id}`);
    return id;
  },
};
