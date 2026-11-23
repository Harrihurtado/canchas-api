import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // URL base de la API. En desarrollo se usa "/api" y el proxy de Vite la reenvía al backend.
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL || '/api'),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': env.API_PROXY_TARGET || 'http://localhost:3000',
      },
    },
  };
});
