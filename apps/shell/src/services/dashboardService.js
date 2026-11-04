import { httpClient } from '@bank/shared';

export const dashboardService = {
  // Two independent calls fired in parallel instead of one after the other.
  async getSummary({ signal } = {}) {
    const [accounts, transactions] = await Promise.all([
      httpClient.get('/accounts', { signal }),
      httpClient.get('/transactions', { params: { _sort: 'date', _order: 'desc', _limit: 5 }, signal }),
    ]);
    return { accounts: accounts.data, recentTransactions: transactions.data };
  },
};
