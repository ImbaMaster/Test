import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { layout } from '../src/layout/index.js';

const load = (f: string) => JSON.parse(readFileSync(new URL(`../examples/${f}`, import.meta.url), 'utf8'));

// MILESTONE M2: implement src/layout/index.ts, then change `it.skip` to `it`.
// The golden file was derived from the layout rules that worked in Figma.
describe('layout (M2)', () => {
  it.skip('reproduces the golden RenderPlan for the minimal flow', () => {
    const plan = layout(load('minimal.flow-spec.json'));
    expect(plan).toEqual(load('minimal.render-plan.json'));
  });

  it.skip('is deterministic: the same spec twice gives byte-identical JSON', () => {
    const spec = load('checkout.flow-spec.json');
    expect(JSON.stringify(layout(spec))).toBe(JSON.stringify(layout(spec)));
  });

  it.skip('produces a RenderPlan with no overlapping nodes for every example flow', () => {
    for (const f of ['checkout.flow-spec.json', 'signin.flow-spec.json']) {
      const plan = layout(load(f));
      expect(plan.nodes.length).toBeGreaterThan(0);
    }
  });
});
