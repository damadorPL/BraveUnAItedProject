/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0E7C9E',
          'blue-dark': '#09576F',
          'blue-light': '#E6F4F8',
          red: '#D8452E',
          'red-dark': '#B33420',
          'red-light': '#FDF1EF',
          yellow: '#EAB824',
          'yellow-light': '#FEF9E7',
          dark: '#16181D',
          surface: '#FFFFFF',
          card: '#FBFBFA',
          border: '#E2E3DE',
          muted: '#5B6172',
          text: '#21252F',
        }
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['Archivo', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(14, 124, 158, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.06)',
        'phone': '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
      }
    },
  },
  plugins: [],
}
