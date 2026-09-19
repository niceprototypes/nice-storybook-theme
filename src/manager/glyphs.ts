import { getIconEncoded } from "nice-icons/get-icon-encoded"

/**
 * Branch-connector glyphs used to draw the sidebar tree lines, as base64 data
 * URIs applied via `mask-image` so they inherit `background-color` from the CSS
 * (and thus flip with the `[data-theme]` cascade). Three shapes:
 * - `outer`  — a vertical line (a continuing branch that passes through a row).
 * - `middle` — a vertical + horizontal tee (a row with a sibling below it).
 * - `last`   — an elbow (the final row in a branch run).
 */
const middleBranchIcon =
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMzAuNi4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogMi4xLjQgQnVpbGQgMTA5KSAgLS0+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5zdDAsIC5zdDEgewogICAgICAgIGZpbGw6IG5vbmU7CiAgICAgICAgc3Ryb2tlOiAjMDAwOwogICAgICAgIHN0cm9rZS1taXRlcmxpbWl0OiAxMDsKICAgICAgICBzdHJva2Utd2lkdGg6IDEuNXB4OwogICAgICB9CgogICAgICAuc3QxIHsKICAgICAgICBzdHJva2UtbGluZWNhcDogcm91bmQ7CiAgICAgIH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIDxsaW5lIGNsYXNzPSJzdDAiIHgxPSIxNiIgeTE9IjMyIiB4Mj0iMTYiLz4KICA8bGluZSBjbGFzcz0ic3QxIiB4MT0iMTYiIHkxPSIxNiIgeDI9IjMxIiB5Mj0iMTYiLz4KPC9zdmc+"
const lastBranchIcon =
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMzAuNi4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogMi4xLjQgQnVpbGQgMTA5KSAgLS0+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5zdDAgewogICAgICAgIGZpbGw6IG5vbmU7CiAgICAgICAgc3Ryb2tlOiAjMDAwOwogICAgICAgIHN0cm9rZS1saW5lY2FwOiByb3VuZDsKICAgICAgICBzdHJva2UtbWl0ZXJsaW1pdDogMTA7CiAgICAgICAgc3Ryb2tlLXdpZHRoOiAxLjVweDsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPHBvbHlsaW5lIGNsYXNzPSJzdDAiIHBvaW50cz0iMTYgMCAxNiAxNiAzMSAxNiIvPgo8L3N2Zz4="
const outerBranchIcon =
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMzAuNi4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogMi4xLjQgQnVpbGQgMTA5KSAgLS0+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5zdDAgewogICAgICAgIGZpbGw6IG5vbmU7CiAgICAgICAgc3Ryb2tlOiAjMDAwOwogICAgICAgIHN0cm9rZS1taXRlcmxpbWl0OiAxMDsKICAgICAgICBzdHJva2Utd2lkdGg6IDEuNXB4OwogICAgICB9CiAgICA8L3N0eWxlPgogIDwvZGVmcz4KICA8bGluZSBjbGFzcz0ic3QwIiB4MT0iMTYiIHgyPSIxNiIgeTI9IjMyIi8+Cjwvc3ZnPg=="

/**
 * Inject the sidebar glyph stylesheet into the manager document. Maps each
 * `.sidebar-item`'s icon slot to a branch/folder mask depending on its
 * `data-nodetype`, `data-branch-end`, `data-selected`, and `data-path-depth`
 * attributes (which {@link startSidebarTagging} stamps). Idempotent per document
 * load. Folder rows use the Nice `folder-closed` icon; branch rows use the
 * connector glyphs above.
 */
export function injectSidebarGlyphs(): void {
  const folderIcon = getIconEncoded("folder-closed")
  const closeIcon = getIconEncoded("x")
  const style = document.createElement("style")
  document.head.appendChild(style)
  style.textContent = `
  .sidebar-item {
    /* Branch icons */
    &[data-nodetype="group"] > [tabindex] > div:first-child,
    &[data-nodetype="document"] > [tabindex] {
      > div:first-child {
        &::after {
          -webkit-mask-image: url("${outerBranchIcon}");
          mask-image: url("${outerBranchIcon}");
        }

        > svg {
          -webkit-mask-image: url("${middleBranchIcon}");
          mask-image: url("${middleBranchIcon}");
        }
      }
    }

    &[data-branch-end="true"] {
      &[data-nodetype="group"] > [tabindex] > div:first-child,
      &[data-nodetype="document"] > [tabindex] {
        > div:first-child {
          > svg {
            -webkit-mask-image: url("${lastBranchIcon}");
            mask-image: url("${lastBranchIcon}");
          }
        }
      }
    }

    &[data-selected="true"],
    &[data-selected-group="true"] {
      /* Branch icons */
      &[data-nodetype="group"] > [tabindex] > div:first-child,
      &[data-nodetype="document"] > [tabindex] {
        > div:first-child {
          &::after {
            -webkit-mask-image: url("${lastBranchIcon}");
            mask-image: url("${lastBranchIcon}");
          }
        }
      }
    }

    &[data-path-depth="2"] {
      > [tabindex] > div:first-child::before {
        -webkit-mask-image: url("${outerBranchIcon}");
        mask-image: url("${outerBranchIcon}");
      }
    }

    /* Folder icons */
    &[data-nodetype="group"] {
      > [tabindex] > div:first-child > svg {
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
