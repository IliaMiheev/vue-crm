import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { useAuthStore } from '@/stores/auth';

const publicPaths = ['/login', '/register', '/loading', '/notfound'];

export const router = createRouter({
  history: createWebHistory(),
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
