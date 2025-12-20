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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Fox orange theme - warm, vibrant colors inspired by fox fur
        primary: {
          50: "#fff5f0",
          100: "#ffe8db",
          200: "#ffd1b8",
          300: "#ffb085",
          400: "#ff8f52",
          500: "#ff6b35", // Main fox orange
          600: "#e65a2b",
          700: "#cc4921",
          800: "#b33a17",
          900: "#992d0f",
          950: "#7a2409",
        },
        // Secondary gray tones for balance
        fox: {
          orange: "#ff6b35",
          cream: "#fff5f0",
          brown: "#7a2409",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      spacing: {
        "128": "32rem",
        "144": "36rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
