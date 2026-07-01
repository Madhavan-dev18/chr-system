import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core palette
        background: '#EEF0F5',
        surface: '#F2F4FA',
        'surface-hover': '#ECEEF5',
        accent: '#FF6B35',
        'accent-hover': '#e85a22',
        'accent-muted': 'rgba(255,107,53,0.08)',
        blue: '#4A90D9',
        'blue-muted': 'rgba(74,144,217,0.08)',
        green: '#27AE60',
        'green-muted': 'rgba(39,174,96,0.08)',
        yellow: '#F39C12',
        'yellow-muted': 'rgba(243,156,18,0.08)',
        red: '#E84545',
        'red-muted': 'rgba(232,69,69,0.08)',
        purple: '#8E44AD',
        'purple-muted': 'rgba(142,68,173,0.08)',
        foreground: '#1E2035',
        'foreground-secondary': '#5A5A7A',
        muted: '#9898B8',
        border: 'rgba(200,202,212,0.4)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        none: '0',
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        // Neumorphic elevated
        'neu-out': '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF',
        'neu-out-sm': '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF',
        'neu-out-lg': '8px 8px 16px #C8CAD4, -8px -8px 16px #FFFFFF',
        // Neumorphic pressed
        'neu-in': 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF',
        'neu-in-sm': 'inset 2px 2px 5px #C8CAD4, inset -2px -2px 5px #FFFFFF',
        'neu-in-lg': 'inset 6px 6px 12px #C8CAD4, inset -6px -6px 12px #FFFFFF',
        // Accent shadows
        'accent-sm': '0 4px 12px rgba(255,107,53,0.25)',
        'accent-md': '0 6px 20px rgba(255,107,53,0.35)',
        // Status
        'status-green': '0 0 0 2px rgba(39,174,96,0.3)',
        'status-red': '0 0 0 2px rgba(232,69,69,0.3)',
        'status-yellow': '0 0 0 2px rgba(243,156,18,0.3)',
      },
      animation: {
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
