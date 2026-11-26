/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#111312",         // primary action / active pill (obsidian)
          "primary-hover": "#232725", // hover/pressed
          secondary: "#525866",       // secondary buttons & actions
          "secondary-hover": "#3B404B",
          "primary-light": "#ECFCCB", // soft lime background
          muted: "#A3E635",           // signature lime accent
          fresh: "#B4F054",           // bright lime accent for dots & highlights
          deep: "#0D0F0E",            // deep obsidian for dark contrast zone
          "dark-slate": "#1A1D1B",    // dark card surface
        },
        surface: {
          bg: "#F7F8FA",              // crisp off-white page background
          card: "#FFFFFF",            // pure white cards, panels, modals
          subtle: "#F1F3F5",          // secondary soft surfaces
          border: "#E6E8EC",          // ultra-subtle borders and dividers
          "border-subtle": "#F0F2F5",
          "green-tint": "rgba(163, 230, 53, 0.14)", // soft lime tint
        },
        text: {
          primary: "#111312",         // headings and main body text
          secondary: "#68707D",       // labels, captions, and helper text
          muted: "#9AA2AF",
          inverted: "#FFFFFF",
          brand: "#4D7C0F",           // readable lime-olive for text on light
        },
        status: {
          success: "#15803D",
          "success-bg": "#ECFCCB",
          warning: "#B45309",
          "warning-bg": "#FEF3C7",
          danger: "#E11D48",
          "danger-bg": "#FFE4E6",
          info: "#0F766E",
          "info-bg": "#CCFBF1",
          purple: "#6D28D9",
          "purple-bg": "#EDE9FE",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        heading: ["Montserrat", "Inter", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        input: "10px",
        button: "9999px",
      },
      boxShadow: {
        lime: "0 2px 14px rgba(98, 216, 78, 0.35)",
        "lime-lg": "0 4px 20px rgba(98, 216, 78, 0.45)",
        card: "0 1px 3px 0 rgba(27, 36, 48, 0.04), 0 1px 2px -1px rgba(27, 36, 48, 0.03)",
        "card-hover": "0 4px 12px 0 rgba(27, 36, 48, 0.06), 0 2px 4px -1px rgba(27, 36, 48, 0.03)",
        elevated: "0 10px 25px -5px rgba(27, 36, 48, 0.08), 0 8px 10px -6px rgba(27, 36, 48, 0.03)",
        dropdown: "0 10px 30px 0 rgba(27, 36, 48, 0.10), 0 4px 6px -2px rgba(27, 36, 48, 0.04)",
        "brand-glow": "0 0 20px 0 rgba(98, 216, 78, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "slide-down": "slideDown 0.25s ease-out",
        "slide-right": "slideRight 0.25s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
