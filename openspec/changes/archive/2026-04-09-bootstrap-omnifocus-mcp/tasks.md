## 1. Repository scaffold

- [x] 1.1 Create `package.json` with dependencies: `@modelcontextprotocol/sdk`, `zod`; devDependencies: `typescript`, `vitest`, `@types/node`, `tsx`
- [x] 1.2 Create `tsconfig.json` targeting Node 20, strict mode, `moduleResolution: "bundler"`, `outDir: "dist"`, sourcemaps on
- [x] 1.3 Create directory structure: `src/runtime/`, `src/snippets/`, `src/tools/`, `src/schemas/`, `test/unit/`, `test/integration/`
- [x] 1.4 Add `.gitignore` covering `node_modules`, `dist`, `*.log`, macOS cruft
- [x] 1.5 Add root `README.md` stub with macOS-only note and integration-test warning about sync

## 2. Execution runtime (src/runtime/)

- [x] 2.1 Implement `snippetLoader.ts`: reads `src/snippets/<name>.js` from the resolved snippet root, caches in memory, validates exactly one `__ARGS__` token, throws on zero or multiple
- [x] 2.2 Implement `resultProtocol.ts`: zod schema for the `{ok, data} | {ok: false, error}` envelope, `parseResultLine(stdout: string)` that selects the first JSON-parseable line and validates the envelope, `ExecutionError` class carrying name/message/stack from the error branch
- [x] 2.3 Implement `jxaShim.ts`: a template string containing the JXA wrapper that calls `Application('OmniFocus').evaluateJavascript(snippet)`, wraps in try/catch, prints the envelope as one JSON line
- [x] 2.4 Implement `bridge.ts`: `runSnippet(name: string, args: unknown, opts?: {timeoutMs?: number}): Promise<unknown>` — loads the snippet via the loader, injects args via `template.replace("__ARGS__", JSON.stringify(args))`, wraps the result in the JXA shim, spawns `osascript -l JavaScript`, enforces timeout via `AbortController` + SIGTERM, parses stdout via `parseResultLine`, throws `ExecutionError` on `ok: false`, returns `data` on success
- [x] 2.5 Export a single `runtime` barrel from `src/runtime/index.ts`

## 3. Shared schemas (src/schemas/)

- [x] 3.1 Define zod schemas: `IdSchema` (non-empty string), `EntityType` enum (`"task" | "project" | "folder" | "tag" | "perspective"`), `ProjectType` enum, `ProjectStatus` enum, `TaskStatus` enum, `TagStatus` enum, `FolderStatus` enum
- [x] 3.2 Define shared return-shape schemas: `TaskSummary`, `TaskDetail`, `ProjectSummary`, `ProjectDetail`, `FolderSummary`, `FolderDetail`, `TagSummary`, `TagDetail`, `ResolveCandidate`
- [x] 3.3 Export a `schemas` barrel from `src/schemas/index.ts`

## 4. Snippets (src/snippets/*.js) — read-only set for this change

- [x] 4.1 `list_projects.js`: iterate `flattenedProjects`, map to summary shape with `id.primaryKey`, canonical `status`/`type` enum values, folder path via ` ▸ ` separator; return `JSON.stringify({ok: true, data: [...]})`
- [x] 4.2 `get_project.js`: resolve project by `args.id` via `Project.byIdentifier` (or equivalent), build detail shape including review metadata and tag IDs, return envelope; throw on not-found with a `NotFoundError` constructor defined at the top of the snippet
- [x] 4.3 `list_folders.js`: iterate `flattenedFolders`, map to summary with full path; return envelope
- [x] 4.4 `get_folder.js`: resolve folder by ID, return detail including child folder IDs and immediate project IDs
- [x] 4.5 `list_tasks.js`: accept `args.scope` discriminated union (`projectId` / `folderId` / `inbox` / `all`), iterate the correct source, map to summary; return envelope
- [x] 4.6 `get_task.js`: resolve task by ID, return full detail including tag IDs
- [x] 4.7 `list_tags.js`: iterate `flattenedTags`, map to summary with full path, parentId, status
- [x] 4.8 `get_tag.js`: resolve tag by ID, return detail including child tag IDs
- [x] 4.9 `resolve_name.js`: accept `args.type`, `args.query`, optional `args.scope`; walk the relevant flat list, match by exact name (and path suffix if scope given), return array of candidates with `{id, name, path, type}`; never throw on zero matches
- [x] 4.10 Add a shared helper comment block at the top of each snippet documenting the paste-to-console procedure

## 5. MCP tools (src/tools/)

