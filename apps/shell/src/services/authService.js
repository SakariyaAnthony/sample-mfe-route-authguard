import { httpClient } from '@bank/shared';

export const authService = {
  async login(username, password) {
    const { data } = await httpClient.post('/auth/login', { username, password });
    return data;
  },
};
