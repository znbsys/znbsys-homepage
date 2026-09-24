import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        page: 'rgb(var(--color-page) / <alpha-value>)',
        band: 'rgb(var(--color-band) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        'line-strong': 'rgb(var(--color-line-strong) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        'panel-line': 'rgb(var(--color-panel-line) / <alpha-value>)',
        wash: 'rgb(var(--color-wash) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        title: 'rgb(var(--color-title) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        soft: 'rgb(var(--color-soft) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
      },
      fontFamily: {
        cjk: ['var(--font-cjk)', 'system-ui', 'sans-serif'],
        latin: ['var(--font-latin)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
