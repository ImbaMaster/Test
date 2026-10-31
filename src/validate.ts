import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FlowSpec, Issue, RenderPlan } from './types.js';

// LEARNING NOTE: ajv is a CommonJS package; in an ES-module project the safest way
// to load it is createRequire. Not pretty, but it avoids a well-known import trap.
const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020.js');

const schemaDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'schema');
const loadSchema = (file: string) => JSON.parse(readFileSync(path.join(schemaDir, file), 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: false });
const checkSpecSchema = ajv.compile(loadSchema('flow-spec.schema.json'));
const checkPlanSchema = ajv.compile(loadSchema('render-plan.schema.json'));

type AjvError = { instancePath: string; message?: string; params?: Record<string, unknown> };
const fromAjv = (errors: AjvError[] | null | undefined): Issue[] =>
  (errors ?? []).map(e => ({ level: 'error' as const, path: e.instancePath || '/', message: e.message ?? 'invalid' }));

const dupes = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) !== i);

/**
 * Validate a FlowSpec in two layers:
 *  1. Shape (JSON Schema): types, required fields, enums.
 *  2. Meaning (code): rules JSON Schema cannot express (unique ids, references, reachability).
 */
export function validateFlowSpec(data: unknown): Issue[] {
  if (!checkSpecSchema(data)) return fromAjv(checkSpecSchema.errors);
  const spec = data as FlowSpec;
  const issues: Issue[] = [];
  const err = (path: string, message: string) => issues.push({ level: 'error', path, message });
  const warn = (path: string, message: string) => issues.push({ level: 'warning', path, message });

  for (const d of dupes(spec.phases.map(p => p.id))) err('/phases', `duplicate phase id "${d}"`);
  for (const d of dupes(spec.nodes.map(n => n.id))) err('/nodes', `duplicate node id "${d}"`);

  const phaseIds = new Set(spec.phases.map(p => p.id));
  const byId = new Map(spec.nodes.map(n => [n.id, n]));

  spec.nodes.forEach((n, i) => {
    if (!phaseIds.has(n.phase)) err(`/nodes/${i}/phase`, `unknown phase "${n.phase}"`);
    if (n.type === 'note' && n.attach) {
      const t = byId.get(n.attach);
      if (!t) err(`/nodes/${i}/attach`, `note "${n.id}" attaches to unknown node "${n.attach}"`);
      else if (t.type === 'note') err(`/nodes/${i}/attach`, `note "${n.id}" cannot attach to another note`);
    }
  });

  const starts = spec.nodes.filter(n => n.type === 'start');
  if (starts.length !== 1) err('/nodes', `exactly one "start" node required, found ${starts.length}`);
  if (spec.nodes[0].type !== 'start') err('/nodes/0', 'the first node must be the "start" node (it is the layout origin)');
  if (!spec.nodes.some(n => n.type === 'end')) warn('/nodes', 'no "end" node: is the flow really open-ended?');

  spec.edges.forEach((e, i) => {
    const a = byId.get(e.from), b = byId.get(e.to);
    if (!a) err(`/edges/${i}/from`, `unknown node "${e.from}"`);
    if (!b) err(`/edges/${i}/to`, `unknown node "${e.to}"`);
    if (e.kind === 'note' && a && a.type !== 'note') warn(`/edges/${i}`, 'kind "note" edges should start at a note node');
    if (e.place && e.loop) warn(`/edges/${i}`, '"place" is ignored on loop edges (they never place nodes)');
  });

  // Reachability: every non-note node must be placeable, i.e. reachable from the origin
  // through non-loop, non-note edges, OR pinned with a hint. (Mirrors the proven helper:
  // an unplaced node made it throw.)
  const reach = new Set<string>();
  const queue = spec.nodes.filter(n => n.type === 'start' || n.hint).map(n => n.id);
  queue.forEach(id => reach.add(id));
  while (queue.length) {
    const cur = queue.shift()!;
    for (const e of spec.edges) {
      if (e.loop || e.kind === 'note' || e.from !== cur || reach.has(e.to) || !byId.has(e.to)) continue;
      reach.add(e.to); queue.push(e.to);
    }
  }
  spec.nodes.forEach((n, i) => {
    if (n.type !== 'note' && !reach.has(n.id)) err(`/nodes/${i}`, `node "${n.id}" cannot be placed: no non-loop edge leads to it and it has no hint`);
  });

  return issues;
}

/** Validate a RenderPlan: shape + geometry sanity (the plugin trusts this file). */
export function validateRenderPlan(data: unknown): Issue[] {
  if (!checkPlanSchema(data)) return fromAjv(checkPlanSchema.errors);
  const plan = data as RenderPlan;
  const issues: Issue[] = [];
  const err = (path: string, message: string) => issues.push({ level: 'error', path, message });
  const warn = (path: string, message: string) => issues.push({ level: 'warning', path, message });

  for (const d of dupes(plan.nodes.map(n => n.id))) err('/nodes', `duplicate node id "${d}"`);
  const ids = new Set(plan.nodes.map(n => n.id));

  plan.edges.forEach((e, i) => {
    if (!ids.has(e.from)) err(`/edges/${i}/from`, `unknown node "${e.from}"`);
    if (!ids.has(e.to)) err(`/edges/${i}/to`, `unknown node "${e.to}"`);
    if (plan.connectorMode === 'vector' && !e.route) err(`/edges/${i}/route`, 'route is required when connectorMode is "vector"');
  });

  const { width: W, height: H } = plan.frame;
  plan.nodes.forEach((n, i) => {
    if (n.x < 0 || n.y < 0 || n.x + n.width > W || n.y + n.height > H) warn(`/nodes/${i}`, `node "${n.id}" extends outside the frame`);
  });
  for (let i = 0; i < plan.nodes.length; i++) for (let j = i + 1; j < plan.nodes.length; j++) {
    const p = plan.nodes[i], q = plan.nodes[j];
    if (p.x < q.x + q.width && q.x < p.x + p.width && p.y < q.y + q.height && q.y < p.y + p.height) {
      err('/nodes', `nodes "${p.id}" and "${q.id}" overlap`);
    }
  }
  return issues;
}
