/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,svelte,ts,css}'],
  theme: {
    extend: {
      colors: {

        "letkwet": {
          50: "#FDF6EC",
          100: "#FCEBD5",
          200: "#F8D6AA",
          300: "#F5C280",
          400: "#F1AE55",
          500: "#EE992D",
          600: "#D07D11",
          700: "#9C5E0D",
          800: "#683E08",
          900: "#341F04"
        }
      }
    }
  },
}
