/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        monkey: {
          bg: '#323437',
          sub: '#2c2e31',
          card: '#2c2e31',
          border: '#252729',
          text: '#d1d0c5',
          subtext: '#646669',
          main: '#e2b714',
          accent: '#2ecc71',
          error: '#ca4754',
          errorExtra: '#7e2a33',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Roboto Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
