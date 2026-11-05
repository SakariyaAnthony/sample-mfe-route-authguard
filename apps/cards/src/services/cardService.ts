import { queryOptions } from '@tanstack/react-query';
import { httpClient, queryKeys, type Card, type CardStatus } from '@bank/shared';

export const cardsQuery = () =>
  queryOptions({
    queryKey: queryKeys.cards.all,
    queryFn: async ({ signal }) => (await httpClient.get<Card[]>('/cards', { signal })).data,
  });

export const cardService = {
  async updateStatus({ id, status }: { id: number; status: CardStatus }): Promise<Card> {
    const { data } = await httpClient.patch<Card>(`/cards/${id}`, { status });
    return data;
  },
};
