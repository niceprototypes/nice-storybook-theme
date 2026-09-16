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
  background-color: hsla(212, 10%, 100%, 1);
  font-family: "Avenir Next", -apple-system, BlinkMacSystemFont, "Roboto",
  sans-serif !important;
}

html[data-theme="night"] body {
  background-color: hsla(212, 10%, 15%, 1);
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

.sb-bar,
[data-radix-scroll-area-viewport]::-webkit-scrollbar {
  display: none !important;
}

[data-state="visible"] {
  opacity: 0 !important;
}`
