import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020b2e',
          900: '#041144',
          800: '#071b52',
          700: '#0a2272',
          600: '#0d2a8a',
        },
        gold: {
          DEFAULT: '#ffe569',
          300: '#fff0a0',
          400: '#ffe569',
          500: '#fad53e',
          600: '#f0c425',
        },
      },
    },
  },
  plugins: [typography],
}
