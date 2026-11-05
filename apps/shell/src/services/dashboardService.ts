import { queryOptions } from '@tanstack/react-query';
import { httpClient, queryKeys, type Transaction } from '@bank/shared';

export const recentTransactionsQuery = () =>
  queryOptions({
    queryKey: queryKeys.transactions.recent,
    queryFn: async ({ signal }) =>
      (
        await httpClient.get<Transaction[]>('/transactions', {
          params: { _sort: 'date', _order: 'desc', _limit: 5 },
          signal,
        })
      ).data,
  });
