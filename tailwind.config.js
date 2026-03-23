/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0F',
        surface: '#13131A',
        surface2: '#1A1A22',
        border: '#1E1E28',
        text: '#FFFFFE',
        muted: '#72768A',
        accent: '#FF6B35',
        accent2: '#7F5AF0',
        green: '#2CB67D',
        pink: '#E53170',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '12px',
        card: '16px',
        lg: '20px',
        pill: '50px',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,107,53,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(255,107,53,0.3)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.45s ease both',
        popIn: 'popIn 0.4s ease both',
        float: 'float 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
