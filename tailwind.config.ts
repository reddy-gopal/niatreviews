import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* NIAT brand – use these everywhere instead of default blue/gray */
        primary: {
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          light: "var(--secondary-light)",
          dark: "var(--secondary-dark)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          1: "var(--accent-1)",
          2: "var(--accent-2)",
          3: "var(--accent-3)",
        },
        niat: {
          navbar: "var(--niat-navbar)",
          section: "var(--niat-section)",
          text: "var(--niat-text)",
          "text-secondary": "var(--niat-text-secondary)",
          border: "var(--niat-border)",
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, var(--hero-from) 0%, var(--hero-to) 100%)",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(30, 41, 59, 0.06)",
        card: "0 4px 12px rgba(30, 41, 59, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
