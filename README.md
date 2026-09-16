# nice-storybook-theme

A Storybook addon for the Nice design system that restyles the **manager
sidebar tree**:

- Folder + branch-connector glyphs and depth/selection-aware tree lines, drawn
  from Nice design tokens (so they flip with the theme).
- Collapsible top-level sections and a hidden search.
- A `tagSidebarPaths` engine that stamps derived `data-*` attributes on the tree
  (depth, branch ends, selection ancestry) for the stylesheet to read.

It touches only the sidebar; the consumer keeps ownership of the manager theme
and branding.

## Install

```bash
npm install -D nice-storybook-theme
```

Requires (peers): `storybook` ≥ 10 and `storybook-dark-mode` ≥ 5. Renders with
Nice tokens (`nice-styles`) and the Nice folder icon (`nice-icons`).

## Wire it up

`.storybook/main.ts`:

```ts
const config = {
  addons: [
    "storybook-dark-mode",
    "nice-storybook-theme", // loads its manager entry
  ],
}
export default config
```

The consumer's manager must provide the Nice `--np--*` token variables (e.g. via
the Nice manager theming) for the sidebar to pick up its colors.

## Caveat

The sidebar styling depends on Storybook's **private** sidebar DOM
(`.sidebar-item`, `data-nodetype`, `[tabindex] > div:first-child > svg`, …),
verified against **Storybook 10**. A Storybook internal change can require
updating the selectors in `src/styles/managerSidebarCss.ts` and
`src/manager/glyphs.ts`.

## License

MIT
