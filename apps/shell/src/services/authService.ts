import { httpClient, type Session } from '@bank/shared';

export const authService = {
  async login(username: string, password: string): Promise<Session> {
    const { data } = await httpClient.post<Session>('/auth/login', { username, password });
    return data;
  },
};
