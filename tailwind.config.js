/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        app: {
          bg: 'var(--app-bg)',
          card: 'var(--app-card)',
          border: 'var(--app-border)',
          text: 'var(--app-text)',
          muted: 'var(--app-muted)',
        },
      },
      transitionDuration: {
        sidebar: '200ms',
        theme: '200ms',
      },
    },
  },
  plugins: [],
}
