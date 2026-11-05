import { httpClient, type Transfer, type TransferRequest } from '@bank/shared';

export const transferService = {
  async createTransfer(payload: TransferRequest): Promise<Transfer> {
    const { data } = await httpClient.post<Transfer>('/transfers', payload);
    return data;
  },
};
