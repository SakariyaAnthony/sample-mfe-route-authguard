import { queryOptions } from '@tanstack/react-query';
import { httpClient } from '../api/httpClient';
import type { Beneficiary } from '../types/banking';
import { queryKeys } from './queryKeys';

// Read by both the beneficiary and transfer modules.
export const beneficiariesQuery = () =>
  queryOptions({
    queryKey: queryKeys.beneficiaries.all,
    queryFn: async ({ signal }) => (await httpClient.get<Beneficiary[]>('/beneficiaries', { signal })).data,
  });
