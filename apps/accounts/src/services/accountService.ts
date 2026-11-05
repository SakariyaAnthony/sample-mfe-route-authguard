import { queryOptions } from '@tanstack/react-query';
import { httpClient, queryKeys, type Transaction } from '@bank/shared';

export const transactionsQuery = (accountId: string) =>
  queryOptions({
    queryKey: queryKeys.transactions.byAccount(accountId),
    queryFn: async ({ signal }) =>
      (
        await httpClient.get<Transaction[]>('/transactions', {
          params: { accountId, _sort: 'date', _order: 'desc' },
          signal,
        })
      ).data,
  });
