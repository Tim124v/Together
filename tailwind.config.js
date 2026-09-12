/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#667eea',
          50: '#f2f4fe',
          100: '#e6e9fd',
          200: '#ccd3fb',
          300: '#a8b4f6',
          400: '#8494f0',
          500: '#667eea',
          600: '#4f5fd4',
          700: '#3f4bab',
          800: '#333c86',
          900: '#252b60',
        },
        her: '#f093fb',
        him: '#4facfe',
        both: '#10b981',
        ink: '#1e293b',
        canvas: '#f8fafc',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(30, 41, 59, 0.04), 0 8px 24px -12px rgba(30, 41, 59, 0.14)',
        lift: '0 24px 60px -24px rgba(102, 126, 234, 0.45)',
        glow: '0 0 0 1px rgba(102, 126, 234, 0.16), 0 18px 40px -18px rgba(102, 126, 234, 0.5)',
      },
      backgroundImage: {
        'grad-brand': 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
        'grad-her': 'linear-gradient(135deg, #f093fb 0%, #f5a9c8 100%)',
        'grad-him': 'linear-gradient(135deg, #4facfe 0%, #67e8f9 100%)',
        'grad-both': 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)',
        'grad-night': 'linear-gradient(135deg, #1e1b3a 0%, #0f172a 100%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in .4s ease both',
        'fade-up': 'fade-up .5s cubic-bezier(.16,1,.3,1) both',
        'scale-in': 'scale-in .28s cubic-bezier(.16,1,.3,1) both',
        float: 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
