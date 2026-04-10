## 1. Schema changes (src/schemas/)

- [x] 1.1 Add `plannedDate: z.string().datetime().optional()` to `CreateTaskInput` in `shapes.ts`
- [x] 1.2 Add `plannedDate: z.string().datetime().nullable().optional()` to `EditTaskInput` in `shapes.ts`
- [x] 1.3 Add `plannedDate: z.string().datetime().nullable()` to `TaskDetail` in `shapes.ts`

## 2. Snippet updates (src/snippets/)

- [x] 2.1 Update `create_task.js`: set `task.plannedDate` when provided; include `plannedDate: isoOrNull(task.plannedDate)` in returned TaskDetail
- [x] 2.2 Update `edit_task.js`: set/clear `task.plannedDate` using same pattern as deferDate/dueDate; include in returned TaskDetail
- [x] 2.3 Update `get_task.js`: include `plannedDate: isoOrNull(task.plannedDate)` in returned detail
- [x] 2.4 Update `complete_task.js`: include `plannedDate: isoOrNull(task.plannedDate)` in returned TaskDetail
- [x] 2.5 Update `drop_task.js`: include `plannedDate: isoOrNull(task.plannedDate)` in returned TaskDetail

## 3. Integration tests (test/integration/)

- [x] 3.1 `plannedDate.int.test.ts`: create task with plannedDate; verify get_task returns it
- [x] 3.2 `plannedDate.int.test.ts`: edit task to set plannedDate; verify get_task reflects it
- [x] 3.3 `plannedDate.int.test.ts`: edit task to clear plannedDate (null); verify get_task returns null
- [x] 3.4 `plannedDate.int.test.ts`: create task without plannedDate; verify get_task returns null (backward compat)

## 4. Verification

- [x] 4.1 `npm run typecheck` clean
- [x] 4.2 `npm test` (unit suite) clean
- [x] 4.3 Manually run integration suite
