// tailwind.config.js
// Extends Tailwind with Unicred's design tokens so you can use
// classes like bg-surface, text-accent, border-subtle in JSX.

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        base:     '#0f1117',
        surface:  '#161b27',
        elevated: '#1e2535',
        input:    '#1a2032',

        // Accent
        accent:   '#6366f1',
        sky:      '#38bdf8',

        // Semantic
        success:  '#34d399',
        warning:  '#fbbf24',
        danger:   '#f87171',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
}