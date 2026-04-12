## Why

`EditTaskInput` uses `z.string().datetime().nullable()` for date fields, which Zod serializes to `anyOf: [{type: "string"}, {type: "null"}]` in JSON Schema. Claude Desktop cannot pass `null` through `anyOf` fields — the same bug we fixed for `repetitionRule` — so clearing a defer, planned, or due date via `edit_task` is impossible in practice.

## What Changes

- Remove `.nullable()` from `deferDate`, `plannedDate`, and `dueDate` in `EditTaskInput`
- Add `clearDeferDate: z.literal(true).optional()`, `clearPlannedDate: z.literal(true).optional()`, `clearDueDate: z.literal(true).optional()` flags
- Update `edit_task.js` snippet to handle the new clear flags
- Update spec scenarios to reflect the new clearing API

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `task-write`: Clearing date fields on `edit_task` now uses explicit `clearDeferDate`, `clearPlannedDate`, `clearDueDate` flags instead of passing `null`

## Impact

- `src/schemas/shapes.ts`: `EditTaskInput` date field definitions
- `src/snippets/edit_task.js`: Date clearing logic
- `openspec/specs/task-write/spec.md`: Scenarios for clearing date fields updated
- **BREAKING** for any callers passing `null` for date fields in `edit_task` (workaround was already broken, so practical impact is zero)
