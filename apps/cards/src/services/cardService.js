import { httpClient } from '@bank/shared';

export const cardService = {
  async getCards({ signal } = {}) {
    const { data } = await httpClient.get('/cards', { signal });
    return data;
  },

  async updateStatus(id, status) {
    const { data } = await httpClient.patch(`/cards/${id}`, { status });
    return data;
  },
};
