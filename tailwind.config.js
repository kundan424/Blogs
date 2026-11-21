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
           MONOCHROME BRAND PALETTE: Pure Black (#161616) & White (#ffffff)
           ===================================================================== */
        teal: "#161616",
        "color-teal": "#161616",
        aqua: "#ffffff",
        "color-aqua": "#ffffff",

        // Mapped control tokens for clean backwards compatibility
        pink: "#161616",
        "color-pink": "#161616",
        blush: "#f0f0f0",
        "pink-strong": "#161616",
        "color-pink-strong": "#161616",
        "active-pink": "#161616",

        /* =====================================================================
           NEUTRAL TOKENS
           ===================================================================== */
        // Primary ink: Primary headings, body and secondary-action text
        ink: "#161616",
        "color-ink": "#161616",

        // Workbench charcoal: Product stages, capability cards, footer
        charcoal: "#212121",
        "color-charcoal": "#212121",
        workbench: "#212121",

        // Secondary charcoal: Quote cards, dark table headers, footer dots
        "raised-dark": "#303030",
        "color-raised-dark": "#303030",

        // Dark separator: Rules in dark comparisons, inactive dark pills
        "edge-dark": "#474747",
        "color-edge-dark": "#474747",

        // Secondary copy: Attributions and inactive chapter labels
        muted: "#616161",
        "color-muted": "#616161",

        // Subtle link gray: Low-emphasis links against dark surfaces
        subtle: "#8f8f8f",
        "color-subtle": "#8f8f8f",

        // Mid-light gray: Secondary buttons, support panels, fine separators
        card: "#d9d9d9",
        "color-card": "#d9d9d9",
        edge: "#d9d9d9",

        // Soft gray: Navigation capsule, quote cards, plan cards and FAQ rows
        soft: "#f0f0f0",
        "color-soft": "#f0f0f0",
        panel: "#f0f0f0",

        // Bright white canvas: Default page canvas and inverse text on charcoal
        canvas: "#ffffff",
        "color-canvas": "#ffffff",
        "bright-white": "#ffffff",
        brightWhite: "#ffffff",

        /* Page-type variants */
        "article-link": "#161616",
        "color-article-link": "#161616",
        widget: "#e6e6e6",
        "color-widget": "#e6e6e6",

        /* =====================================================================
           BACKWARD COMPATIBLE ALIASES (MONOCHROME)
           ===================================================================== */
        "headline-accent": "#161616",
        "label-accent": "#161616",
        "luminous-orchid": "#161616",
        "pale-orchid": "#161616",
        "aubergine": "#212121",
        "porcelain": "#ffffff",
        "soft-lilac": "#f0f0f0",
        "story-gray": "#f0f0f0",
        "story": "#f0f0f0",
        "hairline": "#d9d9d9",
        "dim-gray": "#8f8f8f",
        "dim": "#8f8f8f",
        "muted-plum": "#616161",
        "hover-plum": "#303030",
        "closing-charcoal": "#212121",
        "closing": "#212121",
        "white": "#ffffff",
        "raised-white": "#ffffff",
        "primary": "#161616",
        "on-primary": "#ffffff",
        "accent": "#161616",
        "proof-green": "#161616",
        "navy": "#161616",
        "navy-ink": "#161616",
        "heading-ink": "#161616",
        "near-black": "#161616",
        "near-black-ink": "#161616",
        "body-charcoal": "#161616",
        "body-ink": "#161616",
        "secondary-gray": "#616161",
        "secondary-ink": "#616161",
        "muted-gray": "#8f8f8f",
        "muted-ink": "#8f8f8f",
        "cool-canvas": "#ffffff",
        "milk-white": "#ffffff",
        "milk": "#ffffff",
        "quote-black": "#161616",
        "dot-blue": "#161616",
        "ice": "#f0f0f0",
        "icy-cyan": "#f0f0f0",
        "customer-ember": "#161616",
        "banner-start": "#212121",
        "banner-end": "#303030",
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
        "4xl": "24px",
        panel: "24px",
        card: "24px",
        full: "9999px",
        pill: "9999px",
      },
      fontFamily: {
        sans: [
          '"n8n Baumer Uniwidth"',
          '"Inter"',
          'Helvetica',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        serif: [
          '"n8n Baumer Uniwidth"',
          '"Inter"',
          'Helvetica',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          '"n8n Baumer Mono"',
          '"IBM Plex Mono"',
          'ui-monospace',
          '"SF Mono"',
          'monospace',
        ],
        code: [
          '"IBM Plex Mono"',
          'ui-monospace',
          'monospace',
        ],
      },
      letterSpacing: {
        tightest: "-0.01em",
        display: "-0.01em",
        tight: "-0.01em",
        normal: "0em",
        mono: "0.02em",
        wide: "0.02em",
      },
      maxWidth: {
        wide: "1392px",
        default: "1190px",
        stage: "1190px",
        copy: "800px",
        faq: "788px",
        nav: "1344px",
        editorial: "1190px",
        opening: "1190px",
        support: "800px",
        content: "1190px",
      },
      boxShadow: {
        "shallow-emboss": "3px 3px 6px 0px rgba(0,0,0,0.1) inset, -3px -3px 6px 0px rgba(255,255,255,0.6) inset",
        "card-soft": "none",
        "nav-float": "0px 4px 20px -2px rgba(0, 0, 0, 0.05)",
        "pill": "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
}
