import { queryOptions } from '@tanstack/react-query';
import { httpClient } from '../api/httpClient';
import type { Account } from '../types/banking';
import { queryKeys } from './queryKeys';

// Accounts are read by the dashboard, accounts, transfer and utility modules,
// so the query lives here and all of them hit the same cache entry.
export const accountsQuery = () =>
  queryOptions({
    queryKey: queryKeys.accounts.all,
    queryFn: async ({ signal }) => (await httpClient.get<Account[]>('/accounts', { signal })).data,
  });

export const accountQuery = (id: string | number) =>
  queryOptions({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: async ({ signal }) => (await httpClient.get<Account>(`/accounts/${id}`, { signal })).data,
  });
