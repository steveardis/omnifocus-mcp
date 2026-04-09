# task-management

## Purpose

Defines tools for reading and listing OmniFocus tasks, including scoped listing and full detail retrieval by ID.

## Requirements

### Requirement: List tasks with scope filter

The system SHALL provide a `list_tasks` tool that returns tasks within a caller-specified scope. The scope SHALL be one of: `{projectId: string}`, `{folderId: string}` (all tasks in projects under that folder, recursively), `{inbox: true}`, or `{all: true}` (the full flattened task list). The tool SHALL return an array of task summaries, each containing at minimum `{id, name, status, flagged, containerId, containerType}`.

#### Scenario: List tasks in a specific project
- **WHEN** `list_tasks` is called with `{projectId: "abc123"}`
- **THEN** the tool returns every task directly or transitively contained in that project, with each element carrying the project id as `containerId` and `"project"` as `containerType`

#### Scenario: List inbox tasks
- **WHEN** `list_tasks` is called with `{inbox: true}`
- **THEN** the tool returns every task in the OmniFocus inbox with `containerType` set to `"inbox"`

#### Scenario: Invalid scope is rejected at the TS boundary
- **WHEN** `list_tasks` is called with `{projectId: "abc", inbox: true}` (mutually exclusive scopes)
- **THEN** the tool returns a validation error before any snippet executes

### Requirement: Get task by ID

The system SHALL provide a `get_task` tool that accepts `{id: string}` and returns the full detail record of the named task, including `{id, name, note, status, flagged, deferDate, dueDate, completionDate, estimatedMinutes, containerId, containerType, tagIds}`. If no task exists with that ID, the tool SHALL return a structured not-found error.

#### Scenario: Existing task returns full detail
- **WHEN** `get_task` is called with the ID of an existing task
- **THEN** the tool returns the task's full detail record including all scalar fields and the list of tag IDs assigned to it

#### Scenario: Missing task returns not-found error
- **WHEN** `get_task` is called with an ID that does not correspond to any task
- **THEN** the tool returns a structured error with a not-found code and does not throw an unhandled exception
