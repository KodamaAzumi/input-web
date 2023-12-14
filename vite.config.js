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
        look: resolve(__dirname, 'look/index.html'),
        sentence: resolve(__dirname, 'look/sentence/index.html'),
        timeline: resolve(__dirname, 'look/timeline/index.html'),
        chat: resolve(__dirname, 'chat/index.html'),
        explanation: resolve(__dirname, 'explanation/index.html'),
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 8883,
  },
});
