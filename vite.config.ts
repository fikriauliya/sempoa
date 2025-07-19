import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: process.env.NODE_ENV === 'production' ? '/sempoa/' : '/',
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
      allowedHosts: ['ef16c7d33f27.ngrok-free.app'], // Allow ngrok host
    },
  };
});
