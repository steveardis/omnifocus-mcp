## Why

OmniFocus 4 has three distinct date concepts — defer, planned, and due — but the MCP server only exposes `deferDate` and `dueDate`. The missing `plannedDate` is the soft "when I intend to work on this" date that shows up in Forecast view without hiding the task or triggering overdue status. This is the right date type for many recurring tasks (e.g., cleaning, reviews) where you want Forecast visibility without hard-deadline pressure.

The OmniJS API already exposes `task.plannedDate` as a fully readable, writable, and clearable property — no API barrier.

## What Changes

- `create_task`: add optional `plannedDate` field
- `edit_task`: add optional `plannedDate` field (nullable to clear)
- `get_task` / `TaskDetail`: return `plannedDate` in the detail record
- All snippets returning `TaskDetail` (`complete_task`, `drop_task`) include `plannedDate`

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `task-write`: `create_task` and `edit_task` gain a `plannedDate` parameter
- `task-management`: `get_task` returns `plannedDate` in `TaskDetail`

## Impact

- `src/schemas/shapes.ts`: `CreateTaskInput`, `EditTaskInput`, `TaskDetail` extended
- `src/snippets/create_task.js`, `edit_task.js`, `get_task.js`, `complete_task.js`, `drop_task.js`: add `plannedDate` field
- No breaking changes — all new fields are optional; existing callers unaffected
