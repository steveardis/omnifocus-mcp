## ADDED Requirements

### Requirement: Filter list_tasks results

The system SHALL allow `list_tasks` to accept an optional `filter` object that restricts which tasks are returned. All filter fields are optional and combine as AND conditions. When `filter.status` is omitted, the tool SHALL exclude tasks with status `complete` or `dropped` by default.

Filter fields:
- `flagged` (boolean): when `true`, return only flagged tasks
- `status` (array of TaskStatus): return only tasks whose status is in the array; overrides the default exclusion of complete/dropped
- `tagId` (string): return only tasks that have this tag assigned
- `dueBeforeDate` (ISO datetime string): return only tasks where `dueDate` is non-null and on or before this date

#### Scenario: Filter by flagged
- **WHEN** `list_tasks` is called with `{ scope: { all: true }, filter: { flagged: true } }`
- **THEN** the tool returns only tasks where `flagged` is `true`, excluding complete and dropped tasks

#### Scenario: Filter by status array
- **WHEN** `list_tasks` is called with `{ scope: { all: true }, filter: { status: ["overdue", "dueSoon"] } }`
- **THEN** the tool returns only tasks with status `overdue` or `dueSoon`

#### Scenario: Filter by tagId
- **WHEN** `list_tasks` is called with `{ scope: { projectId: "abc123" }, filter: { tagId: "tag456" } }`
- **THEN** the tool returns only tasks in that project that have the specified tag assigned

#### Scenario: Filter by dueBeforeDate
- **WHEN** `list_tasks` is called with `{ scope: { all: true }, filter: { dueBeforeDate: "2026-04-09T23:59:59Z" } }`
- **THEN** the tool returns only tasks with a non-null dueDate on or before the specified date, excluding complete and dropped tasks

#### Scenario: Default excludes complete and dropped
- **WHEN** `list_tasks` is called with no filter
- **THEN** the tool returns tasks with any status except `complete` and `dropped`

#### Scenario: Explicit status filter overrides default exclusion
- **WHEN** `list_tasks` is called with `{ filter: { status: ["complete"] } }`
- **THEN** the tool returns completed tasks (the default exclusion does not apply)

#### Scenario: Combined filters act as AND
- **WHEN** `list_tasks` is called with `{ filter: { flagged: true, tagId: "tag456" } }`
- **THEN** the tool returns only tasks that are both flagged AND have that tag

### Requirement: Limit list_tasks results

The system SHALL allow `list_tasks` to accept an optional `limit` integer that caps the number of tasks returned. When `limit` is omitted, a default of 200 SHALL apply.

#### Scenario: Default limit of 200
- **WHEN** `list_tasks` is called without a `limit` and more than 200 tasks match
- **THEN** the tool returns at most 200 tasks

#### Scenario: Custom limit
- **WHEN** `list_tasks` is called with `{ limit: 50 }`
- **THEN** the tool returns at most 50 tasks

### Requirement: Enriched task summary includes dueDate and tagIds

The `TaskSummary` returned by `list_tasks` SHALL include `dueDate` (ISO datetime or null) and `tagIds` (array of tag ID strings) in addition to existing fields.

#### Scenario: Summary includes dueDate
- **WHEN** `list_tasks` returns a task that has a due date set
- **THEN** the task summary includes `dueDate` as an ISO datetime string

#### Scenario: Summary includes tagIds
- **WHEN** `list_tasks` returns a task that has tags assigned
- **THEN** the task summary includes `tagIds` as an array of tag ID strings
