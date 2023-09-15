// const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    'index.html',
    'write/index.html',
    'write/js/script.js',
    'look/index.html',
    'look/js/script.js',
    'look/timeline/index.html',
    'look/timeline/js/script.js',
    'chat/index.html',
    'chat/js/script.js',
    'chat/js/Chat.js',
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
