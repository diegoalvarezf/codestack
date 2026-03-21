import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        marquee: "marquee 28s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      colors: {
        // Neutral black palette — no blue tint (inspired by Vercel/GitHub dark)
        gray: {
          50:  "#fafafa",
          100: "#f5f5f5",
          200: "#e8e8e8",
          300: "#d1d1d1",
          400: "#a8a8a8",
          500: "#737373",
          600: "#525252",
          700: "#333333",
          800: "#1c1c1c",
          900: "#111111",
          950: "#080808",
        },
      },
    },
  },
  plugins: [],
};

export default config;
