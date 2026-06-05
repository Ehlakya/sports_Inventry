/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#334155',
          DEFAULT: '#0f172a', // Dark Blue
          dark: '#020617',
        },
        secondary: {
          light: '#fdba74',
          DEFAULT: '#f97316', // Orange
          dark: '#ea580c',
        },
        accent: {
          light: '#f1f5f9',
          DEFAULT: '#e2e8f0',
          dark: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 23, 42, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
