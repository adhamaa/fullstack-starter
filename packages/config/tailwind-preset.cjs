/**
 * Tailwind v3 preset for `apps/mobile` (NativeWind v4 still requires Tailwind v3).
 * The web app uses Tailwind v4 with the same tokens defined in `tailwind-theme.css`
 * — keep both files in sync.
 *
 * @type {import("tailwindcss").Config}
 */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0f172a",
          elevated: "#111827",
          muted: "#1e293b"
        },
        accent: {
          DEFAULT: "#38bdf8",
          fg: "#0f172a"
        },
        ink: {
          DEFAULT: "#e2e8f0",
          muted: "#cbd5e1",
          subtle: "#94a3b8"
        },
        warn: {
          bg: "#422006",
          fg: "#fed7aa"
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Cascadia Code",
          "monospace"
        ]
      }
    }
  },
  plugins: []
};
