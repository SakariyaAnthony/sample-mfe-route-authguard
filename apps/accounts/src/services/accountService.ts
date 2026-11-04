import { httpClient, type Account, type RequestOptions, type Transaction } from '@bank/shared';

export const accountService = {
  async getAccounts({ signal }: RequestOptions = {}): Promise<Account[]> {
    const { data } = await httpClient.get<Account[]>('/accounts', { signal });
    return data;
  },

  async getAccount(id: string, { signal }: RequestOptions = {}): Promise<Account> {
    const { data } = await httpClient.get<Account>(`/accounts/${id}`, { signal });
    return data;
  },

  async getTransactions(accountId: string, { signal }: RequestOptions = {}): Promise<Transaction[]> {
    const { data } = await httpClient.get<Transaction[]>('/transactions', {
      params: { accountId, _sort: 'date', _order: 'desc' },
      signal,
    });
    return data;
  },
};
