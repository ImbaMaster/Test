# Findings: what was proven, what was not

All evidence below comes from one working session where an AI drove a Figma test file through
Figma's MCP server (`use_figma` runs Plugin API JavaScript in the file). It is **not** a real plugin.

## Proven (observed, with evidence in the session)

| Claim | Evidence |
|---|---|
| A flow kit (2 variable collections: 27 colors + 9 sizes, 3 text styles, 7 component sets/components) can be built through the Plugin API | Built; screenshot reviewed |
| Flows can be composed **only from component instances with variable-bound fills** | Audit: 32/32 instances, 0 detached, 96 solid fills checked, 0 unbound |
| Native connectors work in a design file via **seed → clone → attach** | `clone()` ok; reparent into a frame ok; `connectorStart/End = { endpointNodeId, magnet }` ok; moved a node and the connector re-routed; color bound to a variable; dash, caps, line type settable; label via `connector.text` ok on 11/11 |
| A spec of nodes/edges can generate a whole flow | Checkout: 17 nodes, 19 connectors, 0 overlaps. Sign-in: 20 nodes, 24 connectors, 0 overlaps |
| Helper source can be stored in the file and re-run | `setSharedPluginData` + `eval` worked **in the MCP runner** |

## Not proven (do not claim these)

- **Determinism.** The same spec was never run twice and diffed.
- **Real plugin behavior.** Seed cloning, `eval`, shared plugin data and manifest settings are untested in a real plugin.
- **Dragging a node in a *generated* frame** (tested once on a single test connector, not on a whole generated flow).
- **Large flows**, flows with merging branches, or decisions with 3+ exits.
- **Seed portability** — what happens when a frame is copied to another file without the seed.
- **Visual parity with a hand-made flow.** The sign-in rebuild needed manual hints and one manual connector fix.
- **Published-library availability** on the Starter plan.

## Weaknesses of the proven helper (inputs to the roadmap)

- Needs hints: pinned `col/row` for 3 nodes and explicit sides for 3 edges in the sign-in flow.
- Cannot avoid arrows crossing nodes.
- Reads node sizes back from Figma after creating them (the repo can't do that — see open question 1).
- Edge labels on native connectors are plain text.
- Decision diamonds with long text (30+ chars) get tight at 200×120.

## Figma API facts learned (verify again before relying on them)

- `figma.createConnector()` is **blocked in design files**; `CONNECTOR` nodes can exist if cloned from one pasted from FigJam.
- Connector stroke **weight cannot be variable-bound** (`setBoundVariable` does not exist on `CONNECTOR`); color can.
- `figma.root.setPluginData` threw "not supported in this host runtime"; `setSharedPluginData(namespace, key, value)` worked there.
- Variable values use `{r,g,b,a}`; **paint** colors use `{r,g,b}` only, opacity at the paint level; all channels 0–1.
- Always set `variable.scopes` explicitly (default `ALL_SCOPES` pollutes every picker).
- Text edits require `await figma.loadFontAsync(...)` first; the font style string is `"Semi Bold"` (with a space).
- `combineAsVariants` stacks variants at (0,0): lay them out manually.
- `resize()` resets sizing modes to FIXED: call it **before** setting HUG/FILL.
- `layoutSizingHorizontal/Vertical` take `FIXED|HUG|FILL`; `primaryAxisSizingMode` takes `FIXED|AUTO`. Different enums.
- Vector arrows: `setVectorNetworkAsync` with `strokeCap: 'ARROW_EQUILATERAL'` on the last vertex and per-vertex `cornerRadius: 10` for rounded bends.
- Page context resets to the first page on every MCP call.

## Operational constraints met

- **MCP tool-call limit on the Starter plan** was hit after about 30 Figma-server calls in one session, counting skill-document reads, screenshots and file writes (which calls count toward the limit, the exact limit and the reset time are all unknown). A local plugin is not subject to it. This is a real argument for D3.
- The AI sandbox could not download Figma screenshot URLs (host not allowed); **inline** screenshots taken inside the file worked.

## The owner's original flow (the style to match — D9)

Section `Example` (node `12:500`) in the test file. Structure: two lanes, "ANY PAGE" and
"MY ACCOUNT. WELCOME PAGE", separated by a thin vertical divider; header bars are white
hatched rectangles with a drop shadow and bold uppercase teal titles. Node vocabulary:

- terminal / state: white **pill** with teal stroke and shadow; the "Patient Logged" pill is **filled dark teal** with white text
- process / page prompt: white **rectangle**, teal stroke, shadow
- page with content: **dark-teal filled rectangle**, white text with bullet lists and italic "Other:" sections
- decision: **diamond**, white fill, teal stroke, bold teal uppercase-ish text
- connectors: teal-grey, circle caps at the start, arrowheads at the end, **bold uppercase YES / NO** labels,
  free-floating small teal captions ("Error & prompt to re-enter") on the loop-backs

The AI measured only the *structure*, not exact hex values/fonts/shadows (the call limit hit first).
Do that extraction before restyling.
