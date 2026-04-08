/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#F4141E',
          dark: '#C0000A',
          light: '#FF4550',
        },
        ink: {
          DEFAULT: '#0A0A0A',
          soft: '#1A1A1A',
          muted: '#2C2C2C',
        },
        stone: {
          50: '#F7F6F3',
          100: '#EDE9E3',
          200: '#D9D3CA',
          300: '#C0B8AC',
          400: '#A09690',
          500: '#7D7168',
          600: '#5E5450',
          700: '#433D39',
          800: '#2D2825',
          900: '#1A1714',
        },
        parchment: '#F9F6F0',
      },
      fontFamily: {
        display: [
          'SF UI Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Helvetica Neue',
          'sans-serif',
        ],
        body: [
          'SF Pro Text',
          '-apple-system',
          'BlinkMacSystemFont',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
