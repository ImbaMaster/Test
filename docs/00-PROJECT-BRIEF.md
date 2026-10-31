# Flow Forge — project brief

> Paste this file (and `CLAUDE.md`) into a new chat or project to restore full context.

## One-line goal

Generate consistent, editable **user-flow diagrams in Figma (design files, not FigJam)** from a
plain JSON description, using code I control, so every flow looks the same and the result is
deterministic.

## Who and why

- Owner: a UX practice lead learning "vibe coding" (building with an AI pair) as a step toward a
  Forward Deployed role.
- This is a **learning project first**: the process, decisions and tests matter as much as the
  tool. See `docs/05-LEARNING.md`.

## The pipeline (agreed)

```
 FlowSpec JSON  ──►  layout()  ──►  RenderPlan JSON  ──►  Figma plugin  ──►  Flow in Figma
 (what is in        (repo, pure,    (absolute x/y, sides,  (dumb: reads      (frame, bands,
  the flow)          tested)         connector mode)        JSON and draws)    instances,
                                                                               connectors)
```

- **FlowSpec** (`schema/flow-spec.schema.json`): authoring contract. Nodes, edges, phases. No coordinates.
- **RenderPlan** (`schema/render-plan.schema.json`): plugin contract. Everything decided. This is the
  JSON that gets pasted into the plugin.
- All logic lives in the repo and is unit-tested in Node. The plugin has no decisions in it.

## What exists today (state at handoff)

| Item | State |
|---|---|
| Schemas for both contracts | Done, validated against 3 real examples |
| Validator (shape + meaning rules) + CLI | Done, 17 tests passing |
| `layout()` | **Stub** — milestone M2, golden test written and skipped |
| Plugin | **Not built** — milestones M4–M7 |
| Tokens (colors, sizes, text styles, components) | Captured from the test Figma file; **teal restyle pending** |
| Reference algorithm | `reference/flowHelper.v2.js` (worked inside Figma's MCP runner) |

## Figma test file (session-specific)

- File: https://www.figma.com/design/Orn9W5Cb8m0amyUg9b47zh (name: "Flow kit test – Checkout", plan: Personal Work / Starter)
- Pages: `Flows` (checkout flow in 3 versions, rebuilt sign-in flow, and the user's original in the
  section `Example`, node `12:500`), `Flow kit` (components + the seed connector `7:69`, named "Connector line").
- Kit component ids (this file only): terminal start `2:9`, end `2:11`; action process `2:14`, error `2:17`,
  success `2:20`; screen `2:29`; decision `2:37`; note `2:26`; edge label `2:24`; phase band `2:40`.

## Start prompt for the new chat

> I'm continuing the Flow Forge project (see attached `docs/00-PROJECT-BRIEF.md` and `CLAUDE.md`).
> I'm a UX practice lead learning vibe coding; explain what you do and why, in small steps.
> Today I want to work on milestone **M?** from `docs/04-ROADMAP.md`. Start by reading the brief,
> running `npm test`, and telling me what you see before changing anything.

## Read next

1. `docs/01-DECISIONS.md` — what we agreed and why
2. `docs/02-FINDINGS.md` — what was proven, what was not, Figma gotchas
3. `docs/03-CONTRACT.md` — the contracts and the layout algorithm
4. `docs/04-ROADMAP.md` — milestones M0–M10
5. `docs/05-LEARNING.md` — working agreement for learning with an AI
