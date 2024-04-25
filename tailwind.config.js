module.exports = {
  mode: "jit",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "fpl-dark-purple": "#0D0C22",
        "fpl-light-purple": "#2D0D5E",
        "fpl-white": "#FFFFFF",
        "fpl-light-gray": "#F3F3F3",
      },
    },
  },
  plugins: [],
};
