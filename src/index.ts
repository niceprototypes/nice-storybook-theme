/**
 * Public API. The addon's behavior lives in the manager entry (sidebar), which
 * Storybook loads from the `./manager` subpath when the package is listed in
 * `addons`. Its tokens are registered by the consumer: spread `TOKENS` into the
 * app's one `setTokens` call.
 */
export { ADDON_ID } from "./constants"
export { contentMaxWidth, TOKENS } from "./tokens"
