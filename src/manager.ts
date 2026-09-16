import { addons } from "storybook/manager-api"
import { DARK_MODE_EVENT_NAME } from "storybook-dark-mode"
import { applyTheme } from "nice-styles"
import { ADDON_ID } from "./constants"
import { injectSidebarGlyphs } from "./manager/glyphs"
import { startSidebarTagging } from "./manager/tagSidebarPaths"
import { managerSidebarCss } from "./styles/managerSidebarCss"

/**
 * Manager entry. Loaded by Storybook from `nice-storybook-navigation/manager`.
 * Runs on import: restyles the sidebar tree (glyphs + token-driven branch lines
 * + hidden search) and keeps its tokens flipping with the theme. Only the
 * sidebar is configured here — the consumer keeps ownership of the manager theme
 * and branding via their own `addons.setConfig`.
 */

// Collapsible top-level sections (Storybook expands only the selected story's
// ancestors), so the tree reads as folders rather than always-open roots.
addons.setConfig({ sidebar: { showRoots: false } })

// Inject the sidebar stylesheet + glyph masks, then start tagging the tree so
// the CSS/glyphs have their data attributes to read.
const sidebarStyle = document.createElement("style")
sidebarStyle.textContent = managerSidebarCss
document.head.appendChild(sidebarStyle)
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
