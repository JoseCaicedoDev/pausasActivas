import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'pa-bg': '#0f172a',
        'pa-surface': '#1e293b',
        'pa-surface-hover': '#334155',
        'pa-text': '#cbd5e1',
        'pa-text-muted': '#64748b',
        'pa-accent': '#38bdf8',
        'pa-success': '#4ade80',
        'pa-warning': '#fbbf24',
        'pa-danger': '#f87171',
        'pa-pastel-bg': '#faf5ee',
        'pa-pastel-surface': '#f0ebe3',
        'pa-pastel-text': '#3d3929',
        'pa-pastel-accent': '#7c9a92',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-gentle': 'pulse 3s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
