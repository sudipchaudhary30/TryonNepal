import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#C9A66B',
        'accent-dark': '#9C7A3F',
        'accent-warm': '#C9A66B',
        bg: '#0A0A0A',
        card: '#13110D',
        offwhite: '#F7F6F3',
        border: '#2A241D',
      },
      fontFamily: {
        display: ['Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', 'serif'],
        body: ['Inter', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
