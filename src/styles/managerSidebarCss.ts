/**
 * The sidebar stylesheet, as a string injected into the manager document by the
 * register (rather than a bundled `.css` file, so the addon self-contains and
 * needs no CSS build step). It styles Storybook's sidebar tree off the guide
 * cells and data attributes {@link startSidebarTagging} writes and the icons
 * {@link injectSidebarGlyphs} masks, using Nice tokens (which the consumer's
 * manager theming provides) so it flips with the `[data-theme]` cascade.
 *
 * The tree is drawn on the guide cells, one per depth level, so no rule here is
 * depth-specific: indentation is the cells' width, and each cell draws its own
 * connector from its `data-branch` / `data-path` shape.
 *
 * NOTE: this depends on Storybook's private sidebar DOM (`.sidebar-item`,
 * `data-nodetype`, `[tabindex] > div > svg`, etc.), verified against Storybook
 * 10. A Storybook internal change can require updating these selectors.
 */
import { getBreakpoint, getToken } from "nice-styles"

/* Tree geometry. A folder icon sits at the start of its row's content; its
   children's connectors hang from the icon's centre line, run an arm of `arm`
   towards the child, and stop `iconGap` short of the child's icon or label. */
const icon = getToken("icon.size")
const iconGap = "0.5em"
const arm = getToken("gap")
const stroke = getToken("borderWidth")
const column = `calc(${icon} / 2 + ${arm} + ${iconGap})`
const axis = `calc(${icon} / 2 - ${stroke} / 2)`

const neutral = getToken("borderColor")
const highlight = getToken("color:link")

/* Connector pieces, as background layers in a given colour. */
const fullLine = (color: string) =>
  `linear-gradient(${color}, ${color}) ${axis} 0 / ${stroke} 100% no-repeat`
const upperLine = (color: string) =>
  `linear-gradient(${color}, ${color}) ${axis} 0 / ${stroke} calc(50% + ${stroke} / 2) no-repeat`
const armLine = (color: string) =>
  `linear-gradient(${color}, ${color}) ${axis} 50% / calc(${arm} + ${stroke} / 2) ${stroke} no-repeat`

export const managerSidebarCss = `
/* Containers */

.sidebar-container {
  padding: 0 ${getToken("gap:large")};
  [data-radix-scroll-area-content] > div {
    gap: 0;
    padding: 0;
  }
}

/* Header */

.sidebar-header {
  padding: 0 !important;

  > div:nth-child(2) {
    flex-direction: column;
    align-items: flex-start;
    padding: ${getToken("gap:large")} 0;
    margin-right: 0;

    a {
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 0;
    }

    img {
      height: ${getToken("size:small")};
    }
  }

  [aria-label="Settings"] {
    display: none;
  }
}

/* Search — the field is hidden here and its shortcut is unbound in the register,
   so there is no way left to reach it. Storybook 10 has no config flag for this;
   the only stable hook on the search bar is its role, the surrounding classes
   being emotion-generated. */

.sidebar-container [role="search"] {
  display: none;
}

/* Bottom — drop the shadow Storybook casts over the tree from the bottom bar. */

#sidebar-bottom-wrapper > div > div {
  box-shadow: none;
}

/* Items */

.sidebar-item {
  background-color: transparent !important;

  &[data-nodetype="group"],
  &[data-nodetype="document"] {
    margin-top: 0 !important;
    margin-bottom: 0 !important;

    > [tabindex] {
      height: ${getToken("size:small")};
      align-items: center;
      font-weight: ${getToken("fontWeight:medium")};
      padding: 0;
      gap: ${iconGap};
      color: ${getToken("color")};
    }
  }

  &[data-nodetype="group"] {
    &:hover,
    &:focus {
      background-color: transparent !important;
    }

    /* The icon slot holds the folder only — the collapse chevron is dropped. */
    > [tabindex] > div {
      gap: 0;
      margin-top: 0;

      > div {
        display: none;
      }

      > svg {
        width: ${icon};
        height: ${icon};
        background-color: ${getToken("color")};
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-position: center;
        mask-position: center;
        -webkit-mask-size: contain;
        mask-size: contain;

        * {
          display: none;
        }
      }
    }
  }

  /* A document is a leaf: its connector leads straight to the label. */
  &[data-nodetype="document"] {
    > [tabindex] > div {
      display: none;
    }

    > button:last-child {
      display: none;
    }
  }

  &[data-selected="true"],
  &[data-selected-group="true"] {
    > [tabindex] {
      color: ${highlight};
      font-weight: ${getToken("fontWeight:semibold")};

      > div > svg {
        background-color: ${highlight};
      }
    }
  }
}

/* Tree guides — one cell per depth level. The strip's negative end margin cancels
   the row's flex gap, so a row's icon or label starts exactly at the end of its
   last cell and a depth-0 row (no cells) starts flush. */

.nice-tree-guides {
  display: flex;
  flex: none;
  align-self: stretch;
  margin-inline-end: calc(-1 * ${iconGap});
  pointer-events: none;
}

.nice-tree-guide {
  position: relative;
  flex: none;
  width: ${column};

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 0;
  }

  &[data-branch="line"]::before { background: ${fullLine(neutral)}; }
  &[data-branch="tee"]::before { background: ${armLine(neutral)}, ${fullLine(neutral)}; }
  &[data-branch="elbow"]::before { background: ${armLine(neutral)}, ${upperLine(neutral)}; }

  &[data-path="line"]::after { background: ${fullLine(highlight)}; }
  &[data-path="elbow"]::after { background: ${armLine(highlight)}, ${upperLine(highlight)}; }
}

/* With a story open, rows off its path recede until hovered. */

.sidebar-container[data-has-selected="true"] {
  .sidebar-item[data-selected="false"][data-selected-group="false"] {
    &[data-nodetype="group"],
    &[data-nodetype="document"] {
      > [tabindex] {
        color: ${getToken("color:lighter")};

        &:hover {
          color: ${getToken("color")};
        }
      }
    }

    &[data-nodetype="group"] {
      > [tabindex] {
        > div > svg {
          background-color: ${getToken("color:lighter")};
        }

        &:hover {
          > div > svg {
            background-color: ${getToken("color")};
          }
        }
      }
    }
  }
}

/* Breakpoint-dependent rules. The floors are interpolated from getBreakpoint so
   they track the token source rather than being duplicated as literals here — a
   CSS variable cannot drive a media condition. */
${getBreakpoint("laptop+")} {
  .sidebar-container {
    padding-right: 0;
  }

  /* The label drops to \`small\` only where there is room; below laptop it keeps
     the base size, which reads better on a narrow menu. */
  .sidebar-item[data-nodetype="group"] > [tabindex],
  .sidebar-item[data-nodetype="document"] > [tabindex] {
    font-size: ${getToken("fontSize:small")};
  }
}
`
