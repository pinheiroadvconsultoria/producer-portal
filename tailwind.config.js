/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        agro: {
          green: '#2d6a4f',
          lime:  '#52b788',
          earth: '#8b5e3c',
          gold:  '#d4a017',
          cream: '#f5f0e8',
          dark:  '#1a3a2a',
        },
      },
    },
  },
  plugins: [],
}

