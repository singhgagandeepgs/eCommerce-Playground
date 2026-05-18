/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':    'fadeIn 0.2s ease-out',
        'shake':      'shake 0.5s ease-in-out',
        'bounce-in':  'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '15%':     { transform: 'translateX(-6px)' },
          '30%':     { transform: 'translateX(6px)' },
          '45%':     { transform: 'translateX(-4px)' },
          '60%':     { transform: 'translateX(4px)' },
          '75%':     { transform: 'translateX(-2px)' },
          '90%':     { transform: 'translateX(2px)' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0)',   opacity: '0' },
          '60%':  { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
