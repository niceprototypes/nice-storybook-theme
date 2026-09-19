import { addons } from "storybook/manager-api"
import { DARK_MODE_EVENT_NAME } from "storybook-dark-mode"
import { applyTheme } from "nice-styles"
import { ADDON_ID } from "./constants"
import { injectSidebarGlyphs } from "./manager/glyphs"
import { startSidebarTagging } from "./manager/tagSidebarPaths"
import { managerResetCss } from "./styles/managerResetCss"
import { managerBackgroundCss } from "./styles/managerBackgroundCss"
import { managerSidebarCss } from "./styles/managerSidebarCss"

/**
 * Manager entry. Loaded by Storybook from `nice-storybook-theme/manager`.
 * Runs on import: restyles the sidebar tree (glyphs + token-driven branch lines
 * + hidden search) and keeps its tokens flipping with the theme. Only the
 * sidebar is configured here — the consumer keeps ownership of the manager theme
 * and branding via their own `addons.setConfig`.
 *
 * The tree is designed for collapsible sections — `sidebar: { showRoots: false }`
 * — but that is the consumer's call, not this addon's: calling `setConfig` here
 * would race the consumer's own call and silently win or lose depending on load
 * order. Set it yourself alongside your theme.
 */

// Inject the manager chrome stylesheet (reset → background → sidebar, in cascade
// order) + the glyph masks, then start tagging the tree so the CSS/glyphs have
// their data attributes to read.
const chromeStyle = document.createElement("style")
chromeStyle.textContent = `${managerResetCss}\n${managerBackgroundCss}\n${managerSidebarCss}`
document.head.appendChild(chromeStyle)
injectSidebarGlyphs()
startSidebarTagging()

// Mirror storybook-dark-mode into <html data-theme="night|day"> so the sidebar's
// nice tokens flip on toggle (nice-styles keys theming on [data-theme]).
const syncTheme = (isDark: boolean) => applyTheme(isDark ? "night" : "day")
addons.register(`${ADDON_ID}/theme-sync`, () => {
  addons.getChannel().on(DARK_MODE_EVENT_NAME, syncTheme)
})

// Unbind the sidebar search shortcut. The field is hidden in the stylesheet;
// cmd/ctrl-K would otherwise still leave fullscreen and force-show the sidebar
// before focusing a hidden input. An empty key list never matches.
addons.register(`${ADDON_ID}/disable-search`, (api) => {
  api.setShortcut("search", [])
})
