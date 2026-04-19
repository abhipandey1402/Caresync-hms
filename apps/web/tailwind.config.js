/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:        '#FAFDF9',
          green:     '#1A6B3C',
          'green-mid': '#2E9B59',
          gold:      '#E8A020',
          text:      '#0F1F17',
          'text-sec': '#4A6258',
          muted:     '#EDF4EF',
          border:    '#C8DDD0',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 18px 46px rgba(26, 107, 60, 0.08)'
      }
    }
  },
  plugins: [],
}
