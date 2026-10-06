/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          dark: '#131921',
          light: '#232f3e',
          yellow: '#febd69',
          orange: '#f08804',
          accent: '#e77600',
          blue: '#007185',
          hover: '#eaeded',
        }
      }
    },
  },
  plugins: [],
}
