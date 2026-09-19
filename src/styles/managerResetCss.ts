/**
 * Manager chrome reset — body font/background per theme, day-mode font smoothing, hidden sidebar scrollbar, removed default borders.
 *
 * Injected into the manager document by the register (as a string, so the addon
 * self-contains and needs no CSS build step). Uses Nice `--np--*` tokens and
 * `[data-theme]`, which the consumer manager provides.
 */
export const managerResetCss = `
/* Storybook sets the manager <body> font from a static global (its default
   "Nunito Sans" stack), not from the theme fontBase — override it here. */
html[data-theme] body {
  background-color: var(--np--background-color);
  font-family: "Avenir Next", -apple-system, BlinkMacSystemFont, "Roboto",
  sans-serif !important;
}

/* The night value is reached through the token's own theme primitive rather
   than a second literal, so a consumer retheming the tokens retheme this too. */
html[data-theme="night"] body {
  background-color: var(--np--background-color--night);
}

/* Day mode only: turn off Storybook's default font smoothing so light-theme
   text renders at full weight. Night keeps Storybook's \`antialiased\` default.
   storybook-dark-mode toggles \`light\`/\`dark\` on the manager <body>
   (classTarget: 'body'), so key off \`light\` to track the actual theme toggle.
   Storybook applies \`-webkit-font-smoothing\` per element via its theme reset,
   so \`*\` + \`!important\` is needed to override. */
body.light,
body.light * {
  -webkit-font-smoothing: auto !important;
  -moz-osx-font-smoothing: auto !important;
}

#root > div > div:first-child {
  border-right: none;
}

/* Hide the sidebar scrollbar (Radix scroll-area viewport) while keeping it
   scrollable — cross-browser: Firefox, legacy Edge/IE, and WebKit. */
[data-radix-scroll-area-viewport] {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

[data-radix-scroll-area-viewport]::-webkit-scrollbar {
  display: none !important;
}

/* The Radix scrollbar track fades in on scroll; keep it invisible. Scoped to the
   sidebar's own scroll area — a bare [data-state="visible"] would reach every
   Radix component any other addon renders. */
.sidebar-container [data-radix-scroll-area-scrollbar][data-state="visible"] {
  opacity: 0 !important;
}

/* Storybook's mobile bar duplicates chrome this addon restyles. Hidden last and
   on its own, rather than folded into the scrollbar rule above, so a consumer
   can see it is a separate decision and override it. */
.sb-bar {
  display: none !important;
}`
