import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    proxy: {
      '/scoreboard': {
        target: 'https://nethackscoreboard.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/scoreboard/, ''),
      },
    },
  },
});
