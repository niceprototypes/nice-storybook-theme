/**
 * The sidebar-tree tagging engine. Storybook renders the sidebar as a flat,
 * depth-first list of `.sidebar-item` rows that name their parent via
 * `data-parent-id`. This derives the tree from that list and writes it back into
 * the DOM so the stylesheet can draw it without any depth-specific rules:
 *
 * - A guide strip — `<span class="nice-tree-guides">` prepended to each row's
 *   `[tabindex]` element, holding one `<span class="nice-tree-guide">` cell per
 *   depth level. The cells ARE the indentation: a row at depth `d` carries `d`
 *   cells, and cell `c` sits directly under the icon of the row's depth-`c`
 *   ancestor. Each cell carries:
 *   - `data-branch` — the neutral connector drawn in that column: `tee` / `elbow`
 *     in the row's own (last) column, depending on whether a sibling follows it;
 *     `line` / `none` in an ancestor's column, depending on whether a sibling
 *     follows that ancestor.
 *   - `data-path` — the highlighted connector on the way to the open story:
 *     `elbow` where the path turns into a row on it, `line` where the path
 *     passes by a row, `none` elsewhere.
 * - `data-selected-group` — on a row: an ancestor on the path to the open story.
 * - `data-has-selected`   — on `.sidebar-container`: whether a story is open.
 *
 * Injecting into Storybook's React-owned rows is safe because React places and
 * removes its own nodes relative to its own siblings and never scans a parent's
 * child list; a row that unmounts takes its strip with it, and the next pass
 * re-creates it. Every write is conditional, so a pass that changes nothing
 * makes no mutations and the observer settles.
 *
 * {@link startSidebarTagging} runs it once and re-runs it on every relevant tree
 * or selection change via a `MutationObserver`.
 */

const GUIDES_CLASS = "nice-tree-guides"
const GUIDE_CLASS = "nice-tree-guide"

type Branch = "none" | "line" | "tee" | "elbow"
type Path = "none" | "line" | "elbow"

function setAttr(el: Element, name: string, value: string): void {
  if (el.getAttribute(name) !== value) el.setAttribute(name, value)
}

function createGuides(): Element {
  const guides = document.createElement("span")
  guides.className = GUIDES_CLASS
  guides.setAttribute("aria-hidden", "true")
  return guides
}

/**
 * Bring a row's guide strip in line with `cells`: create it if missing, keep it
 * first in the row, match its cell count, then stamp each cell.
 */
function syncGuides(item: Element, cells: [Branch, Path][]): void {
  const row = item.querySelector(":scope > [tabindex=\"-1\"]")
  if (!row) return

  const guides = row.querySelector(`:scope > .${GUIDES_CLASS}`) ?? createGuides()
  if (row.firstElementChild !== guides) row.prepend(guides)

  while (guides.children.length > cells.length) guides.lastElementChild?.remove()
  while (guides.children.length < cells.length) {
    const cell = document.createElement("span")
    cell.className = GUIDE_CLASS
    guides.append(cell)
  }

  cells.forEach(([branch, path], c) => {
    const cell = guides.children[c]
    setAttr(cell, "data-branch", branch)
    setAttr(cell, "data-path", path)
  })
}

function tagSidebarPaths(): void {
  const items = [...document.querySelectorAll(".sidebar-item")]
  const byId = new Map(items.map(el => [el.getAttribute("data-item-id"), el]))
  const parentOf = (el: Element) => byId.get(el.getAttribute("data-parent-id")) ?? null

  // Depth: the count of labeled ancestors (a section is 0).
  const depths = items.map((item) => {
    let depth = 0
    for (let cur = parentOf(item); cur; cur = parentOf(cur)) {
      if ((cur.firstElementChild?.textContent ?? "").trim()) depth += 1
    }
    return depth
  })

  // Whether a sibling follows each row. Walking the depth-first list backwards,
  // a row has a later sibling iff a row at its depth was seen since the last row
  // shallower than it — reaching a row forgets everything deeper than it.
  const hasNext: boolean[] = []
  const seen: boolean[] = []
  for (let i = items.length - 1; i >= 0; i--) {
    const d = depths[i]
    hasNext[i] = !!seen[d]
    seen[d] = true
    seen.length = d + 1
  }

  // The open story's id, read from the manager URL rather than the tree.
  // Collapsing a folder removes its rows outright, so on a collapsed branch NO
  // row carries data-selected even though a story is still open.
  const url = new URLSearchParams(window.location.search).get("path") ?? ""
  const selectedId = url.match(/^\/(?:story|docs)\/(.+)$/)?.[1] ?? null

  const container =
    items[0]?.closest(".sidebar-container") ?? document.querySelector(".sidebar-container")
  if (container) setAttr(container, "data-has-selected", String(selectedId !== null))

  // The path to the open story: from its row up through data-parent-id. When its
  // branch is collapsed, start from the deepest rendered ancestor instead — the
  // longest id the story id extends. Longest wins because sibling ids can prefix
  // each other ("text" / "text-area"), and a deeper match is always the real one.
  let tail = items.find(el => el.getAttribute("data-selected") === "true") ?? null
  if (!tail && selectedId) {
    for (const el of items) {
      const id = el.getAttribute("data-item-id") ?? ""
      if (id && selectedId.startsWith(`${id}-`)) {
        if (!tail || id.length > (tail.getAttribute("data-item-id") ?? "").length) tail = el
      }
    }
  }
  const path: number[] = []
  for (let cur = tail; cur; cur = parentOf(cur)) path.unshift(items.indexOf(cur))

  // Walk the list once, keeping each row's ancestor at every depth and the
  // latest path row at or above it. A row between two consecutive path rows is
  // passed by the path in the upper one's column.
  const ancestors: number[] = []
  let k = -1
  items.forEach((item, i) => {
    const d = depths[i]
    ancestors[d] = i
    while (k + 1 < path.length && path[k + 1] <= i) k++

    const onPath = k !== -1 && path[k] === i
    const passedColumn = !onPath && k !== -1 && k < path.length - 1 ? depths[path[k]] : -1

    setAttr(
      item,
      "data-selected-group",
      String(onPath && item.getAttribute("data-selected") !== "true"),
    )

    const cells: [Branch, Path][] = []
    for (let c = 0; c < d; c++) {
      const own = c === d - 1
      const branch: Branch = own
        ? hasNext[i] ? "tee" : "elbow"
        : hasNext[ancestors[c + 1]] ? "line" : "none"
      const pathShape: Path = own && onPath ? "elbow" : c === passedColumn ? "line" : "none"
      cells.push([branch, pathShape])
    }
    syncGuides(item, cells)
  })
}

/**
 * Start tagging the sidebar: run once, then re-run on tree re-renders and
 * selection changes. Watches `childList`/`subtree` plus the `data-selected` and
 * `aria-expanded` attributes. The attribute writes this makes are outside that
 * filter; the strip insertions are inside it, so the pass after an insertion
 * finds nothing to change and the observer settles.
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
