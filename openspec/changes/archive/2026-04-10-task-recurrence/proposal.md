## Why

OmniFocus tasks support repeat intervals, but the MCP server has no way to set, edit, or read repetition rules — forcing users to manually configure recurrence in OmniFocus after every task creation. This gap means AI-driven task creation is incomplete for any workflow that involves repeating tasks.

## What Changes

- `create_task`: add optional `repetitionRule` field to set recurrence at creation time
- `edit_task`: add optional `repetitionRule` field (nullable to clear recurrence) on existing tasks
- `get_task` / `TaskDetail`: return current `repetitionRule` as structured fields (or null if none)
- New `RepetitionRuleInput` and `RepetitionRuleDetail` schemas covering the OmniFocus UI surface: frequency, interval, optional days-of-week (weekly only), and repeat method

## Capabilities

### New Capabilities

- `recurrence`: Requirements for reading and writing OmniFocus task repetition rules (frequency, interval, daysOfWeek, method). Note: the `recurrence` spec already exists as a placeholder — this change fills it in.

### Modified Capabilities

- `task-write`: `create_task` and `edit_task` gain a `repetitionRule` parameter
- `task-management`: `get_task` returns `repetitionRule` in `TaskDetail`

## Impact

- `src/schemas/shapes.ts`: new `RepetitionRuleInput` and `RepetitionRuleDetail` types; `CreateTaskInput`, `EditTaskInput`, `TaskDetail` extended
- `src/schemas/index.ts`: new exports
- `src/snippets/create_task.js`, `edit_task.js`, `get_task.js`: snippet updates
- No breaking changes — all new fields are optional; existing callers unaffected
