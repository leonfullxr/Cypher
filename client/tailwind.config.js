/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors : {
        primary : "#00acb1",
        secondary: "#0bc5ea",
      }
    },
  },
  plugins: [],
}

