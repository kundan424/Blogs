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
           COLUMN BRAND TOKENS
           ===================================================================== */
        // Default headings, main buttons and directory labels; supporting copy can use this ink at 60% opacity
        "navy": "#111a4a",
        "navy-ink": "#111a4a",

        // Left side of the narrow announcement gradient
        "announcement-indigo": "#3e5199",
        "banner-start": "#3e5199",

        // Right side of the announcement gradient
        "announcement-periwinkle": "#5568ad",
        "banner-end": "#5568ad",

        // Bounded infrastructure chapters
        "deep-teal": "#011821",

        // Darker blue controls and closing headings in the warm theme (editorial product launches)
        "launch-midnight": "#080b32",

        /* =====================================================================
           COLUMN NEUTRAL TOKENS
           ===================================================================== */
        // Compact customer quotations; alpha versions supply fine shadows
        "quote-black": "#000000",

        // Navigation and product-detail headings
        "near-black": "#12161e",
        "near-black-ink": "#12161e",
        "heading-ink": "#12161e",

        // Secondary button labels
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

        // Warm panel's outline (editorial product launches)
        "warm-hairline": "#e7e4e0",

        // Section rules and the closing panel's 1px outline
        "cool-hairline": "#e3e4e8",
        "edge": "#e3e4e8",

        // Warm launch theme canvas (editorial product launches)
        "warm-stone": "#eceae7",

        // Closing panel and technical response backing
        "closing-gray": "#eeeff2",
        "panel": "#eeeff2",

        // Warm launch closing panel (editorial product launches)
        "warm-milk": "#f5f3f1",

        // Default marketing canvas
        "cool-canvas": "#f6f6f8",
        "canvas": "#f6f6f8",

        // Slightly cooler canvas for product-detail pages
        "product-frost": "#f6f7fa",

        // White surfaces, reversed text and glass edges
        "milk-white": "#ffffff",
        "milk": "#ffffff",

        /* =====================================================================
           COLUMN ACCENT TOKENS
           ===================================================================== */
        // Active customer tab and compact proof objects; not the default conversion color
        "customer-ember": "#ec652b",
        "ember": "#ec652b",

        // Metrics, proof labels and small graph endpoints
        "proof-green": "#167e6c",

        // Closing matrix icons, with inactive dots at 20% opacity
        "dot-blue": "#4575cd",

        // Emphasized narrative statements (company and culture narratives)
        "editorial-blue": "#1b2d70",

        // 2px navigation focus ring and editorial quote rules
        "focus-blue": "#a2c1ed",

        // Headlines on deep teal
        "icy-cyan": "#c1e8ef",
        "ice": "#c1e8ef",

        /* =====================================================================
           SEMANTIC & SYSTEM SURFACE ALIASES (BACKWARDS COMPATIBLE)
           ===================================================================== */
        "primary": "#111a4a",
        "on-primary": "#ffffff",
        "secondary": "#232730",
        "accent": "#111a4a",
        "accent-orange": "#ec652b",
        "ink": "#111a4a",
        "stone": "#e3e4e8",
        "strong": "#12161e",
        "muted": "#7c7f88",
        "smoke": "#575a64",
        "ash": "#7c7f88",
        "eggshell": "#f6f6f8",
        "warm-taupe": "#ffffff",
        "graphite": "#3b3e47",
        "gallery": "#eeeff2",
        "footer": "#eeeff2",
        "footer-heading": "#111a4a",
        "footer-text": "#7c7f88",
        "cool-card": "#ffffff",
        "filter-edge": "#e3e4e8",
        "preview": "#ffffff",
        "surface": "#ffffff",
        "on-surface": "#111a4a",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f6f8",
        "surface-container": "#eeeff2",
        "surface-container-high": "#e3e4e8",
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
        "catalog-edge": "0px 0px 0px 1px rgba(0,0,0,0.05), 0px 1px 3px 0px rgba(0,0,0,0.05)",
        "floating-glass": "24px 48px 64px 0px rgba(30,30,44,0.15), 0px 0px 0px 1px #ffffff inset",
        "closing-card": "0px 1px 2px 0px rgba(0,0,0,0.1)",
        "primary-btn": "0px 0px 0px 1px #111a4a, 0px 2px 4px 0px rgba(0,0,0,0.25), 0px 1px 2px 0px rgba(0,0,0,0.25)",
        "secondary-btn": "0px 0px 0px 1px rgba(87,90,100,0.12)",
      },
    },
  },
  plugins: [],
}
