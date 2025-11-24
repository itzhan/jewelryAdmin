import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { viteMockServe } from 'vite-plugin-mock';
import react from '@vitejs/plugin-react';
import svgr from '@honkhonk/vite-plugin-svgr';

const CWD = process.cwd();

const alias = {
  '@': path.resolve(__dirname, './src'),
  assets: path.resolve(__dirname, './src/assets'),
  components: path.resolve(__dirname, './src/components'),
  configs: path.resolve(__dirname, './src/configs'),
  layouts: path.resolve(__dirname, './src/layouts'),
  modules: path.resolve(__dirname, './src/modules'),
  pages: path.resolve(__dirname, './src/pages'),
  styles: path.resolve(__dirname, './src/styles'),
  utils: path.resolve(__dirname, './src/utils'),
  services: path.resolve(__dirname, './src/services'),
  router: path.resolve(__dirname, './src/router'),
  hooks: path.resolve(__dirname, './src/hooks'),
  types: path.resolve(__dirname, './src/types'),
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, CWD);
  
  return {
    base: env.VITE_BASE_URL,
    resolve: {
      alias,
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            // 如需自定义组件其他 token, 在此处配置
          },
          javascriptEnabled: true,
        },
      },
    },
    plugins: [
      svgr(),
      react(),
      mode === 'mock' && viteMockServe({
        mockPath: './mock',
        localEnabled: true,
        watchFiles: true,
      }),
    ].filter(Boolean),
    build: {
      cssCodeSplit: false,
      sourcemap: mode !== 'production',
    },
    server: {
      host: '0.0.0.0',
      port: 3003,
      open: false,
      proxy: {
        '/api': {
          target: 'https://service-exndqyuk-1257786608.gz.apigw.tencentcs.com',
          changeOrigin: true,
          secure: false,
        },
      },
      cors: true,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      alias,
      setupFiles: './src/test/setup.ts',
    },
  };
});