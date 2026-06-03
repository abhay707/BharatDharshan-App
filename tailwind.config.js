/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#0D0500',
        saffron: '#E8580A',
        gold: '#C9901A',
        crimson: '#8B1A1A',
        parchment: '#F5EDD8',
        cream: '#FAF6EE',
      },
    },
  },
  plugins: [],
};
