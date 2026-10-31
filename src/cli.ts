import { readFileSync } from 'node:fs';
import { validateFlowSpec, validateRenderPlan } from './validate.js';

// Usage: npm run validate -- examples/checkout.flow-spec.json
// Auto-detects the contract: a file with "connectorMode" is a RenderPlan, otherwise a FlowSpec.
const file = process.argv[2];
if (!file) { console.error('usage: npm run validate -- <file.json>'); process.exit(2); }

const data = JSON.parse(readFileSync(file, 'utf8'));
const isPlan = typeof data === 'object' && data !== null && 'connectorMode' in data;
const issues = isPlan ? validateRenderPlan(data) : validateFlowSpec(data);

for (const i of issues) console.log(`${i.level.toUpperCase().padEnd(7)} ${i.path}  ${i.message}`);
const errors = issues.filter(i => i.level === 'error').length;
console.log(`${isPlan ? 'RenderPlan' : 'FlowSpec'}: ${errors === 0 ? 'OK' : 'INVALID'} (${errors} errors, ${issues.length - errors} warnings)`);
process.exit(errors === 0 ? 0 : 1);
