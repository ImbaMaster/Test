import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Issue } from '../src/types.js';
import { validateFlowSpec, validateRenderPlan } from '../src/validate.js';

const load = (f: string) => JSON.parse(readFileSync(new URL(`../examples/${f}`, import.meta.url), 'utf8'));
const errors = (issues: Issue[]) => issues.filter(i => i.level === 'error');
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

describe('FlowSpec: the real flows from the Figma session are valid', () => {
  for (const f of ['minimal.flow-spec.json', 'checkout.flow-spec.json', 'signin.flow-spec.json']) {
    it(f, () => expect(errors(validateFlowSpec(load(f)))).toEqual([]));
  }
});

describe('FlowSpec: invalid specs are rejected for the right reason', () => {
  const base = () => load('minimal.flow-spec.json');

  it('decision without a label (shape rule)', () => {
    const s = base(); s.nodes[1] = { id: 'b', type: 'decision', phase: 'p1' };
    expect(errors(validateFlowSpec(s)).length).toBeGreaterThan(0);
  });
  it('unknown edge target (meaning rule)', () => {
    const s = base(); s.edges[1].to = 'nope';
    expect(errors(validateFlowSpec(s)).map(i => i.message).join()).toMatch(/unknown node "nope"/);
  });
  it('two start nodes', () => {
    const s = base(); s.nodes[2] = { id: 'c', type: 'start', phase: 'p1', label: 'Second start' };
    expect(errors(validateFlowSpec(s)).map(i => i.message).join()).toMatch(/exactly one "start"/);
  });
  it('first node is not the start node', () => {
    const s = base(); [s.nodes[0], s.nodes[1]] = [s.nodes[1], s.nodes[0]];
    expect(errors(validateFlowSpec(s)).map(i => i.message).join()).toMatch(/first node must be the "start"/);
  });
  it('duplicate node ids', () => {
    const s = base(); s.nodes[2].id = 'b';
    expect(errors(validateFlowSpec(s)).map(i => i.message).join()).toMatch(/duplicate node id "b"/);
  });
  it('unknown phase', () => {
    const s = base(); s.nodes[1].phase = 'ghost';
    expect(errors(validateFlowSpec(s)).map(i => i.message).join()).toMatch(/unknown phase "ghost"/);
  });
  it('node that no edge can place and has no hint', () => {
    const s = base(); s.nodes.push({ id: 'orphan', type: 'process', phase: 'p1', label: 'Orphan' });
    expect(errors(validateFlowSpec(s)).map(i => i.message).join()).toMatch(/"orphan" cannot be placed/);
  });
  it('the same orphan is fine when pinned with a hint', () => {
    const s = base(); s.nodes.push({ id: 'orphan', type: 'process', phase: 'p1', label: 'Orphan', hint: { col: 1, row: 1 } });
    expect(errors(validateFlowSpec(s))).toEqual([]);
  });
  it('fromSide without toSide', () => {
    const s = base(); s.edges[0].fromSide = 'RIGHT';
    expect(errors(validateFlowSpec(s)).length).toBeGreaterThan(0);
  });
  it('a missing end node is only a warning', () => {
    const s = base(); s.nodes[2] = { id: 'c', type: 'process', phase: 'p1', label: 'Not an end' };
    const issues = validateFlowSpec(s);
    expect(errors(issues)).toEqual([]);
    expect(issues.some(i => i.level === 'warning')).toBe(true);
  });
});

describe('RenderPlan', () => {
  const plan = () => load('minimal.render-plan.json');

  it('minimal plan is valid', () => expect(errors(validateRenderPlan(plan()))).toEqual([]));
  it('overlapping nodes are rejected', () => {
    const p = clone(plan()); p.nodes[1].x = p.nodes[0].x + 10;
    expect(errors(validateRenderPlan(p)).map(i => i.message).join()).toMatch(/overlap/);
  });
  it('edge to unknown node', () => {
    const p = clone(plan()); p.edges[0].to = 'zzz';
    expect(errors(validateRenderPlan(p)).map(i => i.message).join()).toMatch(/unknown node "zzz"/);
  });
  it('vector mode requires routes', () => {
    const p = clone(plan()); p.connectorMode = 'vector';
    expect(errors(validateRenderPlan(p)).map(i => i.message).join()).toMatch(/route is required/);
  });
});