- [x] 5.1 `listProjects.ts`: zod input schema (empty object), handler invokes `runSnippet("list_projects", {})`, validates output against `z.array(ProjectSummary)`, returns
- [x] 5.2 `getProject.ts`: input `{id}`, handler invokes `runSnippet("get_project", {id})`, validates `ProjectDetail`
- [x] 5.3 `listFolders.ts`: empty input, returns `z.array(FolderSummary)`
- [x] 5.4 `getFolder.ts`: input `{id}`, returns `FolderDetail`
- [x] 5.5 `listTasks.ts`: input discriminated union (`{projectId} | {folderId} | {inbox: true} | {all: true}`) with zod `discriminatedUnion` or refinement rejecting mutual exclusivity, returns `z.array(TaskSummary)`
- [x] 5.6 `getTask.ts`: input `{id}`, returns `TaskDetail`
- [x] 5.7 `listTags.ts`: empty input, returns `z.array(TagSummary)`
- [x] 5.8 `getTag.ts`: input `{id}`, returns `TagDetail`
- [x] 5.9 `resolveName.ts`: input `{type, query, scope?}`, returns `z.array(ResolveCandidate)`
- [x] 5.10 Export a `tools` barrel from `src/tools/index.ts` listing all nine tool definitions

## 6. MCP server entrypoint

- [x] 6.1 `src/server.ts`: construct an `@modelcontextprotocol/sdk` server, register all nine tools from the barrel, wire stdio transport, start listening
- [x] 6.2 Add `bin` field to `package.json` pointing at the compiled entrypoint and a `scripts.start` for development via `tsx`

## 7. Unit tests (test/unit/)

- [x] 7.1 `snippetLoader.test.ts`: golden-file test that loading each snippet in `src/snippets/` succeeds and contains exactly one `__ARGS__`; contract-violation tests for zero/multiple placeholders (using fixture files)
- [x] 7.2 `resultProtocol.test.ts`: parses well-formed success envelope, parses well-formed error envelope, rejects malformed JSON, selects first parseable line when preceded by chatter
- [x] 7.3 `bridge.injection.test.ts`: given a snippet template and args containing apostrophes, quotes, backslashes, newlines, and emoji, assert the generated script source is valid JavaScript (parse via `new Function`) and that evaluating it recovers the original args object unchanged — proves Decision 2 structurally
- [x] 7.4 `schemas.test.ts`: round-trip validation for each shared schema; rejection tests for the `sequential`-as-string and `items`-as-JSON-string regression patterns at the boundary
- [x] 7.5 `tools.listTasks.test.ts`: rejects mutually exclusive scope combinations at the zod boundary before any bridge call

## 8. Integration test harness (test/integration/)

- [x] 8.1 `fixtures.ts`: `createTestFolder()` generates `__MCP_TEST_<uuid>__` top-level folder via the bridge; `cleanupTestFolder(id)` removes it; `withTestFolder(fn)` helper wraps a test body
- [x] 8.2 `preflight.ts`: detects OmniFocus sync status (via a read-only snippet that inspects the relevant setting); throws unless `MCP_TEST_ALLOW_SYNC=1` is set; invoked once in the vitest global setup
- [x] 8.3 `vitest.integration.config.ts`: separate vitest config for integration with `pool: "forks"`, `maxConcurrency: 1`, `globalSetup: ./preflight.ts`, `testMatch: test/integration/**`
- [x] 8.4 Integration test: `listProjects.int.test.ts` creates a fixture folder with a child project, calls the real bridge, asserts the fixture project appears in the result with the correct folder path
- [x] 8.5 Integration test: `getTask.int.test.ts` creates a fixture task with an apostrophe and unicode in its name, retrieves by ID, asserts name survives round-trip — proves Decision 2 end-to-end
- [x] 8.6 Integration test: `resolveName.int.test.ts` creates two fixture projects with identical names under different folders, asserts `resolve_name` returns both candidates with distinct paths
- [x] 8.7 Add a `scripts.test:integration` in `package.json` guarded by macOS check
- [x] 8.8 Add a `scripts.test:cleanup-fixtures` that scans for stale `__MCP_TEST_*` folders and removes them

## 9. Documentation

- [x] 9.1 Expand `README.md` with: prerequisites (macOS, OmniFocus running), install, MCP client configuration snippet, the list of tools delivered in this change, the loud warning about integration tests mutating real data and the sync preflight
- [x] 9.2 Add `CONTRIBUTING.md` documenting the snippet authoring rules (the `__ARGS__` placeholder, no other interpolation, paste-to-console workflow) and the forbidden-scripting-dictionary rule from execution-runtime spec

## 10. Verification

- [x] 10.1 Run `npm run typecheck` (or `tsc --noEmit`) clean
- [x] 10.2 Run `npm run test` (unit suite) clean
- [x] 10.3 Manually run integration suite against a real OmniFocus with sync disabled; verify fixture folder is created and torn down
- [x] 10.4 Manually connect the server to an MCP client (Claude Desktop or equivalent) and invoke each of the nine tools against a real database; verify results match the spec scenarios
- [x] 10.5 Confirm all spec scenarios in `specs/execution-runtime/spec.md` and `specs/identity-resolution/spec.md` have corresponding test coverage (unit + integration)
