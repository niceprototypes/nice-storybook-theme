import { getToken } from "nice-styles"

/** The token groups this addon owns. Consumers spread them into their one `setTokens` call. */
export const TOKENS = {
  contentMaxWidth: { base: { phone: "100%", tablet: "100%", "laptop+": "720px" } },
} as const

/** The docs content width cap as a CSS value, for styled components and inline styles. */
export const contentMaxWidth: string = getToken(["contentMaxWidth" satisfies keyof typeof TOKENS])
