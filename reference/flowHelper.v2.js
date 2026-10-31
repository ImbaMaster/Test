// REFERENCE ONLY. This is the helper that worked inside the Figma MCP script runner (use_figma).
// It is NOT a plugin and NOT meant to be imported. It is here so you can port its LOGIC:
//   - layout rules  -> src/layout/index.ts   (milestone M2)
//   - drawing rules -> plugin/               (milestones M4-M6)
// Hard-coded ids ('2:9', '7:69', ...) came from one specific Figma file; the plugin must
// find or create components by name instead.
//
// Proven results with this code: checkout flow (17 nodes, 19 connectors) and the sign-in
// flow (20 nodes, 24 connectors), both with zero node overlaps. Needed manual hints for
// the sign-in flow: pinned columns/rows for 3 nodes and explicit sides for 3 edges.
//
// Known weaknesses (see docs/02-FINDINGS.md): arrows can cross nodes (Figma routes native
// connectors itself), node height is read back from Figma after creation (the repo layout
// must estimate it instead), and it was never run as a real plugin.

async function flowHelper(spec) {
  await Promise.all(['Regular','Medium','Semi Bold'].map(style => figma.loadFontAsync({ family: 'Inter', style })));
  const vars = await figma.variables.getLocalVariablesAsync(); const V = {}; for (const v of vars) V[v.name] = v;
  const paint = n => { if (!V[n]) throw new Error('missing var ' + n); return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[n]); };
  const comp = {}; for (const [k, id] of Object.entries(spec.components)) comp[k] = await figma.getNodeByIdAsync(id);
  const seed = await figma.getNodeByIdAsync(spec.seed);
  if (!seed || seed.type !== 'CONNECTOR') throw new Error('seed connector not found');
  const setP = (inst, obj) => { const keys = Object.keys(inst.componentProperties), m = {}; for (const [k, v] of Object.entries(obj || {})) { const key = keys.find(x => x.startsWith(k + '#')); if (!key) throw new Error('no prop ' + k); m[key] = v; } inst.setProperties(m); };
  const GAP = 130, PHASE_GAP = 190, ROW = 280, TOP = 150, PAD = 40;
  const frame = figma.createFrame(); frame.name = spec.name; frame.fills = [paint('canvas/bg')]; frame.clipsContent = true;
  const N = {}; for (const n of spec.nodes) N[n.id] = Object.assign({}, n);
  const first = N[spec.nodes[0].id]; if (first.col === undefined) { first.col = 0; first.row = 0; }
  const DC = { right: 1, below: 0, 'below-right': 1, above: 0, 'above-right': 1 }, DR = { right: 0, below: 1, 'below-right': 1, above: -1, 'above-right': -1 };
  let changed = true;
  while (changed) { changed = false;
    for (const e of spec.edges) { if (e.loop || e.kind === 'note') continue;
      const a = N[e.from], b = N[e.to]; if (a.col !== undefined && b.col === undefined) { const p = e.place || 'right'; if (!(p in DC)) throw new Error('bad place ' + p); b.col = a.col + DC[p]; b.row = a.row + DR[p]; changed = true; } } }
  const unplaced = Object.values(N).filter(n => n.col === undefined && n.type !== 'note').map(n => n.id);
  if (unplaced.length) throw new Error('unplaced nodes (no placing edge): ' + unplaced.join(', '));
  const minRow = Math.min(...Object.values(N).filter(n => n.row !== undefined).map(n => n.row));
  for (const n of Object.values(N)) if (n.row !== undefined) n.row -= minRow;
  for (const n of Object.values(N)) { const i = comp[n.type].createInstance(); i.name = n.id; frame.appendChild(i); setP(i, n.props); n.inst = i; }
  const cols = {}; for (const n of Object.values(N)) if (n.type !== 'note') { (cols[n.col] = cols[n.col] || { w: 0, phase: n.phase }); cols[n.col].w = Math.max(cols[n.col].w, n.inst.width); }
  const colIdx = Object.keys(cols).map(Number).sort((a, b) => a - b);
  let x = 24 + PAD; const cx = {};
  colIdx.forEach((c, i) => { if (i > 0) x += (cols[c].phase !== cols[colIdx[i - 1]].phase) ? PHASE_GAP : GAP; cx[c] = x + cols[c].w / 2; x += cols[c].w; });
  for (const n of Object.values(N)) if (n.type !== 'note') { n.cx = cx[n.col]; n.cy = TOP + n.row * ROW; n.inst.x = Math.round(n.cx - n.inst.width / 2); n.inst.y = Math.round(n.cy - n.inst.height / 2); }
  for (const n of Object.values(N)) if (n.type === 'note') { const t = N[n.attach]; n.cx = t.cx; n.inst.x = Math.round(t.cx - n.inst.width / 2); n.inst.y = Math.round(t.inst.y + t.inst.height + 110); n.cy = n.inst.y + n.inst.height / 2; }
  let maxB = 0, maxR = 0; for (const n of Object.values(N)) { maxB = Math.max(maxB, n.inst.y + n.inst.height); maxR = Math.max(maxR, n.inst.x + n.inst.width); }
  const H = Math.round(maxB + 80); const bandIds = [];
  (spec.phases || []).forEach((title, pi) => {
    const mem = Object.values(N).filter(n => n.phase === pi); if (!mem.length) return;
    const l = Math.min(...mem.map(n => n.inst.x)) - PAD, r = Math.max(...mem.map(n => n.inst.x + n.inst.width)) + PAD;
    const b = comp.band.createInstance(); b.name = 'Phase: ' + title; frame.insertChild(0, b); setP(b, { Title: title });
    b.resize(r - l, H - 48); b.x = l; b.y = 24; bandIds.push(b.id);
  });
  frame.resize(Math.round(maxR + PAD + 24), H);
  const sides = (a, b, e) => {
    if (e.fromSide && e.toSide) return [e.fromSide, e.toSide];
    if (e.kind === 'note') return ['TOP', 'BOTTOM'];
    const dx = b.cx - a.cx, dy = b.cy - a.cy;
    if (Math.abs(dy) < 5 && dx > 0) return ['RIGHT', 'LEFT'];
    if (dy > 5 && Math.abs(dx) < 5) return ['BOTTOM', 'TOP'];
    if (dy < -5 && Math.abs(dx) < 5) return ['TOP', 'BOTTOM'];
    if (dy > 5) return ['BOTTOM', 'LEFT'];
    if (dy < -5) return e.loop ? (dx > 0 ? ['RIGHT', 'BOTTOM'] : ['LEFT', 'BOTTOM']) : ['TOP', 'LEFT'];
    return ['LEFT', 'RIGHT'];
  };
  const COL = { normal: 'edge/default', success: 'edge/success', error: 'edge/error', note: 'edge/note' };
  const connIds = []; let labelFail = 0;
  for (const e of spec.edges) {
    const a = N[e.from], b = N[e.to], kind = e.kind || 'normal', [sa, sb] = sides(a, b, e);
    const c = seed.clone(); frame.appendChild(c); c.name = 'Edge: ' + e.from + ' → ' + e.to;
    c.connectorStart = { endpointNodeId: a.inst.id, magnet: sa }; c.connectorEnd = { endpointNodeId: b.inst.id, magnet: sb };
    c.connectorLineType = 'ELBOWED'; c.connectorStartStrokeCap = 'NONE'; c.connectorEndStrokeCap = kind === 'note' ? 'NONE' : 'ARROW_EQUILATERAL';
    c.strokes = [paint(COL[kind])]; c.strokeWeight = 2; c.dashPattern = kind === 'note' ? [6, 5] : [];
    if (e.label) { try { c.text.characters = e.label; c.text.fontName = { family: 'Inter', style: 'Regular' }; c.text.fontSize = 12; c.text.fills = [paint('text/secondary')]; } catch (err) { labelFail++; } }
    connIds.push(c.id);
  }
  let maxY = 0; for (const ch of figma.currentPage.children) if (ch.id !== frame.id) maxY = Math.max(maxY, ch.y + ch.height);
  frame.x = 0; frame.y = maxY + 200;
  const items = Object.values(N); const overlaps = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const p = items[i].inst, q = items[j].inst; if (p.x < q.x + q.width && q.x < p.x + p.width && p.y < q.y + q.height && q.y < p.y + p.height) overlaps.push(items[i].id + ' × ' + items[j].id); }
  return { frameId: frame.id, nodes: items.length, connectors: connIds.length, bands: bandIds.length, labelFail, overlaps, size: [frame.width, frame.height] };
}
