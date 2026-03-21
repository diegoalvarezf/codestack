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
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Helvetica", "Arial", "sans-serif"],
        mono: ['"SFMono-Regular"', "Consolas", '"Liberation Mono"', "Menlo", "monospace"],
      },
      borderRadius: {
        sm:   "4px",
        DEFAULT: "6px",
        md:   "6px",
        lg:   "6px",
        xl:   "6px",
        "2xl": "8px",
        full: "9999px",
      },
      colors: {
        // GitHub Dark blue-gray palette
        gray: {
          50:  "#f0f6fc",
          100: "#e6edf3",
          200: "#b1bac4",
          300: "#8b949e",
          400: "#6e7681",
          500: "#484f58",
          600: "#30363d",
          700: "#21262d",
          800: "#161b22",
          900: "#0d1117",
          950: "#010409",
        },
        blue: {
          300: "#79c0ff",
          400: "#58a6ff",
          500: "#388bfd",
          600: "#1f6feb",
          700: "#1158c7",
        },
        green: {
          300: "#7ee787",
          400: "#3fb950",
          500: "#238636",
        },
        purple: {
          300: "#d2a8ff",
          400: "#bc8cff",
          500: "#8957e5",
        },
        orange: {
          300: "#ffb77c",
          400: "#f0883e",
          500: "#bd561d",
        },
        yellow: {
          300: "#f8e3a1",
          400: "#e3b341",
          500: "#9e6a03",
        },
        red: {
          300: "#ffa198",
          400: "#f85149",
          500: "#da3633",
        },
      },
    },
  },
  plugins: [],
};

export default config;
