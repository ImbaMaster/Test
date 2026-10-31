import type { FlowSpec, RenderPlan } from '../types.js';

/**
 * FlowSpec -> RenderPlan. NOT IMPLEMENTED YET: this is roadmap milestone M2.
 *
 * What it must do (full rules in docs/03-CONTRACT.md, section "Layout algorithm"):
 *  1. Place nodes on a grid starting at the origin node (col 0, row 0), following non-loop,
 *     non-note edges and each edge's `place`. Honor node `hint`s.
 *  2. Normalize rows so the top-most row is 0.
 *  3. Compute column x-centers from node widths, with PHASE_GAP where the phase changes.
 *  4. Position notes under the node they attach to.
 *  5. Compute phase bands, frame size, and connector sides (explicit fromSide/toSide win).
 *
 * It must be PURE and DETERMINISTIC: same spec in, byte-identical plan out. No Date, no
 * Math.random, no iteration over unordered collections without sorting.
 */
export function layout(_spec: FlowSpec, _opts: { connectorMode?: 'native' | 'vector' } = {}): RenderPlan {
  throw new Error('layout() is not implemented yet. See docs/04-ROADMAP.md, milestone M2.');
}
