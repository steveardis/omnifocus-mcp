## 1. Snippets (src/snippets/)

- [x] 1.1 `create_folder.js`: accept `{name, parentFolderId?}`; if `parentFolderId` provided resolve parent by ID and throw `NotFoundError` if missing; create `new Folder(name)` or `new Folder(name, parentFolder)`; return full folder detail envelope
- [x] 1.2 `edit_folder.js`: accept `{id, name}`; resolve folder by ID; assign `folder.name = name`; return updated full folder detail envelope
- [x] 1.3 `delete_folder.js`: accept `{id}`; resolve folder by ID; recursively delete contents (projects then child folders) then `deleteObject(folder)`; return `{ok: true, data: {id}}`

## 2. Snippet allowlist

- [x] 2.1 Add `create_folder`, `edit_folder`, `delete_folder` to `ALLOWED_SNIPPETS` in `src/runtime/snippetLoader.ts`

## 3. Schemas (src/schemas/shapes.ts)

- [x] 3.1 Define `CreateFolderInput` zod schema: `{name: z.string().min(1), parentFolderId: IdSchema.optional()}`
- [x] 3.2 Define `EditFolderInput` zod schema: `{id: IdSchema, name: z.string().min(1)}`

## 4. Tool handlers (src/tools/)

- [x] 4.1 `createFolder.ts`: validate input with `CreateFolderInput`; invoke `runSnippet("create_folder", args)`; validate result against `FolderDetail`; return
- [x] 4.2 `editFolder.ts`: validate input with `EditFolderInput`; invoke `runSnippet("edit_folder", args)`; validate result against `FolderDetail`; return
- [x] 4.3 `deleteFolder.ts`: input `{id: IdSchema}`; tool description MUST state the AI should confirm with the user before invoking and explicitly note that the entire subtree — child folders, projects, and all tasks — is permanently deleted; invoke `runSnippet("delete_folder", {id})`; return confirmation

## 5. Server registration

- [x] 5.1 Export all three new tool definitions from `src/tools/index.ts`

## 6. Unit tests (test/unit/)

- [x] 6.1 `schemas.createFolder.test.ts`: valid inputs pass; empty name rejected

## 7. Integration tests (test/integration/)

- [x] 7.1 `createFolder.int.test.ts`: create top-level folder; create nested folder; verify `path` and `parentId`
- [x] 7.2 `editFolder.int.test.ts`: rename a folder; verify `name` and `path` updated
- [x] 7.3 `deleteFolder.int.test.ts`: create folder with child project and tasks; delete folder; verify `get_folder` returns not-found and projects are gone

## 8. Verification

- [x] 8.1 `npm run typecheck` clean
- [x] 8.2 `npm test` (unit suite) clean
- [x] 8.3 Manually run integration suite; verify fixture cleanup
- [ ] 8.4 Connect to Claude Desktop; exercise all three tools against a real database
