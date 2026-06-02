import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16201c",
        field: "#f5f6f1",
        line: "#dfe3da",
        brand: "#156f5b",
        accent: "#d84f2a",
        gold: "#d69c2f"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(18, 26, 22, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
