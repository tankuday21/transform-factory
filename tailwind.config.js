/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'factory-blue': {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bde0ff',
          300: '#90caff',
          400: '#5badff',
          500: '#3490fc',
          600: '#1a72f2',
          700: '#155ce2',
          800: '#1748b7',
          900: '#183e91',
          950: '#142759',
        },
        'factory-teal': {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'factory': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
        'factory-lg': '0 20px 60px -20px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'spin-slow': 'spin-slow 8s linear infinite',
        'spin-reverse': 'spin-reverse 6s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float-delay 5s ease-in-out infinite 1s',
        'file-move': 'file-move 6s ease-in-out infinite',
        'file-appear': 'file-appear 6s ease-in-out infinite',
      },
      keyframes: {
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-delay': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'file-move': {
          '0%': { transform: 'translateX(-50px) rotate(-12deg)', opacity: '0' },
          '20%': { transform: 'translateX(0) rotate(-12deg)', opacity: '1' },
          '80%': { transform: 'translateX(0) rotate(-12deg)', opacity: '1' },
          '100%': { transform: 'translateX(50px) rotate(-12deg)', opacity: '0' },
        },
        'file-appear': {
          '0%, 40%': { transform: 'translateX(50px) rotate(12deg)', opacity: '0' },
          '60%': { transform: 'translateX(0) rotate(12deg)', opacity: '1' },
          '100%': { transform: 'translateX(0) rotate(12deg)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
} 