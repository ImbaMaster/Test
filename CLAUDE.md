# CLAUDE.md — instructions for AI assistants working in this repo

Project: **Flow Forge**. Read `docs/00-PROJECT-BRIEF.md` first, then `docs/01-DECISIONS.md`.

## Who you are working with
A UX practice lead who is **learning** to build with AI. Teach as you go: explain what you change and why
in plain language, in small steps. Do not make big unrequested changes. Ask before expanding scope.

## Commands
- `npm install` — setup
- `npm test` — run tests (vitest)
- `npm run typecheck` — TypeScript check
- `npm run validate -- <file.json>` — validate a FlowSpec or RenderPlan (auto-detected)

## Architecture rules (do not break without updating docs/01-DECISIONS.md)
1. Pipeline: `FlowSpec → layout() → RenderPlan → plugin`. The plugin makes **no decisions**.
2. `layout()` is pure and deterministic: no randomness, no time, no unsorted iteration.
3. Any change to a schema must update: the matching TypeScript type, the examples, the tests, `docs/03-CONTRACT.md`,
   and bump `schemaVersion` if it is breaking.
4. Tokens live in `tokens/flow-tokens.json`; never hard-code colors in the plugin.
5. Connector stroke weight cannot be variable-bound — set it as a plain number from tokens.

## Working rules
- Test first when adding a rule. Run `npm test` and `npm run typecheck` before saying something works.
- Never claim something works in Figma without evidence. `docs/02-FINDINGS.md` separates *proven* from *not proven*; keep it honest and update it with dates.
- `reference/flowHelper.v2.js` is reference material, not production code. Do not import it.
- Do not add dependencies without saying why. Prefer fewer, well-known ones.
- Commit per milestone with a clear message.

## Figma specifics
- Target is **Figma design files** (not FigJam).
- The Figma MCP server on the Starter plan has a tool-call limit; prefer local code + tests, and use Figma calls sparingly and in batches.
- Seed connector: a `CONNECTOR` node named "Connector line" pasted from FigJam into the file; the plugin clones it.
