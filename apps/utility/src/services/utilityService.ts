import { queryOptions } from '@tanstack/react-query';
import { httpClient, queryKeys, type Biller, type Payment, type PaymentRequest } from '@bank/shared';

export const billersQuery = () =>
  queryOptions({
    queryKey: queryKeys.billers.all,
    queryFn: async ({ signal }) => (await httpClient.get<Biller[]>('/billers', { signal })).data,
  });

export const billerQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeys.billers.detail(id),
    queryFn: async ({ signal }) => (await httpClient.get<Biller>(`/billers/${id}`, { signal })).data,
  });

export const utilityService = {
  async payBill(payload: PaymentRequest): Promise<Payment> {
    const { data } = await httpClient.post<Payment>('/payments', payload);
    return data;
  },
};
