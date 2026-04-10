## 1. Schema changes (src/schemas/)

- [x] 1.1 Define `MoveTaskInput` zod schema: `{ id: IdSchema, projectId: IdSchema.optional(), parentTaskId: IdSchema.optional() }` with `.refine()` that exactly one of `projectId` or `parentTaskId` is provided
- [x] 1.2 Define `MoveProjectInput` zod schema: `{ id: IdSchema, folderId: IdSchema.nullable() }`
- [x] 1.3 Export `MoveTaskInput` and `MoveProjectInput` from `src/schemas/index.ts`

## 2. Snippets (src/snippets/)

- [x] 2.1 Create `move_task.js`: resolve task by ID (NotFoundError if missing); if `projectId` provided, resolve project (NotFoundError if missing), assign `task.containingProject = project`; if `parentTaskId` provided, resolve parent task (NotFoundError if missing), assign `task.parentTask = parentTask`; return updated `TaskSummary` fields
- [x] 2.2 Create `move_project.js`: resolve project by ID (NotFoundError if missing); if `folderId` is non-null, resolve folder (NotFoundError if missing), assign `project.parentFolder = folder`; if `folderId` is null, assign `project.parentFolder = null`; return updated `ProjectSummary` fields

## 3. Tool handlers (src/tools/)

- [x] 3.1 Create `moveTask.ts`: schema uses `MoveTaskInput`, handler calls `runSnippet("move_task", input)`, parses result as `TaskSummary`, exports `moveTaskTool`
- [x] 3.2 Create `moveProject.ts`: schema uses `MoveProjectInput`, handler calls `runSnippet("move_project", input)`, parses result as `ProjectSummary`, exports `moveProjectTool`

## 4. Registration

- [x] 4.1 Add `move_task` and `move_project` to `ALLOWED_SNIPPETS` in `src/runtime/snippetLoader.ts`
- [x] 4.2 Import and add `moveTaskTool` and `moveProjectTool` to `allTools` in `src/tools/index.ts`

## 5. Unit tests (test/unit/)

- [x] 5.1 Add schema tests for `MoveTaskInput`: valid with projectId only; valid with parentTaskId only; invalid with both; invalid with neither
- [x] 5.2 Add schema tests for `MoveProjectInput`: valid with folderId string; valid with folderId null; invalid with missing id

## 6. Integration tests (test/integration/)

- [x] 6.1 `moveTask.int.test.ts`: create task in project A; move to project B; verify task appears in project B
- [x] 6.2 `moveTask.int.test.ts`: create task; make it a subtask of another task via parentTaskId
- [x] 6.3 `moveTask.int.test.ts`: non-existent task ID returns NotFoundError
- [x] 6.4 `moveProject.int.test.ts`: create project in folder A; move to folder B; verify project is in folder B
- [x] 6.5 `moveProject.int.test.ts`: move project to top level (folderId: null)
- [x] 6.6 `moveProject.int.test.ts`: non-existent project ID returns NotFoundError

## 7. Verification

- [x] 7.1 `npm run typecheck` clean
- [x] 7.2 `npm test` (unit suite) clean
- [x] 7.3 Manually run integration suite
