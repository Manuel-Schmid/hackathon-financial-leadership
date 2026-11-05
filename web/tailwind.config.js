import { readFileSync } from 'node:fs';

/** Farben stehen nur in config/theme.json (Farbwelt, Akzent), nicht in Komponenten. */
const theme = JSON.parse(readFileSync(new URL('../config/theme.json', import.meta.url), 'utf-8'));
const { cube: _cube, compare: _compare, ...colors } = theme;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        title: ['Sora', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: { pop: '0 10px 30px rgba(11,29,58,.12)' },
    },
  },
  plugins: [],
};
