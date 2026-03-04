/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        elite: {
          bg: "#0A0E1A",
          surface: "#1D1E33",
          cyan: "#00E5FF",
          gold: "#FFC107",
          purple: "#B829EE",
        },
      },
    },
  },
  plugins: [],
};
