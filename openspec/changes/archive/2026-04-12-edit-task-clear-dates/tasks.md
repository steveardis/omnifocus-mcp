## 1. Schema

- [x] 1.1 Remove `.nullable()` from `deferDate`, `plannedDate`, and `dueDate` in `EditTaskInput` in `src/schemas/shapes.ts`
- [x] 1.2 Add `clearDeferDate: z.literal(true).optional()`, `clearPlannedDate: z.literal(true).optional()`, `clearDueDate: z.literal(true).optional()` to `EditTaskInput`
- [x] 1.3 Update the `edit_task` tool description in `src/tools/editTask.ts` to reflect the new clear flags

## 2. Snippet

- [x] 2.1 Update `src/snippets/edit_task.js` to handle `clearDeferDate`, `clearPlannedDate`, `clearDueDate` flags (set field to null when flag is true)

## 3. Tests

- [x] 3.1 Update unit tests in `test/unit/schemas.recurrence.test.ts` or add to a new schema test file to verify `clearDeferDate/clearPlannedDate/clearDueDate` are accepted and date strings still work
- [x] 3.2 Add integration test scenarios to `test/integration/editTask.int.test.ts` for clearing defer date, planned date, and due date via the new flags

## 4. Spec Sync

- [x] 4.1 Update `openspec/specs/task-write/spec.md` to replace the old nullable-date scenarios with the clear-flag scenarios from the delta spec
