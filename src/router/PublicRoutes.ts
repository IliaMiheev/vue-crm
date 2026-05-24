const PublicRoutes = {
  path: '/',
  component: () => import('@/layouts/blank/BlankLayout.vue'),
  meta: {
    requiresAuth: false
  },
  children: [
    {
      name: 'Login',
      path: '/login',
      meta: { requiresAuth: false },
      component: () => import('@/views/authentication/auth/LoginPage.vue')
    },
    {
      name: 'Register',
      path: '/register',
      meta: { requiresAuth: false },
      component: () => import('@/views/authentication/auth/RegisterPage.vue')
    },
    {
      name: 'Not Found',
      path: '/notfound',
      meta: { requiresAuth: false },
      component: () => import('@/views/notfound/NotFound.vue')
    },
    {
      name: 'Loading',
      path: '/loading',
      meta: { requiresAuth: false },
      component: () => import('@/views/notfound/Loading.vue')
    }
  ]
};

export default PublicRoutes;
