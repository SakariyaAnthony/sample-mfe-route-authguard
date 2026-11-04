import { httpClient, type Card, type CardStatus, type RequestOptions } from '@bank/shared';

export const cardService = {
  async getCards({ signal }: RequestOptions = {}): Promise<Card[]> {
    const { data } = await httpClient.get<Card[]>('/cards', { signal });
    return data;
  },

  async updateStatus(id: number, status: CardStatus): Promise<Card> {
    const { data } = await httpClient.patch<Card>(`/cards/${id}`, { status });
    return data;
  },
};
