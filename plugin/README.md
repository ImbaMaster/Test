# Plugin (milestones M4–M7) — not built yet

The plugin is deliberately **dumb**. All thinking happens in `src/` (testable in Node). The
plugin only does what Figma alone can do.

## Responsibilities

1. **UI window** with a textarea: paste a RenderPlan JSON, click *Render*.
2. **Validate** the pasted JSON against `schema/render-plan.schema.json` (bundle the schema; show
   readable errors, never crash).
3. **Bootstrap the kit** if it is missing from the file: create variables, text styles and
   components from `tokens/flow-tokens.json` (M5). Must be idempotent: run twice, same result.
4. **Draw**: frame → phase bands → node instances at the given x/y → connectors (M6).
   - `connectorMode: "native"`: clone the seed CONNECTOR, attach with `connectorStart/End`
     `{ endpointNodeId, magnet }`, set line type, caps, dash, color (variable-bound), weight 2
     (plain number), label text.
   - If the seed is missing: tell the user how to add it (draw a connector in FigJam, copy, paste
     into the design file, name it `Connector line`), or fall back to `vector`.
   - `connectorMode: "vector"`: draw each `edge.route` as a vector network with an arrow cap.
5. **Self-check and report** (M7): count nodes/connectors against the plan, detect overlaps, detect
   fills not bound to variables, report measured node sizes that differ from the plan.

## Development loop

1. Create a plugin in the Figma desktop app: *Plugins → Development → New plugin…*
   (gives you a real `id` for `manifest.json`).
2. Build TypeScript → `dist/code.js` (esbuild is enough). Import the plugin from `manifest.json`.
3. Reload and run it in a scratch Figma file.

## Things to verify early (they were NOT verified in the MCP session)

- `figma.root.setPluginData` was **not supported** in the MCP runner; use `setSharedPluginData`
  and test it in the real plugin.
- `eval` / `new Function` worked in the MCP runner. Do **not** rely on it in a plugin; bundle code.
- Seed-connector cloning has only been proven through the MCP runner. Prove it in a real plugin first
  (milestone M6, first step) before building anything on top of it.
- Check the current `manifest.json` requirements in Figma's plugin docs; `manifest.sample.json`
  is a starting point, not a guarantee.
