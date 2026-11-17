/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* =====================================================================
           BRAND PALETTE (#2F6BFF, #fffffc, #beb7a4)
           ===================================================================== */
        // Default headings, main buttons, brand badges: ELECTRIC BLUE #2F6BFF
        "navy": "#2F6BFF",
        "navy-ink": "#2F6BFF",
        "electric-blue": "#2F6BFF",

        // Left & right sides of the announcement gradient
        "announcement-indigo": "#2F6BFF",
        "banner-start": "#2F6BFF",
        "announcement-periwinkle": "#2456cc",
        "banner-end": "#2456cc",

        // Bounded infrastructure chapters
        "deep-teal": "#090d1f",

        // Darker blue controls and closing headings
        "launch-midnight": "#060919",

        /* =====================================================================
           NEUTRAL PALETTE (#fffffc Canvas & Surfaces, #beb7a4 Borders & Stone)
           ===================================================================== */
        // Compact customer quotations
        "quote-black": "#000000",

        // Navigation and product-detail headings
        "near-black": "#12161e",
        "near-black-ink": "#12161e",
        "heading-ink": "#12161e",

        // Secondary button labels & controls
        "control-charcoal": "#232730",
        "control-ink": "#232730",

        // Longer explanations and catalog titles
        "body-charcoal": "#3b3e47",
        "body-ink": "#3b3e47",

        // Small descriptive copy and subtle control edges
        "secondary-gray": "#575a64",
        "secondary-ink": "#575a64",

        // Captions, directory links and subdued supporting text
        "muted-gray": "#7c7f88",
        "muted-ink": "#7c7f88",

        // Borders, hairlines and dividing rules: #beb7a4 (sand/taupe)
        "warm-hairline": "#beb7a4",
        "cool-hairline": "#beb7a4",
        "edge": "#beb7a4",
        "filter-edge": "#beb7a4",

        // Stone / Taupe neutral
        "warm-stone": "#beb7a4",
        "sand": "#beb7a4",
        "taupe": "#beb7a4",

        // Canvas & Surfaces: #fffffc (ivory / off-white)
        "closing-gray": "#faf9f5",
        "panel": "#faf9f5",
        "warm-milk": "#fffffc",
        "cool-canvas": "#fffffc",
        "canvas": "#fffffc",
        "product-frost": "#fffffc",
        "milk-white": "#fffffc",
        "milk": "#fffffc",
        "ivory": "#fffffc",

        /* =====================================================================
           ACCENT TOKENS (Unified with #2F6BFF and #beb7a4)
           ===================================================================== */
        "customer-ember": "#2F6BFF",
        "ember": "#2F6BFF",
        "proof-green": "#2F6BFF",
        "dot-blue": "#2F6BFF",
        "editorial-blue": "#2F6BFF",
        "focus-blue": "#2F6BFF",
        "icy-cyan": "#2F6BFF",
        "ice": "#2F6BFF",

        /* =====================================================================
           SEMANTIC & SYSTEM SURFACE ALIASES (BACKWARDS COMPATIBLE)
           ===================================================================== */
        "primary": "#2F6BFF",
        "on-primary": "#fffffc",
        "secondary": "#232730",
        "accent": "#2F6BFF",
        "accent-orange": "#2F6BFF",
        "ink": "#2F6BFF",
        "stone": "#beb7a4",
        "strong": "#12161e",
        "muted": "#7c7f88",
        "smoke": "#575a64",
        "ash": "#7c7f88",
        "eggshell": "#fffffc",
        "warm-taupe": "#beb7a4",
        "graphite": "#3b3e47",
        "gallery": "#faf9f5",
        "footer": "#faf9f5",
        "footer-heading": "#2F6BFF",
        "footer-text": "#7c7f88",
        "cool-card": "#fffffc",
        "preview": "#fffffc",
        "surface": "#fffffc",
        "on-surface": "#2F6BFF",
        "surface-container-lowest": "#fffffc",
        "surface-container-low": "#faf9f5",
        "surface-container": "#faf9f5",
        "surface-container-high": "#beb7a4",
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "4px",
        md: "8px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        full: "9999px",
      },
      fontFamily: {
        sans: [
          '"SuisseIntl"',
          '"Inter"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"SuisseIntlMono"',
          '"IBM Plex Mono"',
          'ui-monospace',
          'Menlo',
          'Consolas',
          'monospace',
        ],
        code: [
          '"SFMono"',
          '"Roboto Mono"',
          '"IBM Plex Mono"',
          'monospace',
        ],
      },
      letterSpacing: {
        tightest: "-0.03em",
        tighter: "-0.02em",
        tight: "-0.01em",
        normal: "0em",
        technical: "0.1em",
      },
      maxWidth: {
        column: "1112px",
        marketing: "1112px",
        content: "1072px",
        nav: "1112px",
        footer: "1112px",
      },
      boxShadow: {
        "catalog-edge": "0px 0px 0px 1px rgba(190, 183, 164, 0.45), 0px 1px 3px 0px rgba(0,0,0,0.04)",
        "floating-glass": "24px 48px 64px 0px rgba(30,30,44,0.1), 0px 0px 0px 1px #fffffc inset",
        "closing-card": "0px 1px 2px 0px rgba(0,0,0,0.06)",
        "primary-btn": "0px 0px 0px 1px #2F6BFF, 0px 2px 4px 0px rgba(47,107,255,0.28), 0px 1px 2px 0px rgba(47,107,255,0.2)",
        "secondary-btn": "0px 0px 0px 1px #beb7a4",
      },
    },
  },
  plugins: [],
}
