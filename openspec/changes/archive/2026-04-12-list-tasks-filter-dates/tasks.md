## 1. Schema

- [x] 1.1 Add `deferDate: z.string().datetime().nullable()` and `plannedDate: z.string().datetime().nullable()` to `TaskSummary` in `src/schemas/shapes.ts`
- [x] 1.2 Add `hasDeferDate: z.literal(true).optional()` to `ListTasksFilter` in `src/schemas/shapes.ts`

## 2. Snippet

- [x] 2.1 Update `taskSummary()` helper in `src/snippets/list_tasks.js` to include `deferDate` and `plannedDate` fields
- [x] 2.2 Add `hasDeferDate` filter logic in `src/snippets/list_tasks.js` (exclude tasks where `task.deferDate === null` when filter is active)

## 3. Tests

- [x] 3.1 Update unit test snapshots/assertions in `test/unit/` that check `TaskSummary` shape to include the new fields
- [x] 3.2 Add integration test to `test/integration/listTasksFiltered.int.test.ts` for `hasDeferDate: true` filter
- [x] 3.3 Add integration test verifying `deferDate` and `plannedDate` appear in list results

## 3b. Snippet Fixes

- [x] 3b.1 Add `deferDate` and `plannedDate` to `move_task.js` return value (also returns `TaskSummary` shape)

## 4. Spec Sync

- [x] 4.1 Update `openspec/specs/task-filtering/spec.md` with `hasDeferDate` filter and enriched summary requirement
- [x] 4.2 Update `openspec/specs/task-management/spec.md` to reflect `deferDate` and `plannedDate` in `TaskSummary`
