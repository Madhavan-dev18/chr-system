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
        background: '#EEF0F5',
        surface: '#F2F4FA',
        accent: '#FF6B35',
        blue: '#4A90D9',
        green: '#27AE60',
        yellow: '#F39C12',
        red: '#E84545',
        purple: '#8E44AD',
        foreground: '#1e293b',
        muted: '#64748b'
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      boxShadow: {
        'neu-out': '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF',
        'neu-in': 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF',
        'neu-active': 'inset 6px 6px 12px #C8CAD4, inset -6px -6px 12px #FFFFFF',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
