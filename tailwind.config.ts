import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        "#050508": "#050508",
        "#f5f5f0": "#f5f5f0",
        "#13131a": "#13131a",
        "#0a0a10": "#0a0a10",
        "#e8192c": "#e8192c",
        "#ff2d40": "#ff2d40",
        "#3dd17f": "#3dd17f",
        "#ffc72c": "#ffc72c",
      },
    },
  },
  content: ["./src/**/*.{tsx,ts,jsx,js}"],
  safelist: [
    "bg-[#050508]",
    "text-[#f5f5f0]",
    "bg-[#13131a]",
    "bg-[#0a0a10]",
    "text-[#e8192c]",
    "border-[#e8192c]",
    "bg-[#e8192c]",
    "bg-[#ff2d40]",
    "bg-[#3dd17f]",
    "bg-[#ffc72c]",
  ],
};

export default config;
