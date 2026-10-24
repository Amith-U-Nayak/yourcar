/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // ── Yourcar design tokens ─────────────────────────────────────────────
      colors: {
        // Primary: deep racing red — bold and sporty
        brand: {
          DEFAULT: "#C62828",
          light: "#EF5350",
          dark: "#8E0000",
        },
        // Neutral: almost-black charcoal for backgrounds
        surface: {
          DEFAULT: "#1A1A2E",
          card: "#16213E",
          muted: "#0F3460",
        },
        // Accent: bright amber — dashboard instruments, CTAs
        accent: {
          DEFAULT: "#FFB300",
          light: "#FFD54F",
        },
      },
      fontFamily: {
        // Primary: Inter for UI text (legible at small sizes)
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        // Display: Rajdhani for headings (sporty, condensed)
        display: ["Rajdhani", "ui-sans-serif", "sans-serif"],
      },
    },
  },
  plugins: [],
};
