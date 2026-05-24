import { defineStore } from 'pinia';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';
import type { RegisterPayload, SessionUser } from '@/utils/helpers/fake-backend';

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export type { RegisterPayload, SessionUser };

function setSession(user: SessionUser) {
  localStorage.setItem('user', JSON.stringify(user));
}

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    user: JSON.parse(localStorage.getItem('user')),
    returnUrl: null as string | null,
    loading: false
  }),
  actions: {
    async login(username: string, password: string) {
      const user = await fetchWrapper.post(`${baseUrl}/authenticate`, { username, password });
      this.user = user;
      setSession(user);
      router.push(this.returnUrl || '/dashboard');
    },
    async register(payload: RegisterPayload) {
      const user = await fetchWrapper.post(`${baseUrl}/register`, payload);
      this.user = user;
      setSession(user);
      router.push(this.returnUrl || '/dashboard');
    },
    logout() {
      this.user = null;
      localStorage.removeItem('user');
      router.push('/login');
    },
    isAuthenticated() {
      this.loading = true;
      /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      const user = JSON.parse(localStorage.getItem('user')) as SessionUser;
      this.loading = false;
      return !!(user && user.id && user.username);
    }
  }
});
