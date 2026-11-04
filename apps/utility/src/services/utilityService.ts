import {
  httpClient,
  type Account,
  type Biller,
  type Payment,
  type PaymentRequest,
  type RequestOptions,
} from '@bank/shared';

export const utilityService = {
  async getBillers({ signal }: RequestOptions = {}): Promise<Biller[]> {
    const { data } = await httpClient.get<Biller[]>('/billers', { signal });
    return data;
  },

  async getBiller(id: string, { signal }: RequestOptions = {}): Promise<Biller> {
    const { data } = await httpClient.get<Biller>(`/billers/${id}`, { signal });
    return data;
  },

  async getAccounts({ signal }: RequestOptions = {}): Promise<Account[]> {
    const { data } = await httpClient.get<Account[]>('/accounts', { signal });
    return data;
  },

  async payBill(payload: PaymentRequest): Promise<Payment> {
    const { data } = await httpClient.post<Payment>('/payments', payload);
    return data;
  },
};
