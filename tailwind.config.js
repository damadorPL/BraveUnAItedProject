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
          // Oficjalny kobalt Niepodzielnych (niepodzielni.com)
          cobalt: '#1500bb',
          'cobalt-dark': '#0f008c',
          'cobalt-light': '#1500bb0f',
          'cobalt-border': '#1500bb26',
          
          // Oficjalna zieleń CTA i sukcesu
          green: '#01be4a',
          'green-dark': '#019e3d',
          'green-light': '#e6f9ef',
          'green-border': '#01be4a33',
          
          // Akcenty DOBRO(:STAN:)
          pink: '#ffccd3',
          'pink-light': '#ffe2e6',
          cream: '#faf4e6',
          
          // Tła i struktura
          bg: '#f9f8f6',
          surface: '#ffffff',
          border: '#eaeaea',
          
          // Typografia
          text: '#323232',
          muted: '#767676',
          
          // Błędy / odwołania
          error: '#c0392b',
          'error-light': '#fdf3f3',
          'error-border': '#f5c6cb'
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
