## Why

`list_tasks` returns a `TaskSummary` that omits `deferDate` and `plannedDate`, and `ListTasksFilter` has no way to filter on either field. This makes it impossible to perform scheduling migrations (e.g., "find all tasks with a defer date and convert them to planned dates") or answer basic Forecast-style queries without an expensive N+1 loop of `get_task` calls.

## What Changes

- Add `deferDate` and `plannedDate` to `TaskSummary` so list results include enough scheduling context to act on tasks without fetching each one individually
- Add `hasDeferDate: true` filter to `ListTasksFilter` so callers can retrieve only tasks that have a defer date set
- Update `list_tasks.js` snippet to return the new fields and apply the new filter

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `task-filtering`: `TaskSummary` gains `deferDate` and `plannedDate`; `ListTasksFilter` gains `hasDeferDate`
- `task-management`: `TaskSummary` schema change affects all tools that return task lists

## Impact

- `src/schemas/shapes.ts`: `TaskSummary` and `ListTasksFilter`
- `src/snippets/list_tasks.js`: return new fields, apply new filter
- Any caller consuming `TaskSummary` — additive change, no breakage
