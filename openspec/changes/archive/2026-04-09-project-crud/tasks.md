## 1. Snippets (src/snippets/)

- [x] 1.1 `create_project.js`: accept `{name, folderId?, note?, type?, status?, flagged?, deferDate?, dueDate?, reviewInterval?, tagIds?}`; resolve folder by ID if provided; map `type` string to `sequential`/`containsSingletonActions` booleans; set `status` to `Project.Status.OnHold` if `"onHold"`; construct `new Project.ReviewInterval(steps, unit)` if `reviewInterval` provided; resolve and assign tags by ID; return full project detail envelope
- [x] 1.2 `edit_project.js`: accept `{id, name?, note?, type?, status?, flagged?, deferDate?, dueDate?, reviewInterval?, tagIds?}`; resolve project by ID; apply only provided fields; map `type` and `status` to OmniJS equivalents; handle `null` for date/reviewInterval to clear; replace tag set when `tagIds` provided; return updated full detail envelope
- [x] 1.3 `complete_project.js`: accept `{id}`; resolve project by ID; call `project.markComplete()`; return updated full detail envelope
- [x] 1.4 `drop_project.js`: accept `{id}`; resolve project by ID; use `project.status = Project.Status.Dropped` (project.drop() is not available via evaluateJavascript); return updated full detail envelope
- [x] 1.5 `delete_project.js`: accept `{id}`; resolve project by ID; call `deleteObject(project)`; return `{ok: true, data: {id}}`

## 2. Snippet allowlist

- [x] 2.1 Add `create_project`, `edit_project`, `complete_project`, `drop_project`, `delete_project` to `ALLOWED_SNIPPETS` in `src/runtime/snippetLoader.ts`

## 3. Schemas (src/schemas/shapes.ts)

- [x] 3.1 Define `ReviewIntervalInput` zod schema: `{steps: z.number().int().positive(), unit: z.enum(["days","weeks","months","years"])}`
- [x] 3.2 Define `CreateProjectInput` zod schema with all optional fields including `reviewInterval: ReviewIntervalInput.optional()`
- [x] 3.3 Define `EditProjectInput` zod schema — `id` required; date fields accept `string | null`; `reviewInterval` accepts `ReviewIntervalInput` (null not supported — OmniJS rejects null for this property)

## 4. Tool handlers (src/tools/)

- [x] 4.1 `createProject.ts`: validate input with `CreateProjectInput`; invoke `runSnippet("create_project", args)`; validate result against `ProjectDetail`; return
- [x] 4.2 `editProject.ts`: validate input with `EditProjectInput`; invoke `runSnippet("edit_project", args)`; validate result against `ProjectDetail`; return
- [x] 4.3 `completeProject.ts`: input `{id: IdSchema}`; invoke `runSnippet("complete_project", {id})`; validate result against `ProjectDetail`; return
- [x] 4.4 `dropProject.ts`: input `{id: IdSchema}`; invoke `runSnippet("drop_project", {id})`; validate result against `ProjectDetail`; return
- [x] 4.5 `deleteProject.ts`: input `{id: IdSchema}`; tool description MUST state the AI should confirm with the user before invoking and note that all tasks in the project are permanently deleted; invoke `runSnippet("delete_project", {id})`; return confirmation

## 5. Server registration

- [x] 5.1 Export all five new tool definitions from `src/tools/index.ts`

## 6. Unit tests (test/unit/)

- [x] 6.1 `schemas.createProject.test.ts`: valid inputs pass; invalid `type` enum rejected; invalid `reviewInterval.unit` rejected; null dates accepted in edit schema

## 7. Integration tests (test/integration/)

- [x] 7.1 `createProject.int.test.ts`: create top-level project; create project in folder; verify `folderPath` and `type`
- [x] 7.2 `editProject.int.test.ts`: edit name; set on-hold; set review interval steps; (clear review interval not supported — OmniJS rejects null)
- [x] 7.3 `completeProject.int.test.ts`: complete a project, verify status = `"done"`
- [x] 7.4 `dropProject.int.test.ts`: drop a project, verify status = `"dropped"`
- [x] 7.5 `deleteProject.int.test.ts`: delete a project, verify subsequent `get_project` returns not-found

## 8. Verification

- [x] 8.1 `npm run typecheck` clean
- [x] 8.2 `npm test` (unit suite) clean
- [x] 8.3 Manually run integration suite; verify fixture cleanup
- [ ] 8.4 Connect to Claude Desktop; exercise all five tools against a real database
