# Testing Prompt Templates (Golden Jellyfish Play)

## Usage Notes
- Follow `guidelines.md` before prompting; ensure target feature code is stable.
- Gather backlog + function detail outputs prior to filling templates.
- Replace bracketed sections with project-specific info; include hospitality context to guide realistic data.
- Work one file at a time: after each suite runs locally and passes, refresh `backlog.md` before preparing the next prompt.

## Base Prompt Template
```
You are assisting with unit tests for our Next.js hospitality management app. Follow these rules:
1. Use Vitest + React Testing Library conventions.
2. Structure each test with Arrange → Act → Assert (AAA).
3. Query DOM elements by role/text/label; avoid getByTestId unless unavoidable.
4. Drive behaviour using @testing-library/user-event and assert visible outcomes.
5. When writing JSX in the test file, include `import React from "react";` so the Vitest suite runs correctly.
6. Leverage shared builders from "@/test/builders" for realistic roles, users, rooms, reservations, etc.
7. Use the MSW server configured in setup. Apply `server.use(...)` for overrides and rely on automatic reset after each test.
8. Include at least one negative or edge scenario.

Context (only replace the placeholders below before sending to Claude):
- **File under test:** <REPLACE_WITH_FILE_PATH>
- **Responsibilities:**
  • <REPLACE_WITH_BEHAVIOUR_1>
  • <REPLACE_WITH_BEHAVIOUR_2>
  • <REPLACE_WITH_BEHAVIOUR_3>
- **Critical scenarios:**
  • <REPLACE_WITH_CRITICAL_FLOW_1>
  • <REPLACE_WITH_CRITICAL_FLOW_2>
  • <REPLACE_WITH_CRITICAL_FLOW_3>
- **Functions to cover (from `pnpm test:details`):**
  • <REPLACE_WITH_FUNCTION_NAME_AND_LINE>
  • <REPLACE_WITH_FUNCTION_NAME_AND_LINE>
  • <REPLACE_WITH_FUNCTION_NAME_AND_LINE>

Deliver a Vitest suite that satisfies the rules above and covers every function listed.
```

## Variant: Domain Utility / Pure Function
```
We are testing a pure TypeScript helper in the hospitality domain.
- Use Vitest only (no RTL).
- Cover normal inputs, boundary conditions, and failure cases.
- Prefer builders for reservations/rooms/roles where helpful.
- Assert return values and thrown errors as applicable.

Function signature: [provide]
Expected behaviours: [list]
```

## Variant: React Component with Interactions
```
Component: [name]
Key props: [list]
Scenarios:
1. [primary behaviour]
2. [edge case]

Requirements:
- Render via Testing Library; use semantic queries.
- Simulate interactions using userEvent.
- Assert DOM changes, aria updates, and callbacks.
- Use MSW handlers when network calls impact rendering.
```

## Variant: Async/Data-Fetching Logic
```
We need tests for logic that fetches hospitality data (component or hook).
- Use default MSW handlers unless overriding specific endpoints.
- Demonstrate success, failure, and loading states.
- Assert correct request behaviour and UI updates.
- Reset MSW overrides with server.resetHandlers in afterEach (already handled globally).

Context: [describe endpoints, expected responses]
```

## Post-Response Evaluation Checklist
- [ ] AAA pattern visible.
- [ ] Behaviour-focused test names with single responsibility.
- [ ] Builders or realistic data applied.
- [ ] Edge/negative case present.
- [ ] Semantic assertions; no trivial checks.
- [ ] MSW overrides scoped + cleaned up.
- [ ] Backlog output shows improved coverage.

## Example Prompt (Roles Dashboard Component)
```
You are assisting with unit tests for our Next.js hospitality management app. Follow these rules:
1. Use Vitest + React Testing Library conventions.
2. Structure each test with Arrange → Act → Assert (AAA).
3. Query DOM elements by role/text/label; avoid getByTestId unless unavoidable.
4. Drive behaviour using @testing-library/user-event and assert visible outcomes.
5. When writing JSX in the test file, include `import React from "react";` so the Vitest suite runs correctly.
6. Leverage shared builders from "@/test/builders" for realistic roles, users, rooms, reservations, etc.
7. Use the MSW server configured in setup. Apply `server.use(...)` for overrides and rely on automatic reset after each test.
8. Include at least one negative or edge scenario.

Context:
- File under test: src/components/roles/RoleTable.tsx
- Responsibilities:
  • Render a table of staff roles with permission counts.
  • Allow filtering by role name and toggling permission visibility.
  • Emit `onSelectRole` when a row is clicked.
- Critical scenarios:
  • Renders default list with correct counts and initial sort.
  • Filters roles as the user types.
  • Calls onSelectRole with the chosen role when a row is activated.
  • Displays “no results” message when filter produces zero matches.
- Function details (from `pnpm test:details src/components/roles/RoleTable.tsx`):
  Functions missing coverage:
    - RoleTable (starts at line 28)
    - renderPermissionBadge (starts at line 54)
  Uncovered lines:
    line 35, line 41, line 58, line 72

Produce a Vitest suite that covers these behaviours using builders for roles and respecting all constraints.
```

## Current Target (StickyNoteFormDialog)
Use this pre-filled block as the hand-off to Claude. Update the file-path or function list only after coverage improves.
```
You are assisting with unit tests for our Next.js hospitality management app. Follow these rules:
1. Use Vitest + React Testing Library conventions.
2. Structure each test with Arrange → Act → Assert (AAA).
3. Query DOM elements by role/text/label; avoid getByTestId unless unavoidable.
4. Drive behaviour using @testing-library/user-event and assert visible outcomes.
5. When writing JSX in the test file, include `import React from "react";` so the Vitest suite runs correctly.
6. Leverage shared builders from "@/test/builders" for realistic roles, users, rooms, reservations, etc.
7. Use the MSW server configured in setup. Apply `server.use(...)` for overrides and rely on automatic reset after each test.
8. Include at least one negative or edge scenario.

Additional requirements for this file:
- Mock `@/context/data-context` so you can assert `addStickyNote` / `updateStickyNote` interactions without rendering the entire provider tree.
- Mock `sonner`'s `toast` module to capture success/error messages.
- Use `userEvent` to open the dialog and submit the form. Prefer semantic queries (e.g., role="button", labels for inputs).
- Assert that the dialog closes after successful submission (state toggled via `onOpenChange`).
- Demonstrate both creation and edit flows, including validation failure for missing title.

Context (only replace the placeholders below before sending to Claude):
- **File under test:** src/app/(app)/dashboard/components/StickyNoteFormDialog.tsx
- **Responsibilities:**
  • Render a dialog to create or edit sticky notes tied to hospitality dashboards.
  • Prefill form fields when editing and surface zod validation on submit.
  • Call context helpers to persist notes and provide toast feedback for success/failure.
- **Critical scenarios:**
- **Functions to cover (from `pnpm test:details "src/app/(app)/dashboard/components/StickyNoteFormDialog.tsx"`):**
  • `StickyNoteFormDialog` component initial state and rendering logic (lines 34-89).
  • `onSubmit` handler for create vs edit paths, including toast success/error branches (lines 70-120).
  • Form field renderers for title, description, and color toggle group (lines 106-147).

Deliver a Vitest suite that satisfies the rules above and covers every function listed.
```
