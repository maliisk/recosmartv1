import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#4C5BFF", dark: "#3746CC" },
      },
      boxShadow: { card: "0 8px 30px rgba(0,0,0,0.06)" },
      borderRadius: { xl: "14px", "2xl": "18px" },
      backgroundImage: {
        "paper-grid":
          "radial-gradient(rgba(0,0,0,.05) 1px, transparent 1px), radial-gradient(rgba(0,0,0,.03) 1px, transparent 1px)",
      },
      backgroundSize: { "grid-lg": "24px 24px", "grid-sm": "6px 6px" },
    },
  },
  plugins: [],
} satisfies Config;
