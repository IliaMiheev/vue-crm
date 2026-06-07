import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { useAuthStore } from '@/stores/auth';

const publicPaths = ['/login', '/register', '/loading', '/notfound'];

/** file:// в Electron не поддерживает history API — используем hash */
function createAppHistory() {
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return createWebHashHistory();
  }
  return createWebHistory(import.meta.env.BASE_URL);
}

export const router = createRouter({
  history: createAppHistory(),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      redirect: '/loading'
    },
    MainRoutes,
    PublicRoutes
  ]
});

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  const isPublic = publicPaths.includes(to.path);
  const isLoggedIn = auth.isAuthenticated();

  if (!isPublic && !isLoggedIn) {
    auth.returnUrl = to.fullPath;
    next('/login');
    return;
  }

  if (isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    next(auth.returnUrl || '/dashboard');
    return;
  }

  next();
});
