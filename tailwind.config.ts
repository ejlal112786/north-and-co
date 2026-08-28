import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F4EFE6",
        ink: "#161411",
        muted: "#6F675C",
        line: "#DDD4C5",
        copper: "#9C4A1A",
        sage: "#2C4638",
        sale: "#8A1F1F",
        bone: "#E7DFD2",
        mist: "#F7F4EE",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        brand: "0.22em",
      },
      maxWidth: {
        catalog: "88rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
