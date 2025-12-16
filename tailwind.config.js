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
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        carbon: {
          DEFAULT: '#222222',
          light: '#2d2d2d',
          dark: '#1a1a1a'
        },
        persian: '#2A9D8F',
        sea: '#07B5A7',
        wolf: '#CECECE',
        zinc: '#FDFDFD',
        primary: '#333333', // Nuevo color de texto principal legible
        secondary: '#4B5563', // Gris oscuro para subtítulos
      }
    },
  },
  plugins: [],
}