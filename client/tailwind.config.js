/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#06172A", // Main primary - DARK BLUE
          600: "#051324",
          700: "#040f1e",
          800: "#030c18",
          900: "#020912",
        },
        secondary: {
          50: "#f8f9fa",
          100: "#f1f3f4",
          200: "#e8eaed",
          300: "#dadce0",
          400: "#bdc1c6",
          500: "#B0BEC5", // Main secondary - LIGHT BLUE GRAY
          600: "#9ea8ad",
          700: "#879095",
          800: "#6f787d",
          900: "#1C2526", // DARK GRAY
        },
        accent: {
          50: "#fef7e0",
          100: "#fdecc2",
          200: "#fbd99f",
          300: "#f9c67c",
          400: "#f7b359",
          500: "#D4A017", // Main accent - GOLD
          600: "#b8860b",
          700: "#9a6b08",
          800: "#7c5006",
          900: "#5e3a04",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#3F0D12", // Main danger - BURGUNDY
          600: "#380b10",
          700: "#2f090e",
          800: "#26070b",
          900: "#1e0509",
        },
        // Semantic colors
        background: "#ffffff",
        surface: "#f8f9fa",
        text: {
          primary: "#1C2526",
          secondary: "#5f6368",
          muted: "#9aa0a6",
        },
        border: {
          light: "#e8eaed",
          medium: "#dadce0",
          dark: "#bdc1c6",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(6, 23, 42, 0.08)",
        medium: "0 4px 16px rgba(6, 23, 42, 0.12)",
        strong: "0 8px 32px rgba(6, 23, 42, 0.16)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
};
