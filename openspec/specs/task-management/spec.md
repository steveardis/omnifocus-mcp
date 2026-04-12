# task-management

## Purpose

Defines tools for reading and listing OmniFocus tasks, including scoped listing and full detail retrieval by ID.

## Requirements

### Requirement: List tasks with scope filter

The system SHALL provide a `list_tasks` tool that returns tasks within a caller-specified scope. The scope SHALL be one of: `{projectId: string}`, `{folderId: string}` (all tasks in projects under that folder, recursively), `{inbox: true}`, or `{all: true}` (the full flattened task list). The tool SHALL accept an optional `filter` object (see task-filtering spec) and an optional `limit` integer (default 200). The tool SHALL return an array of task summaries, each containing `{id, name, status, flagged, containerId, containerType, dueDate, deferDate, plannedDate, tagIds}`. When no `filter.status` is provided, tasks with status `complete` or `dropped` SHALL be excluded by default.

#### Scenario: List tasks in a specific project
- **WHEN** `list_tasks` is called with `{projectId: "abc123"}`
- **THEN** the tool returns actionable tasks (non-complete, non-dropped) directly or transitively contained in that project, each carrying the project id as `containerId` and `"project"` as `containerType`

#### Scenario: List inbox tasks
- **WHEN** `list_tasks` is called with `{inbox: true}`
- **THEN** the tool returns actionable inbox tasks with `containerType` set to `"inbox"`

#### Scenario: Invalid scope is rejected at the TS boundary
- **WHEN** `list_tasks` is called with `{projectId: "abc", inbox: true}` (mutually exclusive scopes)
- **THEN** the tool returns a validation error before any snippet executes

### Requirement: Get task by ID

The system SHALL provide a `get_task` tool that accepts `{id: string}` and returns the full detail record of the named task, including `{id, name, note, status, flagged, deferDate, plannedDate, dueDate, completionDate, estimatedMinutes, containerId, containerType, tagIds, parentTaskId, repetitionRule}`. The `plannedDate` field SHALL be `null` when no planned date is set. The `parentTaskId` field SHALL be `null` for top-level tasks and SHALL contain the parent task's `id.primaryKey` for subtasks. The `repetitionRule` field SHALL be `null` when no repetition rule is set, and SHALL be a structured object with `{frequency, interval, daysOfWeek?, method}` when a rule exists. If no task exists with that ID, the tool SHALL return a structured not-found error.

#### Scenario: Existing task returns full detail
- **WHEN** `get_task` is called with the ID of an existing task
- **THEN** the tool returns the task's full detail record including all scalar fields, the list of tag IDs assigned to it, `parentTaskId`, `repetitionRule`, and `plannedDate`

#### Scenario: Subtask includes parentTaskId
- **WHEN** `get_task` is called with the ID of a subtask
- **THEN** the returned record includes `parentTaskId` set to the parent task's stable ID

#### Scenario: Task without repetition returns null repetitionRule
- **WHEN** `get_task` is called for a task with no repetition rule
- **THEN** the returned TaskDetail includes `repetitionRule: null`

#### Scenario: Task with repetition returns structured repetitionRule
- **WHEN** `get_task` is called for a task that has a repetition rule
- **THEN** the returned TaskDetail includes `repetitionRule` with `frequency`, `interval`, `method`, and `daysOfWeek` (if applicable)

#### Scenario: Task with planned date returns plannedDate
- **WHEN** `get_task` is called for a task that has a planned date set
- **THEN** the returned TaskDetail includes `plannedDate` as an ISO datetime string

#### Scenario: Missing task returns not-found error
- **WHEN** `get_task` is called with an ID that does not correspond to any task
- **THEN** the tool returns a structured error with a not-found code and does not throw an unhandled exception
