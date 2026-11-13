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
          900: '#0B1D3A',
          800: '#102A43',
          700: '#1F3A60',
          600: '#2A4E7A',
          100: '#E8F0F8',
          50: '#F0F5FA'
        },
        brand: {
          blue: '#2563EB',
          'blue-dark': '#1D4ED8',
          'blue-light': '#60A5FA',
          accent: '#F59E0B',
          'accent-hover': '#D97706',
          bg: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
