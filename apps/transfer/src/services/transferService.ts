import {
  httpClient,
  type Account,
  type Beneficiary,
  type RequestOptions,
  type Transfer,
  type TransferRequest,
} from '@bank/shared';

export interface TransferFormData {
  accounts: Account[];
  beneficiaries: Beneficiary[];
}

export const transferService = {
  // The form needs both lists before it can render, so fetch them together.
  async getFormData({ signal }: RequestOptions = {}): Promise<TransferFormData> {
    const [accounts, beneficiaries] = await Promise.all([
      httpClient.get<Account[]>('/accounts', { signal }),
      httpClient.get<Beneficiary[]>('/beneficiaries', { signal }),
    ]);
    return { accounts: accounts.data, beneficiaries: beneficiaries.data };
  },

  async createTransfer(payload: TransferRequest): Promise<Transfer> {
    const { data } = await httpClient.post<Transfer>('/transfers', payload);
    return data;
  },
};
