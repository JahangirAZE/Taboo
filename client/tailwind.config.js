/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0E27",
        dusk: "#141A3D",
        violet: {
          DEFAULT: "#6D5DFC",
          soft: "#9C8CFF",
        },
        teal: {
          DEFAULT: "#22D3C9",
          soft: "#6FE9E1",
        },
        coral: "#FF5D73",
        gold: "#FFC857",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 24px rgba(109, 93, 252, 0.45)",
      },
      keyframes: {
        pulseRing: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.55 },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 2s ease-in-out infinite",
        floatSlow: "floatSlow 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
