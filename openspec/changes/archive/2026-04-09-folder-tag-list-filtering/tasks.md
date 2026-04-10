## 1. Schema changes (src/schemas/)

- [x] 1.1 Define `ListFoldersFilter` zod schema: `{ status: FolderStatus.optional() }` in `shapes.ts`
- [x] 1.2 Define `ListTagsFilter` zod schema: `{ status: TagStatus.optional() }` in `shapes.ts`
- [x] 1.3 Export `ListFoldersFilter` and `ListTagsFilter` from `src/schemas/index.ts`

## 2. Snippet updates (src/snippets/)

- [x] 2.1 Update `list_folders.js`: add `filter` and `limit` args; apply status filter when `args.filter?.status` is provided; apply limit (default 200) as slice after filter
- [x] 2.2 Update `list_tags.js`: add `filter` and `limit` args; apply status filter when `args.filter?.status` is provided; apply limit (default 200) as slice after filter

## 3. Tool handler updates (src/tools/)

- [x] 3.1 Update `listFolders.ts`: add `filter: ListFoldersFilter.optional()` and `limit: z.number().int().positive().optional()` to schema; pass through to `runSnippet`; update description
- [x] 3.2 Update `listTags.ts`: add `filter: ListTagsFilter.optional()` and `limit: z.number().int().positive().optional()` to schema; pass through to `runSnippet`; update description

## 4. Unit tests (test/unit/)

- [x] 4.1 Add schema tests for `ListFoldersFilter`: valid with status "active"; valid with status "dropped"; valid empty; invalid status value rejected
- [x] 4.2 Add schema tests for `ListTagsFilter`: valid with status "active"; valid with status "onHold"; valid with status "dropped"; valid empty; invalid status value rejected

## 5. Integration tests (test/integration/)

- [x] 5.1 `listFoldersFiltered.int.test.ts`: verify status filter returns only folders with that status
- [x] 5.2 `listFoldersFiltered.int.test.ts`: verify limit caps results
- [x] 5.3 `listFoldersFiltered.int.test.ts`: verify no filter returns all folders (including dropped)
- [x] 5.4 `listTagsFiltered.int.test.ts`: verify status filter returns only tags with that status
- [x] 5.5 `listTagsFiltered.int.test.ts`: verify limit caps results
- [x] 5.6 `listTagsFiltered.int.test.ts`: verify no filter returns all tags

## 6. Verification

- [x] 6.1 `npm run typecheck` clean
- [x] 6.2 `npm test` (unit suite) clean
- [x] 6.3 Manually run integration suite
