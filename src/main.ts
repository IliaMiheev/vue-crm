import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import VueApexCharts from 'vue3-apexcharts';
import VueTablerIcons from 'vue-tabler-icons';
import { initFakeBackend } from '@/utils/helpers/fake-backend';
import { useAuthStore } from '@/stores/auth';

// print
import print from 'vue3-print-nb';

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  await initFakeBackend();

  const auth = useAuthStore();
  await auth.hydrateSession();

  app.use(router);
  app.use(PerfectScrollbarPlugin);
  app.use(VueTablerIcons);
  app.use(print);
  app.use(VueApexCharts);
  app.use(vuetify);
  app.mount('#app');
}

bootstrap();
