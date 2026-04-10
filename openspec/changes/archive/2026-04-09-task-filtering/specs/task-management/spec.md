## MODIFIED Requirements

### Requirement: List tasks with scope filter

The system SHALL provide a `list_tasks` tool that returns tasks within a caller-specified scope. The scope SHALL be one of: `{projectId: string}`, `{folderId: string}` (all tasks in projects under that folder, recursively), `{inbox: true}`, or `{all: true}` (the full flattened task list). The tool SHALL accept an optional `filter` object (see task-filtering spec) and an optional `limit` integer (default 200). The tool SHALL return an array of task summaries, each containing `{id, name, status, flagged, containerId, containerType, dueDate, tagIds}`. When no `filter.status` is provided, tasks with status `complete` or `dropped` SHALL be excluded by default.

#### Scenario: List tasks in a specific project
- **WHEN** `list_tasks` is called with `{projectId: "abc123"}`
- **THEN** the tool returns actionable tasks (non-complete, non-dropped) directly or transitively contained in that project, each carrying the project id as `containerId` and `"project"` as `containerType`

#### Scenario: List inbox tasks
- **WHEN** `list_tasks` is called with `{inbox: true}`
- **THEN** the tool returns actionable inbox tasks with `containerType` set to `"inbox"`

#### Scenario: Invalid scope is rejected at the TS boundary
- **WHEN** `list_tasks` is called with `{projectId: "abc", inbox: true}` (mutually exclusive scopes)
- **THEN** the tool returns a validation error before any snippet executes
