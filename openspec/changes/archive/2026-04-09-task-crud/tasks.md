## 1. Snippets (src/snippets/)

- [x] 1.1 `create_task.js`: accept `{name, note?, flagged?, deferDate?, dueDate?, estimatedMinutes?, projectId?, parentTaskId?, tagIds?}`; resolve placement (inbox / project root / subtask); throw `ConflictError` if both `projectId` and `parentTaskId` provided; throw `NotFoundError` on missing project, parent task, or tag ID; return full task detail envelope
- [x] 1.2 `edit_task.js`: accept `{id, name?, note?, flagged?, deferDate?, dueDate?, estimatedMinutes?, tagIds?}`; resolve task by ID; apply only provided fields; when `tagIds` present replace full tag set (remove all, add each by ID); pass `null` dates/estimatedMinutes to clear; return updated full detail envelope
- [x] 1.3 `complete_task.js`: accept `{id}`; resolve task by ID; call `task.markComplete()`; return updated full detail envelope
- [x] 1.4 `drop_task.js`: accept `{id}`; resolve task by ID; call `task.drop()`; return updated full detail envelope
- [x] 1.5 `delete_task.js`: accept `{id}`; resolve task by ID; call `deleteObject(task)`; return `{ok: true, data: {id}}`

## 2. Snippet allowlist

- [x] 2.1 Add `create_task`, `edit_task`, `complete_task`, `drop_task`, `delete_task` to `ALLOWED_SNIPPETS` in `src/runtime/snippetLoader.ts`

## 3. Schemas (src/schemas/shapes.ts)

- [x] 3.1 Add `parentTaskId: z.string().nullable()` to `TaskDetail` schema
- [x] 3.2 Define `CreateTaskInput` zod schema with all optional fields and the mutual-exclusion refinement for `projectId` + `parentTaskId`
- [x] 3.3 Define `EditTaskInput` zod schema — `id` required, all other fields optional; date fields accept `string | null`; `estimatedMinutes` accepts `number | null`

## 4. Tool handlers (src/tools/)

- [x] 4.1 `createTask.ts`: validate input with `CreateTaskInput`; invoke `runSnippet("create_task", args)`; validate result against `TaskDetail`; return
- [x] 4.2 `editTask.ts`: validate input with `EditTaskInput`; invoke `runSnippet("edit_task", args)`; validate result against `TaskDetail`; return
- [x] 4.3 `completeTask.ts`: input `{id: IdSchema}`; invoke `runSnippet("complete_task", {id})`; validate result against `TaskDetail`; return
- [x] 4.4 `dropTask.ts`: input `{id: IdSchema}`; invoke `runSnippet("drop_task", {id})`; validate result against `TaskDetail`; return
- [x] 4.5 `deleteTask.ts`: input `{id: IdSchema}`; tool description MUST state the AI should confirm with the user before invoking and note that deletion is permanent and includes all subtasks; invoke `runSnippet("delete_task", {id})`; return confirmation

## 5. Server registration

- [x] 5.1 Export all five new tool definitions from `src/tools/index.ts`
- [x] 5.2 Verify `src/server.ts` picks them up via the `allTools` barrel (no change needed if barrel is already dynamic)

## 6. get_task update

- [x] 6.1 Update `src/snippets/get_task.js` to include `parentTaskId` in the returned detail (`t.parentTask ? t.parentTask.id.primaryKey : null`)
- [x] 6.2 Update `src/tools/getTask.ts` to validate against the updated `TaskDetail` schema

## 7. Unit tests (test/unit/)

- [x] 7.1 `schemas.createTask.test.ts`: valid inputs pass; both `projectId` + `parentTaskId` rejected; missing name rejected; null dates accepted in edit schema
- [x] 7.2 `tools.deleteTask.test.ts`: verify tool description contains confirmation language

## 8. Integration tests (test/integration/)

- [x] 8.1 `createTask.int.test.ts`: create inbox task, verify returned ID; create project task, verify containerId; create subtask, verify parentTaskId
- [x] 8.2 `editTask.int.test.ts`: edit name; edit flags; replace tag set; clear due date
- [x] 8.3 `completeTask.int.test.ts`: complete a task, verify status = `"complete"`
- [x] 8.4 `dropTask.int.test.ts`: drop a task, verify status = `"dropped"`
- [x] 8.5 `deleteTask.int.test.ts`: delete a task, verify subsequent `get_task` returns not-found

## 9. Verification

- [x] 9.1 `npm run typecheck` clean
- [x] 9.2 `npm test` (unit suite) clean
- [x] 9.3 Manually run integration suite; verify fixture cleanup
- [ ] 9.4 Connect to Claude Desktop; exercise all five tools against a real database
