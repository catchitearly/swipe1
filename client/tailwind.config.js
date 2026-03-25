/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF4B6E',
        secondary: '#1A1A2E',
        accent: '#FFD93D',
        success: '#6BCB77',
        error: '#FF6B6B',
        background: '#0F0F1A',
        card: '#1E1E32',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0B0',
        'text-muted': '#6B6B7B',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}