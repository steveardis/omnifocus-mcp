## 1. Snippets (src/snippets/)

- [ ] 1.1 `create_tag.js`: accept `{name, parentTagId?}`; if `parentTagId` provided resolve parent tag by ID and throw `NotFoundError` if missing; create `new Tag(name)` or `new Tag(name, parentTag)`; return full tag detail envelope
- [ ] 1.2 `edit_tag.js`: accept `{id, name?, status?}`; resolve tag by ID; apply only provided fields; map `status` string to `Tag.Status` enum member; return updated full tag detail envelope
- [ ] 1.3 `delete_tag.js`: accept `{id}`; resolve tag by ID; call `deleteObject(tag)` (OmniFocus handles child tag and association cleanup automatically); return `{ok: true, data: {id}}`

## 2. Snippet allowlist

- [ ] 2.1 Add `create_tag`, `edit_tag`, `delete_tag` to `ALLOWED_SNIPPETS` in `src/runtime/snippetLoader.ts`

## 3. Schemas (src/schemas/shapes.ts)

- [ ] 3.1 Define `CreateTagInput` zod schema: `{name: z.string().min(1), parentTagId: IdSchema.optional()}`
- [ ] 3.2 Define `EditTagInput` zod schema: `{id: IdSchema, name: z.string().min(1).optional(), status: TagStatus.optional()}`; add `.refine()` requiring at least one of `name` or `status`

## 4. Tool handlers (src/tools/)

- [ ] 4.1 `createTag.ts`: validate input with `CreateTagInput`; invoke `runSnippet("create_tag", args)`; validate result against `TagDetail`; return
- [ ] 4.2 `editTag.ts`: validate input with `EditTagInput`; invoke `runSnippet("edit_tag", args)`; validate result against `TagDetail`; return
- [ ] 4.3 `deleteTag.ts`: input `{id: IdSchema}`; tool description MUST state the AI should confirm with the user before invoking and note that child tags are also permanently deleted; invoke `runSnippet("delete_tag", {id})`; return confirmation

## 5. Server registration

- [ ] 5.1 Export all three new tool definitions from `src/tools/index.ts`

## 6. Unit tests (test/unit/)

- [ ] 6.1 `schemas.editTag.test.ts`: valid inputs pass; empty object (neither name nor status) rejected by refine; invalid status enum rejected

## 7. Integration tests (test/integration/)

- [ ] 7.1 `createTag.int.test.ts`: create top-level tag; create child tag; verify `path`, `parentId`, `childTagIds`
- [ ] 7.2 `editTag.int.test.ts`: rename a tag; put tag on hold; verify status and name
- [ ] 7.3 `deleteTag.int.test.ts`: delete a tag; verify subsequent `get_tag` returns not-found; verify child tags also gone

## 8. Verification

- [ ] 8.1 `npm run typecheck` clean
- [ ] 8.2 `npm test` (unit suite) clean
- [ ] 8.3 Manually run integration suite; verify fixture cleanup
- [ ] 8.4 Connect to Claude Desktop; exercise all three tools against a real database
