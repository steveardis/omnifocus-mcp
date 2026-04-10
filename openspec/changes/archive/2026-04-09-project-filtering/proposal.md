## Why

`list_projects` currently returns every project in the database with no filtering. Users with years of OmniFocus history may have hundreds of completed (`done`) and dropped projects, making it impractical for an LLM to identify what's actually active. Applying the same filter-in-snippet pattern established by task-filtering gives the LLM a useful, scoped view of the project list.

## What Changes

- `list_projects` accepts an optional `filter` object: `status` (array), `folderId` (recursive subtree), `flagged`
- `list_projects` accepts an optional `limit` (default 100)
- **BREAKING**: Default behavior changes — when no `status` filter is given, `done` and `dropped` projects are excluded. Pass `status: ["done"]` explicitly to retrieve completed projects.
- `ProjectSummary` is enriched with `flagged` (boolean) and `folderId` (string | null — the direct parent folder's ID) so the LLM can reason about results without fetching full project detail

## Capabilities

### New Capabilities
- `project-filtering`: Filter parameters and enriched summary for `list_projects`

### Modified Capabilities
- `project-management`: `list_projects` tool signature changes (new filter/limit params, enriched return shape, changed default behavior)

## Impact

- `src/snippets/list_projects.js` — rewritten to apply filters and return enriched fields
- `src/schemas/shapes.ts` — `ProjectSummary` gains `flagged` and `folderId`; new `ListProjectsFilter` schema
- `src/tools/listProjects.ts` — input schema updated with filter and limit
- `test/unit/` — schema tests for new filter type
- `test/integration/listProjectsFiltered.int.test.ts` — new integration tests for filter combinations
