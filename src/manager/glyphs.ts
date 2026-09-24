import { getIconEncoded } from "nice-icons/get-icon-encoded"

/**
 * Inject the sidebar glyph stylesheet into the manager document: the Nice
 * `folder-closed` icon masked over each group row's icon slot, and the Nice `x`
 * over the mobile menu's close button. Masks inherit `background-color` from the
 * sidebar stylesheet, so they flip with the `[data-theme]` cascade. The tree's
 * connector lines are not glyphs — the sidebar stylesheet draws them on the guide
 * cells {@link startSidebarTagging} injects.
 */
export function injectSidebarGlyphs(): void {
  const folderIcon = getIconEncoded("folder-closed")
  const closeIcon = getIconEncoded("x")
  const style = document.createElement("style")
  document.head.appendChild(style)
  style.textContent = `
  .sidebar-item {
    /* Folder icons */
    &[data-nodetype="group"] {
      > [tabindex] > div > svg {
        -webkit-mask-image: url("${folderIcon}");
        mask-image: url("${folderIcon}");
      }
    }
  }

  /* The mobile menu's close button ships a circled X. Paint the Nice x over it
     with the same masking: hide the original paths and treat the SVG box as a
     mask filled with the button's own color. */
  button[aria-label="Close menu"] {
    width: var(--np--size);
    height: var(--np--size);

    > svg {
      width: var(--np--icon--size--large);
      height: var(--np--icon--size--large);
      -webkit-mask-image: url("${closeIcon}");
      mask-image: url("${closeIcon}");
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-position: center;
      mask-position: center;
      -webkit-mask-size: contain;
      mask-size: contain;
      background-color: currentColor;

      > * {
        display: none;
      }
    }
  }
`
}
