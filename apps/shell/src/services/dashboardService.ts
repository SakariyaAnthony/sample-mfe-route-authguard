import { httpClient, type Account, type RequestOptions, type Transaction } from '@bank/shared';

export interface DashboardSummary {
  accounts: Account[];
  recentTransactions: Transaction[];
}

export const dashboardService = {
  // Two independent calls fired in parallel instead of one after the other.
  async getSummary({ signal }: RequestOptions = {}): Promise<DashboardSummary> {
    const [accounts, transactions] = await Promise.all([
      httpClient.get<Account[]>('/accounts', { signal }),
      httpClient.get<Transaction[]>('/transactions', { params: { _sort: 'date', _order: 'desc', _limit: 5 }, signal }),
    ]);
    return { accounts: accounts.data, recentTransactions: transactions.data };
  },
};
