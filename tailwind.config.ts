import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#f4f4f1",
          dark: "#70483c",
          medium: "#b4a18d",
        },
        /** Réservé à la sélection du menu latéral dashboard (voir app/globals.css). */
        "sidebar-nav-active": "#d4c4b8",
        "sidebar-nav-hover": "#ebe4de",
      },
    },
  },
};

export default config;
