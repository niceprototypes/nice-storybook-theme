/**
 * The sidebar-tree tagging engine. Storybook renders the sidebar as a flat,
 * depth-first list of `.sidebar-item` rows that name their parent via
 * `data-parent-id`. This stamps each row with derived attributes the addon's CSS
 * and glyphs read to draw tree lines and selection state:
 *
 * - `data-path-depth`          — count of labeled ancestors (section = 0).
 * - `data-branch-end`          — no same-depth sibling follows this row.
 * - `data-selected-group`      — an ancestor group on the path to the selection.
 * - `data-before-selected`     — rows above the selection within its section.
 * - `data-selected-group-item` — the selection's peers in its immediate group.
 * - `data-has-selected`        — on `.sidebar-container`, whether a story is open.
 * - `data-selected-depth`      — on `.sidebar-container`, the open story's depth.
 *
 * {@link startSidebarTagging} runs it once and re-runs it on every relevant tree
 * or selection change via a `MutationObserver`.
 */

function tagSidebarPaths(): void {
  const items = [...document.querySelectorAll(".sidebar-item")]
  const byId = new Map(items.map(el => [el.getAttribute("data-item-id"), el]))

  const depths = items.map((item) => {
    let depth = 0
    for (
      let cur = byId.get(item.getAttribute("data-parent-id")) ?? null;
      cur;
      cur = byId.get(cur.getAttribute("data-parent-id")) ?? null
    ) {
      const hasLabel = !!(cur.firstElementChild?.textContent ?? "").trim()
      if (hasLabel) depth += 1
    }
    return depth
  })

  items.forEach((item, i) => {
    item.setAttribute("data-path-depth", String(depths[i]))
    // data-branch-end: "true" when the next item in the flat list is at a
    // different depth — or there is no next item — i.e. no same-depth sibling
    // follows this row. An EXPANDED group is never a branch end: its own
    // children render directly beneath it, so the branch continues through it.
    const next = depths[i + 1]
    const expanded =
      item.querySelector(":scope > [tabindex]")?.getAttribute("aria-expanded") === "true"
    item.setAttribute(
      "data-branch-end",
      String(!expanded && (next === undefined || next !== depths[i])),
    )
  })

  // The open story's id, read from the manager URL rather than the tree.
  // Collapsing a folder removes its rows outright, so on a collapsed branch NO
  // row carries data-selected even though a story is still open — the URL keeps
  // holding it either way.
  const path = new URLSearchParams(window.location.search).get("path") ?? ""
  const selectedId = path.match(/^\/(?:story|docs)\/(.+)$/)?.[1] ?? null

  // data-has-selected: on .sidebar-container — "true" whenever a story is open.
  const container =
    items[0]?.closest(".sidebar-container") ?? document.querySelector(".sidebar-container")
  container?.setAttribute("data-has-selected", String(selectedId !== null))

  const selectedIndex = items.findIndex(el => el.getAttribute("data-selected") === "true")

  // data-selected-depth: on .sidebar-container — how deep the open story sits. No
  // row can know this, and the branch line needs it: a row DEEPER than the
  // selection is never on the path to it, so its marker belongs in the outer
  // gutter. Rows cannot tell that case apart on their own, because a depth-1
  // selection makes its "group" the depth-0 section, which sweeps every depth-2
  // row in unrelated folders into data-selected-group-item.
  container?.setAttribute(
    "data-selected-depth",
    selectedIndex === -1 ? "" : String(depths[selectedIndex]),
  )
  const selectedGroupId =
    selectedIndex === -1 ? null : items[selectedIndex].getAttribute("data-parent-id")

  // data-selected-group: "true" on the ancestor GROUPS on the path to the
  // selection. Ancestry is a prefix test on the hierarchical story id, so it
  // holds whether or not the group is open.
  let section: Element | null = null
  items.forEach((item, i) => {
    const id = item.getAttribute("data-item-id")
    const isAncestor =
      !!selectedId &&
      !!id &&
      item.getAttribute("data-nodetype") === "group" &&
      selectedId.startsWith(`${id}-`)
    item.setAttribute("data-selected-group", String(isAncestor))
    if (isAncestor && depths[i] === 0) section = item
  })

  // data-before-selected: "true" only on the rows INSIDE the selection's own
  // top-level section that render above it — an index range in the flat list.
  const sectionIndex = section ? items.indexOf(section) : -1
  items.forEach((item, i) => {
    item.setAttribute(
      "data-before-selected",
      String(sectionIndex !== -1 && i > sectionIndex && i < selectedIndex),
    )
  })

  // data-selected-group-item: "true" on the selection's peers in its immediate
  // group — the contiguous run after the group row until the first row no deeper
  // than the group, excluding the group row and the selection itself.
  const groupEl = selectedGroupId === null ? undefined : byId.get(selectedGroupId)
  const groupIndex = groupEl ? items.indexOf(groupEl) : -1
  let groupEnd = -1
  if (groupIndex !== -1) {
    const groupDepth = depths[groupIndex]
    groupEnd = items.length
    for (let j = selectedIndex + 1; j < items.length; j++) {
      if (depths[j] <= groupDepth) {
        groupEnd = j
        break
      }
    }
  }
  items.forEach((item, i) => {
    item.setAttribute(
      "data-selected-group-item",
      String(groupIndex !== -1 && i > groupIndex && i < groupEnd && i !== selectedIndex),
    )
  })
}

/**
 * Start tagging the sidebar: run once, then re-run on tree re-renders and
 * selection changes. Watches `childList`/`subtree` plus the `data-selected` and
 * `aria-expanded` attributes — the writes this makes are outside that filter, so
 * they don't re-trigger the observer.
 */
export function startSidebarTagging(): void {
  new MutationObserver(tagSidebarPaths).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-selected", "aria-expanded"],
  })
  tagSidebarPaths()
}
