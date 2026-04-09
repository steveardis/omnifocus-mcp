## 1. Snippets (src/snippets/)

- [ ] 1.1 `create_task.js`: accept `{name, note?, flagged?, deferDate?, dueDate?, estimatedMinutes?, projectId?, parentTaskId?, tagIds?}`; resolve placement (inbox / project root / subtask); throw `ConflictError` if both `projectId` and `parentTaskId` provided; throw `NotFoundError` on missing project, parent task, or tag ID; return full task detail envelope
- [ ] 1.2 `edit_task.js`: accept `{id, name?, note?, flagged?, deferDate?, dueDate?, estimatedMinutes?, tagIds?}`; resolve task by ID; apply only provided fields; when `tagIds` present replace full tag set (remove all, add each by ID); pass `null` dates/estimatedMinutes to clear; return updated full detail envelope
- [ ] 1.3 `complete_task.js`: accept `{id}`; resolve task by ID; call `task.markComplete()`; return updated full detail envelope
- [ ] 1.4 `drop_task.js`: accept `{id}`; resolve task by ID; call `task.drop()`; return updated full detail envelope
- [ ] 1.5 `delete_task.js`: accept `{id}`; resolve task by ID; call `deleteObject(task)`; return `{ok: true, data: {id}}`

## 2. Snippet allowlist

- [ ] 2.1 Add `create_task`, `edit_task`, `complete_task`, `drop_task`, `delete_task` to `ALLOWED_SNIPPETS` in `src/runtime/snippetLoader.ts`

## 3. Schemas (src/schemas/shapes.ts)

- [ ] 3.1 Add `parentTaskId: z.string().nullable()` to `TaskDetail` schema
- [ ] 3.2 Define `CreateTaskInput` zod schema with all optional fields and the mutual-exclusion refinement for `projectId` + `parentTaskId`
- [ ] 3.3 Define `EditTaskInput` zod schema — `id` required, all other fields optional; date fields accept `string | null`; `estimatedMinutes` accepts `number | null`

## 4. Tool handlers (src/tools/)

- [ ] 4.1 `createTask.ts`: validate input with `CreateTaskInput`; invoke `runSnippet("create_task", args)`; validate result against `TaskDetail`; return
- [ ] 4.2 `editTask.ts`: validate input with `EditTaskInput`; invoke `runSnippet("edit_task", args)`; validate result against `TaskDetail`; return
- [ ] 4.3 `completeTask.ts`: input `{id: IdSchema}`; invoke `runSnippet("complete_task", {id})`; validate result against `TaskDetail`; return
- [ ] 4.4 `dropTask.ts`: input `{id: IdSchema}`; invoke `runSnippet("drop_task", {id})`; validate result against `TaskDetail`; return
- [ ] 4.5 `deleteTask.ts`: input `{id: IdSchema}`; tool description MUST state the AI should confirm with the user before invoking and note that deletion is permanent and includes all subtasks; invoke `runSnippet("delete_task", {id})`; return confirmation

## 5. Server registration

- [ ] 5.1 Export all five new tool definitions from `src/tools/index.ts`
- [ ] 5.2 Verify `src/server.ts` picks them up via the `allTools` barrel (no change needed if barrel is already dynamic)

## 6. get_task update

- [ ] 6.1 Update `src/snippets/get_task.js` to include `parentTaskId` in the returned detail (`t.parentTask ? t.parentTask.id.primaryKey : null`)
- [ ] 6.2 Update `src/tools/getTask.ts` to validate against the updated `TaskDetail` schema

## 7. Unit tests (test/unit/)

- [ ] 7.1 `schemas.createTask.test.ts`: valid inputs pass; both `projectId` + `parentTaskId` rejected; missing name rejected; null dates accepted in edit schema
- [ ] 7.2 `tools.deleteTask.test.ts`: verify tool description contains confirmation language

## 8. Integration tests (test/integration/)

- [ ] 8.1 `createTask.int.test.ts`: create inbox task, verify returned ID; create project task, verify containerId; create subtask, verify parentTaskId
- [ ] 8.2 `editTask.int.test.ts`: edit name; edit flags; replace tag set; clear due date
- [ ] 8.3 `completeTask.int.test.ts`: complete a task, verify status = `"complete"`
- [ ] 8.4 `dropTask.int.test.ts`: drop a task, verify status = `"dropped"`
- [ ] 8.5 `deleteTask.int.test.ts`: delete a task, verify subsequent `get_task` returns not-found

## 9. Verification

- [ ] 9.1 `npm run typecheck` clean
- [ ] 9.2 `npm test` (unit suite) clean
- [ ] 9.3 Manually run integration suite; verify fixture cleanup
- [ ] 9.4 Connect to Claude Desktop; exercise all five tools against a real database
