/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#F4141E', dark: '#C0000A', light: '#FF4550' },
        ink: { DEFAULT: '#1C1C1C', soft: '#2A2A2A', muted: '#3D3D3D' },
        primary: { DEFAULT: '#2F6DA5', dark: '#1E4E7A', light: '#4A8DC5' },
        gold: { DEFAULT: '#E6B75C', dark: '#C49A3A', light: '#F0CC7E' },
        sand: { DEFAULT: '#F5F1EA', dark: '#EDE7DC', light: '#FAF8F4' },
        parchment: '#F5F1EA',
        stone: {
          50: '#FAF8F4', 100: '#F0EBE2', 200: '#E0D9CE', 300: '#C8BEB2',
          400: '#A89A8C', 500: '#8A7C6E', 600: '#6B5E52', 700: '#4E4239',
          800: '#332C26', 900: '#1C1814',
        },
      },
      fontFamily: {
        // ── SF UI Display / SF Pro — Apple system font stack ──
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF UI Display',
          'SF Pro Text',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF UI Display',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        body: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'SF UI Text',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      lineHeight: {
        'editorial': '1.65',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
