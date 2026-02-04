/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#001F3F',
          light: '#003366', // Slightly lighter for gradients/hover
        },
        gold: {
          DEFAULT: '#FFD700',
          dark: '#D4AF37', // Slightly darker for hover
        },
      },
    },
  },
  plugins: [],
}