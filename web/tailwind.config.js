/** Branding-Tokens aus docs/BRANDING.md. Farben hier ändern, nicht in Komponenten. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        L: { DEFAULT: '#2F80ED', soft: '#E6F0FD' },
        R: { DEFAULT: '#E8A317', soft: '#FDF3DC', text: '#B07A00' },
        S: { DEFAULT: '#1E9E6A', soft: '#E2F4EC' },
        accent: { DEFAULT: '#5B4BE0', soft: '#F1F3FF' },
        ink: { DEFAULT: '#0E1726', 2: '#24304A', line: '#2C3A55', muted: '#9AA7BD', nav: '#B7C2D6' },
        text: '#152033',
        paper: '#F4F6F9',
        card: '#FFFFFF',
        line: { DEFAULT: '#E1E6EE', soft: '#EEF1F5' },
        muted: '#66748A',
        good: '#1E9E6A',
        warn: '#E0A100',
        bad: '#D9443B',
      },
      fontFamily: {
        title: ['Sora', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: { pop: '0 10px 30px rgba(14,23,38,.12)' },
    },
  },
  plugins: [],
};
