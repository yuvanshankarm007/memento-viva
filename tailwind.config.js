/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ofrenda: {
          marigold: '#f59e0b',
          'marigold-deep': '#d97706',
          copal: '#e0d5c1',
          papel: '#d946ef',
          candle: '#fbbf24',
          night: '#0e0914',
          altar: '#1c1326',
          border: '#3b2550',
        },
        seance: {
          void: '#07080c',
          terminal: '#0b1016',
          phosphor: '#22c55e',
          'phosphor-amber': '#f59e0b',
          spectral: '#38bdf8',
          blood: '#dc2626',
          haze: '#1e293b',
        }
      },
      animation: {
        'flicker': 'flicker 3s infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.8))' },
          '25%': { opacity: '0.85', filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' },
          '50%': { opacity: '0.95', filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.9))' },
          '75%': { opacity: '0.8', filter: 'drop-shadow(0 0 7px rgba(245, 158, 11, 0.5))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
