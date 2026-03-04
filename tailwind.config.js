/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Zaytuna-inspired color palette
        primary: '#7a1f1f',      // Deep maroon/burgundy (like Zaytuna)
        primaryDark: '#5a1515',  // Darker maroon
        accent: '#c9975b',       // Warm gold
        neutral: '#f5f3f0',      // Warm off-white
        neutralDark: '#e8e4df',  // Slightly darker neutral
        textDark: '#2d2d2d',     // Deep charcoal
        textLight: '#5a5a5a',    // Medium gray
      },
      fontFamily: {
        serif: ['Georgia', 'Garamond', 'serif'],  // Classic serif for headings
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', fontWeight: '400' }],
        'hero': ['2.5rem', { lineHeight: '1.2', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}