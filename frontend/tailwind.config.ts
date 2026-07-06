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
        background: "#0B0B0B",
        card: "#161616",
        sidebar: "#111111",
        navbar: "#151515",
        primary: "#FFD400",
        "primary-dark": "#CCAA00",
        secondary: "#FFFFFF",
        border: "#2B2B2B",
        success: "#00C853",
        danger: "#FF1744",
        warning: "#FF9800",
        info: "#2196F3",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        'glow-yellow': '0 0 30px rgba(255, 212, 0, 0.15)',
        'glow-green': '0 0 20px rgba(0, 200, 83, 0.15)',
        'glow-red': '0 0 20px rgba(255, 23, 68, 0.15)',
        'panel': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};
export default config;
