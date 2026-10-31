# Learning guide — vibe coding as a UX practice lead

The goal is not just a tool. It is to practice the habits that make AI-assisted building reliable,
and to be able to explain them. Those habits are exactly what a Forward Deployed role leans on:
understand a customer's real constraint, make the smallest thing that proves it, document the trade-offs.

## Working agreement with your AI pair

1. **Small steps.** One milestone, one commit. If a change touches more than ~3 files, stop and ask why.
2. **Explain before editing.** Ask: "What will you change, why, and what could break?" before it writes code.
3. **Tests are the spec.** Write (or ask for) the failing test first; then the code. A passing test is evidence, "looks right" is not.
4. **Make it prove, not claim.** After any change ask: "How do we know this works? Run it." Reject "should work".
5. **Separate facts from guesses.** Keep `docs/02-FINDINGS.md` honest: *proven*, *not proven*, with dates.
6. **Record decisions.** Every time you choose between options, add a line to `docs/01-DECISIONS.md` (what, why, what you rejected).
7. **You drive.** You decide scope. The AI proposes. If you don't understand something, that is the task, not a delay.

## Vocabulary you will use (explain each in your own words after M2)

- **Schema / contract**: a precise, machine-checkable description of data passed between parts.
- **Validation**: checking data against the contract (shape) and against rules (meaning).
- **Pure function / deterministic**: same input, same output, no hidden state.
- **Golden test / snapshot**: a stored expected output the code must reproduce exactly.
- **Idempotent**: running it twice has the same effect as once.
- **Source of truth**: the one place a fact lives; everything else is derived.
- **Fallback / graceful degradation**: a lower-quality path when the preferred one is unavailable.
- **Workaround vs supported API**: the seed-connector trick works today but is not promised by Figma.

## Prompts that work well

- "Read `docs/00-PROJECT-BRIEF.md`, run `npm test`, and summarize the state before touching anything."
- "I want milestone M2. Propose the smallest first step and the test that proves it. Wait for my OK."
- "Explain this function line by line as if I were a designer who has never coded."
- "What are three ways this could silently produce a wrong diagram? Add a test for the most likely one."
- "Review my change like a skeptical senior engineer. What would you push back on?"

## Things to be ready to talk about (portfolio / interview angle)

- A real constraint discovered by testing, not assuming (connectors blocked → seed workaround → tested → fallback designed).
- A deliberate architecture decision with a stated trade-off (dumb plugin + testable core).
- Honest scoping: what was proven vs not, written down.
- An external limit hit and designed around (MCP call limit → local plugin).
- A design-system mindset applied to a delivery tool (tokens in code, one source of truth).
