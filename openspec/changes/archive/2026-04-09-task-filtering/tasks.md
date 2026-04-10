## 1. Schema changes (src/schemas/)

- [x] 1.1 Add `dueDate: z.string().datetime().nullable()` and `tagIds: z.array(IdSchema)` to `TaskSummary` in `shapes.ts`
- [x] 1.2 Define `ListTasksFilter` zod schema: `{ flagged: z.literal(true).optional(), status: z.array(TaskStatus).optional(), tagId: IdSchema.optional(), dueBeforeDate: z.string().datetime().optional() }`
- [x] 1.3 Export `ListTasksFilter` from `src/schemas/index.ts`

## 2. Snippet rewrite (src/snippets/list_tasks.js)

- [x] 2.1 Add `dueDate` and `tagIds` to the `mapTask` helper
- [x] 2.2 Implement default status exclusion: when `args.filter?.status` is absent, exclude `Task.Status.Completed` and `Task.Status.Dropped`
- [x] 2.3 Implement `flagged` filter: when `args.filter?.flagged` is `true`, exclude non-flagged tasks
- [x] 2.4 Implement `status` array filter: when `args.filter?.status` is provided, keep only tasks whose status maps to one of the given strings
- [x] 2.5 Implement `tagId` filter: when `args.filter?.tagId` is provided, keep only tasks that have a tag whose `id.primaryKey` matches
- [x] 2.6 Implement `dueBeforeDate` filter: when provided, keep only tasks where `task.dueDate` is non-null and `<= new Date(args.filter.dueBeforeDate)`
- [x] 2.7 Apply `args.limit` (default 200) as a slice after all filters

## 3. Tool handler update (src/tools/listTasks.ts)

- [x] 3.1 Add `filter: ListTasksFilter.optional()` and `limit: z.number().int().positive().optional()` to `listTasksSchema`
- [x] 3.2 Pass `filter` and `limit` through to `runSnippet`
- [x] 3.3 Update tool description to document the filter params and the new default-exclusion behavior

## 4. Unit tests (test/unit/)

- [x] 4.1 Update `tools.listTasks.test.ts`: add `dueDate` and `tagIds` to any TaskSummary fixtures that are now required fields
- [x] 4.2 Add schema tests for `ListTasksFilter`: valid filter passes; invalid status enum rejected; dueBeforeDate must be ISO datetime

## 5. Integration tests (test/integration/)

- [x] 5.1 `listTasksFiltered.int.test.ts`: create tasks with known properties in a fixture folder; verify `flagged: true` filter returns only flagged tasks
- [x] 5.2 Verify `status` filter: create a completed task; confirm it is absent by default and present when `status: ["complete"]` is passed
- [x] 5.3 Verify `tagId` filter: assign a tag to one task; confirm only that task is returned
- [x] 5.4 Verify `dueBeforeDate` filter: create a task with a due date in the past; confirm it is returned; create one due far in the future; confirm it is not
- [x] 5.5 Verify `limit`: create more tasks than the limit; confirm result is capped
- [x] 5.6 Verify enriched summary: returned tasks include non-null `dueDate` and `tagIds` when applicable

## 6. Verification

- [x] 6.1 `npm run typecheck` clean
- [x] 6.2 `npm test` (unit suite) clean
- [x] 6.3 Manually run integration suite; verify fixture cleanup
- [ ] 6.4 Connect to Claude Desktop; exercise filter queries against a real database
