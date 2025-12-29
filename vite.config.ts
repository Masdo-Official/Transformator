import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],

    /**
     * IMPORTANT:
     * We read API_KEY directly from process.env
     * because Vercel injects Environment Variables
     * into process.env at build time.
     */
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    },

    server: {
      port: 3000,
      host: true,
    },
  };
});
