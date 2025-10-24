/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dodajemy naszą paletę 'accent'
        accent: {
          DEFAULT: '#6D28D9', // Główny fiolet
          light: '#8B5CF6',
          dark: '#5B21B6',
        },
      },
    },
  },
  plugins: [],
};