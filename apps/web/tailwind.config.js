/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        timber: {
          50: '#fdf8f4',
          100: '#f9eee2',
          200: '#f2dac3',
          300: '#e7c09e',
          400: '#d99f74',
          500: '#ce8153',
          600: '#bf6a45',
          700: '#9f5339',
          800: '#804433',
          900: '#683a2d',
        },
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
    },
  },
  plugins: [],
};
