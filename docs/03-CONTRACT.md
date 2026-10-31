# The contracts

A **contract** is an agreement about the shape of data passed between two parts of a system, written
precisely enough that a machine can check it. Here there are two, both JSON Schema (draft 2020-12).

## Contract 1 — FlowSpec (`schema/flow-spec.schema.json`)

Written by a human or an AI. Says **what** is in the flow; never **where**.

```jsonc
{
  "schemaVersion": "1",
  "name": "Checkout flow",
  "phases": [{ "id": "cart", "title": "1 · Cart & identity" }],
  "nodes": [
    { "id": "start", "type": "start", "phase": "cart", "label": "Tap Checkout" },
    { "id": "loggedIn", "type": "decision", "phase": "cart", "label": "Logged in?" }
  ],
  "edges": [
    { "from": "start", "to": "loggedIn" },
    { "from": "loggedIn", "to": "signIn", "label": "No", "place": "below-right" }
  ]
}
```

### Node types and required fields

| type | required | optional | looks like |
|---|---|---|---|
| `start` / `end` | `label` | | pill terminal |
| `process` / `error` / `success` | `label` | `tag` | action box (blue / red / green) |
| `screen` | `title` | `description` | UI page box |
| `decision` | `label` | | diamond |
| `note` | `text`, `attach` | | dashed annotation under the attached node |

Every node also needs `id` (letters/digits/`_`/`-`, starts with a letter), `type`, `phase`. Optional `hint: {col,row}` pins a grid position.

### Edge fields
`from`, `to` (required); `label`; `kind`: `normal|success|error|note`; `loop` (back-edge: never places nodes);
`place`: `right|below|below-right|above|above-right` (where the **target** goes relative to the source, default `right`);
`fromSide` + `toSide` (`TOP|BOTTOM|LEFT|RIGHT`, must be given together, override automatic choice).

### Rules the schema cannot express (enforced in `src/validate.ts`)
1. node ids unique; phase ids unique; every `phase`, edge endpoint and `attach` refers to something that exists
2. exactly one `start` node, and it is `nodes[0]` (the layout origin)
3. a note cannot attach to a note
4. every non-note node is **placeable**: reachable from the origin via non-loop, non-note edges, or pinned with a `hint`
5. (warning) no `end` node; `place` on a loop edge is ignored; `kind: note` edge not starting at a note

## Contract 2 — RenderPlan (`schema/render-plan.schema.json`)

Produced by `layout()`; this is what you paste into the plugin. Everything is decided.

- `connectorMode`: `native` or `vector`
- `frame {width,height}`; `phases[] {id,title,x,y,width,height}`
- `nodes[] {id,type,x,y,width,height,props}` — `props` carries the display text
- `edges[] {id,from,to,fromSide,toSide,kind,label?,route?}` — `route` (points) required in `vector` mode

Plan rules (enforced): unique node ids; edges reference existing nodes; no overlapping nodes (error);
nodes outside the frame (warning); `route` present in vector mode.
See `examples/minimal.render-plan.json`.

## Layout algorithm (port this in M2; reference: `reference/flowHelper.v2.js`)

Constants in `src/layout/constants.ts`. Rows grow **downward**.

1. **Origin.** `nodes[0]` is at `(col 0, row 0)` unless it has a `hint`.
2. **Place by edges.** Repeat until nothing changes: for each edge in spec order that is not `loop` and not `kind: note`,
   if the source has a position and the target does not, place the target at
   `(source.col + dcol, source.row + drow)` using `place` (default `right`):
   `right [1,0]`, `below [0,1]`, `below-right [1,1]`, `above [0,-1]`, `above-right [1,-1]`.
   Nodes with a `hint` are pre-placed and never moved.
3. **Normalize.** Subtract the minimum row from all rows so the top row is 0.
4. **Column x.** For each used column (sorted), width = widest node in it. Start `x = 24 + PAD`. Between columns add
   `GAP`, or `PHASE_GAP` if the phase of the column differs from the previous column's phase. Column center = `x + width/2`.
5. **Row y.** Center of row r = `TOP + r * ROW`. Node `y = center − height/2`.
6. **Notes.** Center under the attached node: `y = target.y + target.height + NOTE_OFFSET`, same center x.
7. **Frame & bands.** Frame height = `lowest node bottom + 80`; width = `rightmost node right + PAD + 24`. A phase band spans from
   `min(node.x) − PAD` to `max(node.right) + PAD`, `y = 24`, height = frame height − 48.
8. **Connector sides** (explicit `fromSide/toSide` always win), with `dx,dy` = target center − source center:
   - note edge → `TOP → BOTTOM`
   - same row (`|dy|<5`), `dx>0` → `RIGHT → LEFT`
   - below, same column → `BOTTOM → TOP`; above, same column → `TOP → BOTTOM`
   - below (`dy>5`) → `BOTTOM → LEFT`
   - above (`dy<−5`): loop edge → `RIGHT → BOTTOM` (target right) or `LEFT → BOTTOM`; otherwise `TOP → LEFT`
   - fallback → `LEFT → RIGHT`
9. **Purity.** No randomness, no time, no unsorted iteration: same spec ⇒ byte-identical plan.

10. **Output conventions** (so the golden file matches): plan nodes and edges keep **spec order**; `props` copies
    only the fields the node has (`label`, `tag`, `title`, `description`, `text`); edge `id` is `"<from>-<to>"` (if that
    collides, append `-2`, `-3`…); a missing `kind` becomes `"normal"`; `label` is omitted when absent; `connectorMode`
    defaults to `"native"`; coordinates are rounded to integers.
11. **Declared sizes** for the golden example: a one-line `start`/`end`/`process` node is 52 high (`start`/`end`: min width 150; `process`: width 190).
    Multi-line text needs a height estimate — see open question 1 in `docs/01-DECISIONS.md`.

Acceptance for M2: `layout(minimal.flow-spec.json)` equals `examples/minimal.render-plan.json`
(`tests/layout.test.ts`, currently skipped).

## Versioning
`schemaVersion` is `"1"`. Any breaking change to either schema bumps it, updates examples and tests, and is recorded in `docs/01-DECISIONS.md`.
