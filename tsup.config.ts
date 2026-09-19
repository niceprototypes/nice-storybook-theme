import { defineConfig } from "tsup"

/**
 * Two entry points:
 * - `index`   — the public API (just the addon id today).
 * - `manager` — the manager-side register: sidebar tree restyle (glyphs +
 *   token-driven branch lines + hidden search) and the `tagSidebarPaths` engine.
 *   Loaded by Storybook from `nice-storybook-navigation/manager`.
 *
 * The storybook runtime and the Nice packages (kept as singletons by the
 * consumer) are externalized so the addon never bundles a second copy.
 */
export default defineConfig({
  entry: ["src/index.ts", "src/manager.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  // Subpath-aware: the manager entry imports storybook/manager-api, which a bare
  // "storybook" external does not match — bundling it drags in
  // storybook/internal/* and breaks the host's global-externals mapping.
  external: [/^storybook(\/|$)/, "storybook-dark-mode", /^@storybook\//, /^nice-/],
})
