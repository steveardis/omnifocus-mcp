## Why

`list_tasks` currently returns all tasks in scope with no filtering — an LLM asking "what's overdue?" on a large database receives thousands of tasks and must reason over the entire set. Filtering in the snippet before the JXA bridge means the LLM only sees the relevant tasks, making planning queries fast and practical.

## What Changes

- `list_tasks` accepts an optional `filter` object: `flagged`, `status` (array), `tagId`, `dueBeforeDate`
- `list_tasks` accepts an optional `limit` (default 200)
- **BREAKING**: Default behavior changes — when no `status` filter is given, complete and dropped tasks are excluded. Pass `status: ["complete"]` explicitly to retrieve completed tasks.
- `TaskSummary` is enriched with `dueDate` and `tagIds` fields so the LLM can reason about results without fetching full task detail for each match

## Capabilities

### New Capabilities
- `task-filtering`: Filter parameters and enriched summary for `list_tasks`

### Modified Capabilities
- `task-management`: `list_tasks` tool signature changes (new filter/limit params, enriched return shape, changed default behavior)

## Impact

- `src/snippets/list_tasks.js` — rewritten to apply filters and return enriched fields
- `src/schemas/shapes.ts` — `TaskSummary` gains `dueDate` and `tagIds`; new `ListTasksFilter` schema
- `src/tools/listTasks.ts` — input schema updated with filter and limit
- `test/unit/tools.listTasks.test.ts` — existing unit tests may need updating for new schema shape
- `test/integration/listTasks.int.test.ts` — new integration tests for filter combinations
