/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Ivory / paper background system
        paper: "#FAF7EF",
        "paper-dim": "#F2EEE1",
        ink: "#1C2420",

        // Deep green — primary brand color (Ayurveda / manuscript inspired)
        green: {
          DEFAULT: "#1F3B2C",
          dark: "#142A1F",
          mid: "#2E5940",
          light: "#4A7D5C",
          pale: "#E4ECE5",
        },

        // Gold / earth accent
        gold: {
          DEFAULT: "#B8862E",
          dark: "#8F6A22",
          light: "#D9AE5F",
        },
        earth: "#9C5A34",

        // Semantic
        rust: "#A03E2A",
        hairline: "#DED6C0",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(20, 42, 31, 0.06), 0 1px 12px rgba(20, 42, 31, 0.04)",
      },
    },
  },
  plugins: [],
}
