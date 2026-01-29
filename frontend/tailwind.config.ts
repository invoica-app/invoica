import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#9747E6",
          foreground: "#FFFFFF",
        },
        background: "#FFFFFF",
        foreground: "#111827",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
        secondary: {
          DEFAULT: "#F9FAFB",
          foreground: "#111827",
        },
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#F3F4F6",
          foreground: "#111827",
        },
        border: "#E5E7EB",
        input: "#D1D5DB",
        ring: "#9747E6",
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        script: ["Amatica SC", "cursive"],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
      },
    },
  },
  plugins: [],
};
export default config;
