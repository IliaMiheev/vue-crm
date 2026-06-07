import { defineStore } from 'pinia';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';
import type { RegisterPayload, SessionUser } from '@/utils/helpers/fake-backend';
import { idbRemove, idbSet, migrateLocalStorageKey } from '@/utils/helpers/indexed-db';

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;
const SESSION_KEY = 'user';

export type { RegisterPayload, SessionUser };

async function setSession(user: SessionUser) {
  await idbSet(SESSION_KEY, user);
}

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    user: null as SessionUser | null,
    returnUrl: null as string | null,
    loading: false
  }),
  actions: {
    async hydrateSession() {
      const user = await migrateLocalStorageKey<SessionUser>(SESSION_KEY);
      if (user?.id && user?.username) {
        this.user = user;
      }
    },
    async login(username: string, password: string) {
      const user = await fetchWrapper.post(`${baseUrl}/authenticate`, { username, password });
      this.user = user;
      await setSession(user);
      router.push(this.returnUrl || '/dashboard');
    },
    async register(payload: RegisterPayload) {
      const user = await fetchWrapper.post(`${baseUrl}/register`, payload);
      this.user = user;
      await setSession(user);
      router.push(this.returnUrl || '/dashboard');
    },
    async logout() {
      this.user = null;
      await idbRemove(SESSION_KEY);
      router.push('/login');
    },
    isAuthenticated() {
      return !!(this.user?.id && this.user?.username);
    }
  }
});
