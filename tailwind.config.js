/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "pik-main-green": "#64AB85",
        "pik-deep-green": "#3C7157",
        "pik-light-green": "#D4EEE2",
        "pik-lighter-green": "#EDF7F2",
        "pik-light-white": "#F9FAFB",
        "pik-light-gray": "#9CA3AF",
        "pik-error-red": "#EF4444",
        "pik-success-green": "#10B881",
        "pik-marine-blue": "#2B5288",
        "pik-rich-blue": "#191265",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
