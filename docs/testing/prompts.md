# Testing Prompt Template (Golden Jellyfish Play)

Use this template for every test request. Before sending to Claude, update only the file path and the function coverage list pulled from `pnpm test:details`. All other guidance remains constant run-to-run.

```
You are assisting with unit tests for our Next.js hospitality management app. Follow these rules:
1. Use Vitest + React Testing Library conventions.
2. Structure each test with Arrange → Act → Assert (AAA).
3. Query DOM elements by role/text/label; avoid getByTestId unless unavoidable.
4. Drive behaviour using @testing-library/user-event and assert visible outcomes.
5. When writing JSX in the test file, include `import React from "react";` so the Vitest suite runs correctly.
6. Leverage shared builders from "@/test/builders" for realistic hospitality data.
7. Use the MSW server configured in setup. Apply `server.use(...)` for overrides and rely on automatic reset after each test.
8. Include at least one negative or edge scenario.
9. Stub any external dependencies surfaced by the module (Next.js router, browser APIs, context hooks) to keep tests deterministic.

Context:
- **File under test:** [relative/path/to/file]
- **Functions to cover (from `pnpm test:details [file]`):**
  • [function or behaviour + line span]
  • [function or behaviour + line span]
  • [function or behaviour + line span]

Deliver a Vitest suite that satisfies the rules above and fully covers the listed functions.
```

---

## Current Target Prompt

Copy the block below into Claude. When this file is complete, replace only the file path and function bullets with the next target’s details.

```
You are assisting with unit tests for our Next.js hospitality management app. Follow these rules:
1. Use Vitest + React Testing Library conventions.
2. Structure each test with Arrange → Act → Assert (AAA).
3. Query DOM elements by role/text/label; avoid getByTestId unless unavoidable.
4. Drive behaviour using @testing-library/user-event and assert visible outcomes.
5. When writing JSX in the test file, include `import React from "react";` so the Vitest suite runs correctly.
6. Leverage shared builders from "@/test/builders" for realistic hospitality data.
7. Use the MSW server configured in setup. Apply `server.use(...)` for overrides and rely on automatic reset after each test.
8. Include at least one negative or edge scenario.
9. Stub any external dependencies surfaced by the module (Next.js router, browser APIs, context hooks) to keep tests deterministic.
10. Assert every side-effecting handler (router navigation, clipboard writes, table meta callbacks, toast invocations, etc.) is called with the expected payload.

Context:
- **File under test:** src/app/(app)/reservations/components/columns.tsx
- **Functions to cover (from `pnpm test:details "src/app/(app)/reservations/components/columns.tsx"`):**
  • Expander column cell toggling behaviour (lines 48-87).
  • Booking ID link rendering and fallback logic (lines 78-105).
  • Date formatting cells for booking, check-in, and check-out values (lines 101-150).
  • Guest, room, nights, and total amount display cells (lines 111-165).
  • Status column filter + badge variant selection (lines 163-199).
  • Source column tooltip/icon rendering (lines 217-226).
  • Actions dropdown handlers for router navigation, clipboard copy, and table meta callbacks (lines 238-261).

Deliver a Vitest suite that satisfies the rules above and fully covers the listed functions.
```
