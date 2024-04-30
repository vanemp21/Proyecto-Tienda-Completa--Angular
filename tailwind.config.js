/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors:{
        'primary':'rgb(125, 11, 68)',
        'disabled':'rgb(150, 93, 121)',
        'hover':'rgb(97, 35, 66)'
      }
    },
  },
  plugins: [],
}

