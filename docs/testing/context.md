# Senior Testing Engineer Context (Golden Jellyfish Play)

## Role & Mission
- Mirror the high-quality Vitest + RTL testing system from Stellar Tamarin Swim in this codebase.
- Guard the workflow so every AI-authored suite adheres to AAA structure, semantic queries, and realistic data via builders/MSW.
- Track learnings locally so improvements propagate across projects without regression.

## System Timeline
1. **Foundation (2025-01-14)**
   - Imported the Vitest + React Testing Library + User Event + Jest-DOM + jsdom stack.
   - Added MSW server wiring under `src/test/` along with reusable builders tuned to hospitality domain models.
2. **Coverage Tooling (2025-01-14)**
   - Added coverage configuration in `vitest.config.ts` with Istanbul provider, 85% thresholds, and consistent exclusions.
   - Wired backlog helper scripts (`pnpm test:backlog`, `pnpm test:details`) to surface gaps without enforcing thresholds during triage.
3. **Vitest JSX Runtime Alignment (2025-01-14)**
   - Registered `@vitejs/plugin-react` to ensure JSX transforms match Next.js builds, preventing `React is not defined` failures.
4. **Test Acceptance Criteria (pending)**
   - Align guidelines/prompts with hospitality-specific scenarios, add examples once first suites land.

## Current System Snapshot
- **Tooling**: Vitest + RTL + User Event + Jest-DOM, jsdom environment, React plugin, coverage under `coverage/unit`.
- **Test Utilities**: `src/test/builders.ts` for roles, users, reservations, etc.; `handlers.ts` seeds MSW with health + permissions endpoints; `setup.ts` manages server lifecycle and neutralises portals.
- **Scripts**:
  - `pnpm test`: single run (enforces thresholds by default).
  - `pnpm test:coverage`: coverage with enforcement.
  - `pnpm test:backlog`: coverage without enforcement + backlog summary.
  - `pnpm test:details <file>`: drill into specific file coverage using `lcov`.

## Companion Documents
- `guidelines.md`: Behavioural testing principles, setup requirements, and verification checklist for this project.
- `prompts.md`: Claude-facing templates referencing golden jellyfish domain context.
- This `context.md`: evolving record of decisions, rationale, and outstanding actions.

## Working Agreement & Workflow
1. Every engineer reads `guidelines.md` before touching tests.
2. When requesting AI-authored suites, fill the relevant template from `prompts.md` with backlog + function details.
3. Review returned tests using the acceptance checklist; feed systemic learnings back into docs rather than ad-hoc fixes.
4. Log new tooling or standards updates here so they propagate across projects.

## Next-Steps Backlog
- [ ] Capture first suite findings (pass/fail, adjustments needed) after running backlog.
- [ ] Extend MSW handlers as APIs evolve.
- [ ] Add property/room/reservation-specific prompt exemplars once covered.
