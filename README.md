# Flow Forge

Generate consistent, editable user-flow diagrams in **Figma** from a JSON description.

```
FlowSpec JSON  →  layout()  →  RenderPlan JSON  →  Figma plugin  →  flow in Figma
```

A learning project: see `docs/05-LEARNING.md`. Start with `docs/00-PROJECT-BRIEF.md`.

## Quick start

```bash
npm install
npm test                                              # 17 pass, 3 skipped (layout is milestone M2)
npm run typecheck
npm run validate -- examples/signin.flow-spec.json    # FlowSpec: OK
npm run validate -- examples/minimal.render-plan.json # RenderPlan: OK
```

## Layout

| Path | What |
|---|---|
| `schema/` | the two JSON Schema contracts |
| `src/` | types, validator, CLI, layout (stub) |
| `examples/` | real flows from the design session + a minimal golden pair |
| `tests/` | validator tests; layout tests (skipped until M2) |
| `tokens/` | design tokens and component definitions (source of truth for the kit) |
| `plugin/` | plugin plan and sample manifest (not built yet) |
| `reference/` | the helper that worked in Figma's MCP runner (read-only reference) |
| `docs/` | brief, decisions, findings, contract, roadmap, learning guide |

## Status
Contracts and validator done. Layout (M2) and plugin (M4–M7) to build. See `docs/04-ROADMAP.md`.
