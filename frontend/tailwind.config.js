/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          50: '#f0f7fe',
          100: '#e0effd',
          200: '#b9dffa',
          300: '#7cc3f6',
          400: '#38a4ef',
          500: '#0e86d4',
          600: '#056cb3',
          700: '#065792',
          800: '#094a79',
          900: '#0d3e64',
          950: '#082742',
          blue: '#0A66C2',
        }
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px) rotate(-4deg)' },
          '40%, 80%': { transform: 'translateX(8px) rotate(4deg)' },
        },
        punchPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' }
        }
      },
      animation: {
        shake: 'shake 0.3s ease-in-out',
        punchPop: 'punchPop 0.2s ease-in-out'
      }
    },
  },
  plugins: [],
}
