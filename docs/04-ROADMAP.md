# Roadmap

Each milestone is a small, finishable step with a "done when" and "you will learn". Commit at the end of each one.
Do them in order; do not skip M0–M2.

| # | Milestone | Done when | You will learn |
|---|---|---|---|
| **M0** | Orientation | `npm install`, `npm test`, `npm run validate -- examples/signin.flow-spec.json` all work; you can explain the pipeline in your own words | reading a repo, running tests |
| **M1** | Break and harden the schema | You add **one** new rule of your own (e.g. max label length, or a warning for decisions with fewer than 2 outgoing edges) with a failing test first, then the code | tests as a spec, JSON Schema vs code rules |
| **M2** | `layout()` v1 (grid) | The 3 skipped tests in `tests/layout.test.ts` pass; checkout and sign-in plans have **no overlaps**; running twice gives identical JSON | pure functions, determinism, golden tests |
| **M3** | CLI `plan` command | `npm run plan -- examples/checkout.flow-spec.json > out/checkout.plan.json` writes a plan that passes `validate`; `--connectors vector` also computes `route` points | CLI design, generating routes |
| **M4** | Plugin v0 (vector mode) | In Figma desktop: paste `minimal.render-plan.json`, click Render, see a frame with boxes and arrows (plain rectangles are fine) | plugin lifecycle, UI↔code messaging |
| **M5** | Kit bootstrap | Plugin creates variables, text styles and components from `tokens/flow-tokens.json`; running it twice changes nothing | idempotency, design tokens in code |
| **M6** | Native connectors | **First, prove seed cloning in a real plugin** with a 10-line experiment. Then attach connectors by sides, add labels, weight 2; missing seed → clear message + vector fallback | risky-assumption testing, graceful fallback |
| **M7** | Self-check report | After render the plugin reports: node/edge counts vs plan, overlaps, unbound fills, size mismatches | verification, not trust |
| **M8** | Restyle to the owner's teal flow | Extract real values from section `Example` (colors, fonts, shadows, radii, connector props) → update `tokens/` → re-render the sign-in flow and compare side by side with the original | design-to-code translation |
| **M9** | Better layout | Evaluate `elkjs` against the grid on the sign-in flow: fewer hints? fewer crossings? Decide with evidence and record it in `docs/01-DECISIONS.md`. Also generate TS types from the schemas | trade-off analysis, one source of truth |
| **M10** | Re-run policy and round trip | Decide update-in-place vs replace; optionally export an existing Figma flow back to FlowSpec | state management, idempotent sync |

## Definition of "deterministic" for this project

Same FlowSpec + same tokens + same `schemaVersion` ⇒ **byte-identical RenderPlan**, enforced by a test.
In Figma, node positions, styles and connector attachments are reproducible; the exact path of a
native connector is chosen by Figma and is **not** guaranteed. If a flow needs exact paths, use `vector` mode.

## Risks to watch (ordered)

1. Seed-connector cloning may behave differently in a real plugin than in the MCP runner (test first in M6).
2. Node height estimation (open question 1) can make the layout overlap in Figma even when the plan has none → M7 must catch it.
3. Figma API behavior may change; keep `docs/02-FINDINGS.md` current with dates.
4. Scope creep: resist ELK, round-trip and new node types until M0–M8 are done.
