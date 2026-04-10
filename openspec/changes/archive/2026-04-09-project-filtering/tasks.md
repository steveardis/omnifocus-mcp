## 1. Schema changes (src/schemas/)

- [x] 1.1 Add `flagged: z.boolean()` and `folderId: IdSchema.nullable()` to `ProjectSummary` in `shapes.ts`
- [x] 1.2 Define `ListProjectsFilter` zod schema: `{ status: z.array(ProjectStatus).optional(), folderId: IdSchema.optional(), flagged: z.literal(true).optional() }`
- [x] 1.3 Export `ListProjectsFilter` from `src/schemas/index.ts`

## 2. Snippet rewrite (src/snippets/list_projects.js)

- [x] 2.1 Add `flagged` and `folderId` (parent folder's `id.primaryKey` or `null`) to the project mapping helper
- [x] 2.2 Implement default status exclusion: when `args.filter?.status` is absent, exclude `Project.Status.Done` and `Project.Status.Dropped`
- [x] 2.3 Implement `status` array filter: when `args.filter?.status` is provided, keep only projects whose status maps to one of the given strings
- [x] 2.4 Implement `folderId` filter: resolve the folder by ID (throw `NotFoundError` if not found), then use `folder.flattenedProjects` to get the matching set before applying other filters
- [x] 2.5 Implement `flagged` filter: when `args.filter?.flagged` is `true`, keep only flagged projects
- [x] 2.6 Apply `args.limit` (default 100) as a slice after all filters

## 3. Tool handler update (src/tools/listProjects.ts)

- [x] 3.1 Add `filter: ListProjectsFilter.optional()` and `limit: z.number().int().positive().optional()` to `listProjectsSchema`
- [x] 3.2 Pass `filter` and `limit` through to `runSnippet`
- [x] 3.3 Update tool description to document filter params and new default-exclusion behavior

## 4. Unit tests (test/unit/)

- [x] 4.1 Search for any `ProjectSummary` fixtures in unit tests and add `flagged` and `folderId` fields
- [x] 4.2 Add schema tests for `ListProjectsFilter`: valid filter passes; invalid status enum rejected; `flagged: false` rejected (must be literal `true` or absent)

## 5. Integration tests (test/integration/)

- [x] 5.1 `listProjectsFiltered.int.test.ts`: create projects with known properties; verify default excludes done/dropped projects
- [x] 5.2 Verify `status` filter: create a completed project; confirm absent by default and present when `status: ["done"]` is passed
- [x] 5.3 Verify `folderId` filter: confirm only projects in that folder's subtree are returned
- [x] 5.4 Verify `flagged` filter: create flagged and unflagged projects; confirm only flagged returned
- [x] 5.5 Verify `limit`: confirm result is capped
- [x] 5.6 Verify enriched summary: returned projects include correct `flagged` and `folderId` fields

## 6. Verification

- [x] 6.1 `npm run typecheck` clean
- [x] 6.2 `npm test` (unit suite) clean
- [x] 6.3 Manually run integration suite; verify fixture cleanup
- [ ] 6.4 Connect to Claude Desktop; exercise filter queries against a real database
