/**
 * Manager background reset — clears Storybook default backgrounds on the sidebar, main, and preview iframe so the manager background shows through.
 *
 * Injected into the manager document by the register (as a string, so the addon
 * self-contains and needs no CSS build step). Uses Nice `--np--*` tokens and
 * `[data-theme]`, which the consumer manager provides.
 */
export const managerBackgroundCss = `
/* Background color reset */
.sidebar-container,
main[role="main"],
main[role="main"] > div:has([role="progressbar"]),
main[role="main"] > div > div:has([role="progressbar"]),
#storybook-preview-iframe {
  background: none !important;
  background-color: transparent !important;
}`
