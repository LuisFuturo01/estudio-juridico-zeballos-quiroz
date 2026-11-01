/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: { xs: '400px', '3xl': '1920px' },
      colors: {
        // Grafito / plomo: base del sitio (reemplaza el navy oscuro)
        graphite: {
          950: '#15181C',
          900: '#1D2026',
          850: '#23272E',
          800: '#2B3038',
          700: '#383E48',
          600: '#4A515C',
          500: '#646C78',
          400: '#8A929E',
        },
        // Acero claro: fondos de lectura con tono gris (no blanco puro)
        steel: {
          50: '#F5F6F8',
          100: '#ECEEF1',
          200: '#DFE3E8',
          300: '#CBD1D9',
          400: '#AEB6C1',
        },
        gold: {
          50: '#FBF7EE',
          100: '#F4EAD3',
          200: '#EBD6A8',
          300: '#E0C27F',
          400: '#D4AF37',
          500: '#C5A059',
          600: '#A8853F',
          700: '#846530',
        },
        ink: '#1E232B',
        muted: '#5B6470',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 32px -14px rgba(21, 24, 28, 0.25)',
        lift: '0 30px 60px -24px rgba(21, 24, 28, 0.45)',
        gold: '0 14px 34px -12px rgba(197, 160, 89, 0.6)',
        glass: 'inset 0 1px 0 0 rgba(255,255,255,0.12), 0 20px 40px -20px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gold-sheen': 'linear-gradient(135deg, #F1DFAE 0%, #D9B866 40%, #C5A059 65%, #A8853F 100%)',
      },
      keyframes: {
        'soft-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.55)' },
          '70%': { boxShadow: '0 0 0 18px rgba(212, 175, 55, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'dot-blink': {
          '0%, 80%, 100%': { opacity: '0.25' },
          '40%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0,0,var(--z,0)) ' },
          '50%': { transform: 'translate3d(0,-10px,var(--z,0))' },
        },
        'spin-3d': {
          '0%': { transform: 'rotateX(72deg) rotateZ(0deg)' },
          '100%': { transform: 'rotateX(72deg) rotateZ(360deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'soft-pulse': 'soft-pulse 2.4s ease-out infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
        'dot-blink': 'dot-blink 1.2s infinite ease-in-out',
        float: 'float 6s ease-in-out infinite',
        'spin-3d': 'spin-3d 24s linear infinite',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};
