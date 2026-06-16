import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090d16", // Premium very dark blue-slate background
        card: "#111827",       // Slate 900 card background
        cardLight: "#1f2937",  // Slate 800 hover cards
        primary: "#3b82f6",    // Blue accent
        success: "#10b981",    // Emerald green for buy / win
        danger: "#f43f5e",     // Rose red for sell / loss
        warning: "#f59e0b",    // Amber for warnings
        border: "#1f2937",     // Card border color
        textSecondary: "#9ca3af" // Muted gray text
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
