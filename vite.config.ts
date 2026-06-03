import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Decap CMS admin is dev-only. Remove dist/admin/ from production builds
      // so zerogo.ai/admin is never accessible (Amplify serves static files directly,
      // bypassing server.ts which 404s /admin in prod).
      {
        name: 'remove-admin-in-prod',
        closeBundle() {
          if (mode === 'production') {
            const adminDir = path.resolve(__dirname, 'dist/admin');
            if (fs.existsSync(adminDir)) {
              fs.rmSync(adminDir, { recursive: true, force: true });
            }
          }
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
