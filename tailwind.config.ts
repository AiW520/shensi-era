import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f5f5f7",
        ink: "#08080a",
        mist: "#86868b",
      },
    },
  },
  plugins: [],
};

export default config;
