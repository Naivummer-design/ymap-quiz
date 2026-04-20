import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function getBasePath() {
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH;
  }

  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  if (!repoName) {
    return './';
  }

  return repoName.endsWith('.github.io') ? '/' : `/${repoName}/`;
}

export default defineConfig({
  base: 'ymap-quiz',
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
