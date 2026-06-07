import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, normalizePath } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// https://vitejs.dev/config
export default defineConfig({
  root: projectRoot,
  base: './',
  envDir: projectRoot,
  cacheDir: path.join(__dirname, 'node_modules/.vite-renderer'),
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: [normalizePath(path.resolve(projectRoot, './src/assets/images')) + '/[!.]*'],
          dest: './assets/images'
        }
      ]
    }),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ['v-list-recognize-title'].includes(tag)
        }
      }
    }),
    vuetify({
      autoImport: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url))
    },
    dedupe: ['vue', 'vuetify', 'pinia', 'vue-router'],
    modules: [
      path.join(projectRoot, 'node_modules'),
      path.join(__dirname, 'node_modules'),
      'node_modules'
    ]
  },
  css: {
    preprocessorOptions: {
      scss: {}
    }
  },
  build: {
    chunkSizeWarningLimit: 1024 * 1024,
    rollupOptions: {
      input: path.join(projectRoot, 'index.html')
    }
  },
  optimizeDeps: {
    exclude: ['vuetify'],
    entries: [path.join(projectRoot, 'src/**/*.vue')]
  },
  server: {
    fs: {
      allow: [projectRoot]
    }
  }
});
