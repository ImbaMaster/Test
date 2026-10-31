// Layout constants proven in the Figma session (reference/flowHelper.v2.js).
// Treat them as the starting values for milestone M2; the golden test in
// tests/layout.test.ts pins what they must produce.

export const GAP = 130;        // horizontal gap between columns inside a phase
export const PHASE_GAP = 190;  // horizontal gap where the phase changes (leaves room for the band edges)
export const ROW = 280;        // vertical distance between row centers
export const TOP = 150;        // y of the center of row 0
export const PAD = 40;         // padding between nodes and their phase band
export const FRAME_MARGIN = 24; // margin between frame edge and bands
export const FRAME_BOTTOM = 80; // space below the lowest node
export const NOTE_OFFSET = 110; // gap between a node and its attached note

/** [dcol, drow] applied to the SOURCE position to get the TARGET position. */
export const PLACE: Record<string, [number, number]> = {
  right: [1, 0],
  below: [0, 1],
  'below-right': [1, 1],
  above: [0, -1],
  'above-right': [1, -1],
};

/** Declared node sizes the layout assumes. The plugin must produce components that fit these. */
export const NODE_SIZE = {
  start: { width: 150, height: 52 },     // min width; grows with label (see docs/03)
  end: { width: 150, height: 52 },
  process: { width: 190, height: 52 },   // height grows with label lines
  error: { width: 190, height: 52 },
  success: { width: 190, height: 52 },
  screen: { width: 220, height: 130 },   // height grows with description lines
  decision: { width: 200, height: 120 },
  note: { width: 220, height: 80 },
} as const;
