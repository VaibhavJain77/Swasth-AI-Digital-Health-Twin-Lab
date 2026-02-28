/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        healthcare: {
          blue: '#1A56DB',   // Primary blue
          teal: '#047857',   // Primary teal
          light: '#E0F2FE',  // Light blue for backgrounds
          warn: '#F59E0B',   // Orange moderate risk
          danger: '#DC2626', // Red high risk
          safe: '#10B981',   // Green low risk
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
