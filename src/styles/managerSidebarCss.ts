/**
 * The sidebar stylesheet, as a string injected into the manager document by the
 * register (rather than a bundled `.css` file, so the addon self-contains and
 * needs no CSS build step). It styles Storybook's sidebar tree off the data
 * attributes {@link startSidebarTagging} stamps and the glyphs
 * {@link injectSidebarGlyphs} masks, using Nice `--np--*` tokens (which the
 * consumer's manager theming provides) so it flips with the `[data-theme]`
 * cascade.
 *
 * NOTE: this depends on Storybook's private sidebar DOM (`.sidebar-item`,
 * `data-nodetype`, `[tabindex] > div:first-child > svg`, etc.), verified against
 * Storybook 10. A Storybook internal change can require updating these
 * selectors.
 */
export const managerSidebarCss = `
/* Tokens */

:root {
  --icon--gap: 0.5em;
  --branch--icon--size: 32px;
  --folder--icon--size: var(--np--icon--size);

  --gutter--1: calc(calc(var(--branch--icon--size) - var(--folder--icon--size)) / -2);

  --gutter--2: calc(var(--gutter--1) + calc(var(--branch--icon--size) / 2) + var(--icon--gap) + calc(var(--folder--icon--size) / 2));
}

/* Containers */

.sidebar-container {
  padding-left: var(--np--gap--large);
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
    padding: var(--np--gap--large) 0;
    margin-right: 0;

    a {
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 0;
    }

    img {
      height: var(--np--size--small);
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

/* Items */

.sidebar-item {
  background-color: transparent !important;

  &[data-nodetype="group"],
  &[data-nodetype="document"] {
    margin-top: 0 !important;
    margin-bottom: 0 !important;

    > [tabindex] {
      height: var(--np--size--small);
      align-items: center;
      font-size: var(--np--font-size--small);
      font-weight: var(--np--font-weight--medium);
      padding: 0;
      gap: var(--icon--gap);
      color: var(--np--color);

      svg {
        width: var(--folder--icon--size);
        height: var(--folder--icon--size);
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

  /* Branch icons */

  &[data-nodetype="group"] > [tabindex] > div:first-child,
  &[data-nodetype="document"] > [tabindex] {
    > div:first-child {
      position: relative;
      width: var(--branch--icon--size);
      height: var(--branch--icon--size);

      > svg {
        width: var(--branch--icon--size);
        height: var(--branch--icon--size);
        background-color: var(--np--border-color);
      }

      &::before,
      &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
      }

      &::before {
        background-color: var(--np--border-color);
        transform: translate(-150%, -50%);
      }
    }
  }

  &[data-nodetype="group"][data-before-selected="true"] > [tabindex] > div:first-child,
  &[data-nodetype="group"][data-selected="true"] > [tabindex] > div:first-child,
  &[data-nodetype="document"][data-before-selected="true"] > [tabindex],
  &[data-nodetype="document"][data-selected="true"] > [tabindex] {
    > div:first-child::after {
      background-color: var(--np--color--link);
      transform: translate(-50%, -50%);
    }
  }

  &[data-path-depth="2"][data-selected="false"][data-selected-group-item="false"][data-nodetype="group"][data-before-selected="true"] > [tabindex] > div:first-child,
  &[data-path-depth="2"][data-selected="false"][data-selected-group-item="false"][data-nodetype="group"][data-selected="true"] > [tabindex] > div:first-child,
  &[data-path-depth="2"][data-selected="false"][data-selected-group-item="false"][data-nodetype="document"][data-before-selected="true"] > [tabindex],
  &[data-path-depth="2"][data-selected="false"][data-selected-group-item="false"][data-nodetype="document"][data-selected="true"] > [tabindex] {
    > div:first-child::after {
      transform: translate(-150%, -50%);
    }
  }

  &[data-nodetype="group"] {
    > [tabindex] > div:first-child {
      gap: var(--icon--gap);
      margin-top: 0;

      > svg {
        background-color: var(--np--color);
      }

      > div:first-child {
        width: auto;
        height: auto;
        transform: none;
      }
    }

    &:hover,
    &:focus {
      background-color: transparent !important;
    }

    &:not([data-parent-id]) {
      > [tabindex] > div:first-child > div:first-child {
        display: none;
      }
    }
  }

  &[data-nodetype="document"] {
    > [tabindex] > div:first-child {
      margin-top: 0;
    }

    > button:last-child {
      display: none;
    }
  }

  &[data-selected="true"],
  &[data-selected-group="true"] {
    > [tabindex] {
      color: var(--np--color--link);
      font-weight: var(--np--font-weight--semibold);

      > div:first-child > svg {
        background-color: var(--np--color--link);
      }
    }
  }

  &[data-path-depth="0"] {
    margin-left: 0;
  }

  &[data-path-depth="1"] {
    margin-left: var(--gutter--1);
  }

  &[data-path-depth="2"] {
    padding-left: var(--gutter--2);
  }
}

.sidebar-container[data-has-selected="true"] {
  .sidebar-item[data-selected="false"][data-selected-group="false"] {
    &[data-nodetype="group"],
    &[data-nodetype="document"] {
      > [tabindex] {
        color: var(--np--color--lighter);

        &:hover {
          color: var(--np--color);
        }
      }
    }

    &[data-nodetype="group"] {
      > [tabindex] {
        > div:first-child > svg {
          background-color: var(--np--color--lighter);
        }

        &:hover {
          > div:first-child > svg {
            background-color: var(--np--color);
          }
        }
      }
    }
  }
}
`
