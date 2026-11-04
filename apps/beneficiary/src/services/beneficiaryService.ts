import { httpClient, type Beneficiary, type NewBeneficiary, type RequestOptions } from '@bank/shared';

export const beneficiaryService = {
  async getBeneficiaries({ signal }: RequestOptions = {}): Promise<Beneficiary[]> {
    const { data } = await httpClient.get<Beneficiary[]>('/beneficiaries', { signal });
    return data;
  },

  async addBeneficiary(payload: NewBeneficiary): Promise<Beneficiary> {
    const { data } = await httpClient.post<Beneficiary>('/beneficiaries', payload);
    return data;
  },

  async deleteBeneficiary(id: number): Promise<number> {
    await httpClient.delete(`/beneficiaries/${id}`);
    return id;
  },
};
