# Unit Testing Guidelines (Golden Jellyfish Play)

## Principles
- Model real user behaviour with semantic queries (`getByRole`, `getByText`) and realistic hospitality data.
- Use Arrange → Act → Assert structure; keep one behaviour per `it` and descriptive names.
- Prefer MSW and builders over brittle mocks; only stub true external boundaries (e.g., third-party APIs).
- Assert observable outcomes (DOM, aria, callbacks) and cover at least one unhappy/edge scenario per suite.

## Environment Overview
- Vitest + RTL + User Event + Jest-DOM + jsdom configured in `vitest.config.ts` with `@vitejs/plugin-react` for JSX.
- Coverage provider: Istanbul, thresholds 85%, reports in `coverage/unit`. Exclusions cover `src/test/**`, config files, generated assets.
- Test bootstrap: `src/test/setup.ts` loads Jest-DOM, controls MSW server lifecycle, and patches `createPortal`.
- Data builders: `src/test/builders.ts` exports factories for roles, users, amenities, rooms, reservations, etc., with `resetBuilderSequences()` for deterministic runs.
- Network mocks: `src/test/handlers.ts` currently seeds health + permissions endpoints—extend as new APIs appear.
- Scripts:
  - `pnpm test` — single run with coverage enforcement.
  - `pnpm test:watch` — watch mode (no coverage).
  - `pnpm test:coverage` — coverage with thresholds enforced.
  - `pnpm test:backlog` — coverage without enforcement + backlog printout.
  - `pnpm test:details <file>` — shows uncovered functions/lines for a specific file.

## Preparing a Claude Prompt
1. Run `pnpm test:backlog` to identify low-coverage files.
2. For a target file, run `pnpm test:details <relative path>` and copy the summary.
3. Open the relevant template in `prompts.md` and fill in:
   - File path + responsibilities.
   - Critical behaviours / edge cases (hospitality domain specifics encouraged).
   - Function details section with the coverage summary.
4. Submit to Claude, then verify returned tests via checklist below.

## AAA Flow Checklist
1. **Arrange** — import component/hook, set up builders/MSW overrides, seed realistic props.
2. **Act** — render and drive behaviour with `userEvent` as needed.
3. **Assert** — verify DOM/callback outcomes, include negative/edge scenarios, ensure semantic queries.

## Test Acceptance Checklist
- [ ] Clear AAA structure; each test names a user-facing behaviour.
- [ ] Builders or realistic objects used (no unexplained magic constants).
- [ ] Minimal mocking (only external services); MSW overrides scoped per test.
- [ ] Semantic assertions; `getByTestId` only if unavoidable.
- [ ] Edge/negative case included.
- [ ] `pnpm test:backlog` reflects improved coverage for touched files.
- [ ] No trivial assertions; coverage gains are meaningful.

## Verification Checklist
- [ ] `pnpm test` — fast sanity check for the touched suites.
- [ ] `pnpm test:coverage` — ensure thresholds (≥85%) hold.
- [ ] `pnpm test:backlog` — confirm backlog shrinks or remains stable.
- [ ] `pnpm test:details <file>` — validate function/line gaps closed before finalising prompts.
- [ ] Update `context.md` with noteworthy learnings or adjustments.
