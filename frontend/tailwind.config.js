/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 30px rgba(56, 189, 248, 0.35)",
        panel: "0 30px 80px rgba(8, 10, 18, 0.55)"
      },
      animation: {
        fadeIn: "fadeIn 450ms ease-out",
        pulseGlow: "pulseGlow 2.2s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(56,189,248,0)" },
          "50%": { boxShadow: "0 0 26px rgba(56,189,248,0.5)" }
        }
      }
    }
  },
  plugins: []
};
