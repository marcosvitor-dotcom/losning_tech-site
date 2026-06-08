import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F2A33",
          deep: "#0B1E26",
        },
        brand: {
          blue: "#1B4D5C",
          "blue-mid": "#2E6E7E",
          royal: "#2B4B7E",
          teal: "#1E7F76",
          "teal-bright": "#2DB3A6",
          "teal-pale": "#EAF6F4",
          "teal-soft": "#C8E6E1",
          accent: "#E8A0B0",
          "accent-soft": "#F5D5E0",
          ink: "#14252B",
          muted: "#5E7780",
          "off-white": "#F6FAFA",
          border: "#D6ECEA",
        },
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15, 42, 51, 0.08)",
        card: "0 12px 40px rgba(30, 127, 118, 0.10)",
        "card-navy": "0 18px 50px rgba(11, 30, 38, 0.30)",
      },
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(135deg, #0B1E26 0%, #0F2A33 45%, #14323D 100%)",
        "gradient-brand":
          "linear-gradient(135deg, #0F2A33 0%, #1E7F76 100%)",
        "gradient-teal":
          "linear-gradient(135deg, #1E7F76 0%, #2E6E7E 100%)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "lt-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "lt-pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        "lt-float": "lt-float 5s ease-in-out infinite",
        "lt-pulse-soft": "lt-pulse-soft 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
