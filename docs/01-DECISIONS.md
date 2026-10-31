# Decisions (ADR-style)

Status: **Agreed** = discussed and accepted by the owner. **Proposed** = recommended by the AI, not yet confirmed.

## D1 — Figma design files, not FigJam  · Agreed
The owner works only in Figma design files. FigJam has native connectors; design files do not
(see D4). Do not suggest FigJam as the target.

## D2 — The repo is the source of truth; Figma is generated output  · Agreed
Tokens, component definitions, schema and layout rules live in the repo. A restyle is a code change,
not hand-editing in Figma. This is what makes results consistent and reviewable.

## D3 — Two contracts, dumb plugin  · Agreed (core architecture)
`FlowSpec → layout() → RenderPlan → plugin`. Layout is **pure and deterministic** code in the repo,
tested in Node/CI. The plugin only validates and draws. Reason: Figma code can only be tested
inside Figma; repo code can be tested anywhere.

## D4 — Native connectors via the "seed and clone" workaround, with a vector fallback  · Agreed
`figma.createConnector()` is blocked in design files, but a connector pasted from FigJam can be
**cloned** and attached. Proven through Figma's MCP runner (see findings). It is an unsupported
workaround, so the plugin supports two modes: `native` (attached, editable) and `vector` (exact
path, not attached). The plugin must detect a missing seed and explain how to add it.

## D5 — v1 hand-off is copy/paste of JSON into the plugin's UI  · Agreed
Simple and enough for v1. Add a `schemaVersion` and readable validation errors.

## D6 — The plugin bootstraps the kit from `tokens/`  · Proposed
So any file can be set up without a published library. Team-library publishing may not be available
on the Starter plan — **not verified**; bootstrapping avoids the question. Must be idempotent.

## D7 — Everything bound to variables, except connector stroke weight  · Agreed
All fills/strokes/spacing/radii bind to variables. Connectors cannot bind stroke weight (API has no
`setBoundVariable` on `CONNECTOR`), so the plugin sets `strokeWeight = 2` as a plain number from tokens.

## D8 — Layout engine: own grid first, ELK later  · Proposed
M2 ports the proven grid algorithm (understandable, matches what already worked). M9 evaluates
`elkjs` (deterministic layered layout) to reduce manual hints and arrow crossings. Note: with native
connectors Figma re-routes paths itself, so the layout engine only controls **node positions and
connector sides**, not exact paths.

## D9 — Restyle to the owner's own teal flow  · Agreed, **not done**
The owner's original sign-in flow (section `Example`) has its own look (teal, pill terminals, dark
"page" blocks, shadowed boxes, bold uppercase YES/NO labels, circle-start connectors). The kit should
match it. Blocked by the Figma MCP tool-call limit on the Starter plan; extract its real values
(fills, strokes, effects, radii, fonts, connector props) then update `tokens/flow-tokens.json`.

## Open questions (decide while building)

1. **Node height.** Layout needs node sizes, but text wrapping is only known inside Figma. Options:
   (a) estimate height from text length in the repo; (b) fixed-height nodes with truncation;
   (c) two-pass: plugin measures and reports back, repo adjusts. Start with (a) + plugin self-check (M7).
2. **Re-run policy.** Re-rendering replaces the frame (loses manual edits) or updates in place (needs stable node ids stored via shared plugin data)?
3. **Edge labels on native connectors** are plain text (no pill). Acceptable? Restore pills?
4. **Arrows crossing nodes.** Accept, add hints, or switch that flow to `vector` mode?
5. **Which AI writes FlowSpec** from a plain-language description, and how is it validated before layout?
