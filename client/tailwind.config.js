/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        top: "0px -4px 4px -2px rgba(0, 0, 0, 0.2)",
      },
      colors: {
        ligtGrey: "#94a3b8",
        boldGrey: "#475569",
        lightestBold: "#D0D5DD",
        primary: "#0070FF",
        BlueGlobal: "#16A7B9",
        lightBlue: "#E6F7FF",
        buttonModalColor: "#349FA7",
      },
    },
  },
  plugins: [],
};
