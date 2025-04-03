/** @type {import('tailwindcss').Config} */
export default {
  content: ["./client/index.html", "./client/**/*.{jsx,tsx}"],
  theme: {
    extend: {
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      margin: {
        'safe': 'env(safe-area-inset-bottom)',
        'nav': 'var(--browser-nav-height)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      screens: {
        'xs': '375px',
      },
      zIndex: {
        '60': '60',
      }
    },
  },
  plugins: [],
};
