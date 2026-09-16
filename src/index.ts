/**
 * Public API. The addon's behavior lives in the manager entry, which Storybook
 * loads from the `./manager` subpath when the package is listed in `addons`.
 * This entry exposes only the addon id for consumers that need to reference it.
 */
export { ADDON_ID } from "./constants"
