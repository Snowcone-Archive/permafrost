import type { Config } from "tailwindcss";

const config: Config = {
  plugins: [require("tailwindcss-safe-area")],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/debug/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "snowflake-fg-danger": "#ff4f4f",
        "snowflake-fg-warning": "#ffbf42",
        "snowflake-fg-success": "#20fea1",
        "snowflake-fg-info": "#207efe",

        "snowflake-bg-danger": "#521111",
        "snowflake-bg-warning": "#6b450c",
        "snowflake-bg-success": "#0c6b43",
        "snowflake-bg-info": "#0c346b",

        "snowflake-fg-dim": "#c8cbea",
        "snowflake-bg-dim": "#2f314b",

        "snowflake-fg-light": "#1e202f",
        "snowflake-bg-light": "#f7f7fa",

        "snowflake-fg-dark": "#f7f7fa",
        "snowflake-bg-dark": "#232642",

        "snowflake-gray-1": "#898dae",
        "snowflake-gray-2": "#2d2f43",
        "snowflake-gray-3": "#2e314c",
        "snowflake-gray-4": "#363953",
      },
    },
  },
};
export default config;
