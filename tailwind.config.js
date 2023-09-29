// const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    'index.html',
    'write/index.html',
    'public/write/js/script.js',
    'look/index.html',
    'public/look/js/script.js',
    'look/timeline/index.html',
    'public/timeline/js/script.js',
    'chat/index.html',
    'public/chat/js/script.js',
    'public/chat/js/Chat.js',
    'explanation/index.html',
    './src/**/*.{js,jsx,ts,tsx,vue,html}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '360px',
      },
    },
  },
  plugins: [],
};
