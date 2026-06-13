/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neutral: {
          DEFAULT: '#0b0f0c',
          dim: '#0b0f0c',
          bright: '#262e28',
          low: '#0f1511',
          mid: '#151b16',
          high: '#1a211c',
          higher: '#202822',
        },
        primary: {
          DEFAULT: '#9dd3aa',
          on: '#16492b',
          container: '#2b5c3c',
          'on-container': '#b9f0c6',
          inverse: '#386948',
          dim: '#90c59d',
        },
        secondary: {
          DEFAULT: '#d0c5b8',
          on: '#463f35',
          container: '#413a31',
          'on-container': '#c8beb0',
          dim: '#c2b7aa',
        },
        tertiary: {
          DEFAULT: '#ffe8c0',
          on: '#6b5320',
          container: '#fad998',
          'on-container': '#614b18',
          dim: '#ebcb8b',
        },
        error: {
          DEFAULT: '#fa746f',
          on: '#490006',
          container: '#871f21',
          'on-container': '#ff9993',
          dim: '#c54d4a',
        },
        'on-surface': {
          DEFAULT: '#dfe8de',
          variant: '#a4ada5',
        },
        outline: {
          DEFAULT: '#6f7870',
          variant: '#424a43',
        },
        'inverse-surface': '#f7faf4',
        'inverse-on-surface': '#525652',
        background: '#0b0f0c',
        'on-background': '#dfe8de',
      },
      fontFamily: {
        sans: ['"Nunito Sans"', 'system-ui', 'sans-serif'],
        display: ['Literata', '"Nunito Sans"', 'serif'],
        serif: ['Literata', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(30, 35, 32, 0.4)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #9dd3aa, #2b5c3c)',
        'gradient-dark': 'linear-gradient(135deg, #0b0f0c, #151b16)',
        'gradient-card': 'linear-gradient(145deg, rgba(157,211,170,0.08), rgba(208,197,184,0.04))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
