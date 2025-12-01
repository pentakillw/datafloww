/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Code Pro"', 'monospace'],
        mono: ['"Source Code Pro"', 'monospace'],
      },
      colors: {
        carbon: {
          DEFAULT: '#222222',
          light: '#2d2d2d',
          dark: '#1a1a1a'
        },
        persian: {
          DEFAULT: '#029CA3',
          dark: '#027a80'
        },
        sea: '#07B5A7',
        wolf: '#CECECE',
        zinc: '#FDFDFD',
      }
    },
  },
  plugins: [],
}