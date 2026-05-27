/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stb: {
          DEFAULT: "#0088c9",
          dark: "#00689c",
          soft: "#e7f5fb",
          ink: "#050505",
          border: "#b9dceb",
          surface: "#ffffff",
          "surface-soft": "#f1f8fc",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgb(15 23 42 / 0.05)",
        "card-hover": "0 8px 24px -8px rgb(15 23 42 / 0.12)",
      },
      borderRadius: {
        xl2: "1rem",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
}
