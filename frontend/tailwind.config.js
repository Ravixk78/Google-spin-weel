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
        gold: {
          50: '#FDFBF7',
          100: '#FAF4E6',
          200: '#F3E5AB',
          300: '#E6C687',
          400: '#D4AF37',
          500: '#C5A059',
          600: '#AA7C11',
          700: '#8E640B',
          800: '#6B4A08',
          900: '#4A3204',
        },
        emerald: {
          950: '#071614',
          900: '#0A1F1C',
          800: '#123530',
          700: '#1E4D45',
          600: '#2D6A5F',
          500: '#3D8A7C',
        },
        luxury: {
          dark: '#0A0C0E',
          card: '#121519',
          border: '#232830',
          glass: 'rgba(18, 21, 25, 0.75)',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Outfit', 'sans-serif'],
        arabic: ['Amiri', 'Traditional Arabic', 'serif'],
      },
      boxShadow: {
        'gold': '0 0 25px -5px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 0 40px 0px rgba(212, 175, 55, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #AA7C11 100%)',
        'gold-metallic': 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)',
        'emerald-dark': 'linear-gradient(135deg, #0A1F1C 0%, #050E0C 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
