/*
export default {
  // config options
  base: '/input-web/',
};
*/

import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        write: resolve(__dirname, 'write/index.html'),
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});
