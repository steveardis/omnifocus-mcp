## MODIFIED Requirements

### Requirement: Create task

The system SHALL provide a `create_task` tool that creates a new OmniFocus task and returns its full detail record. The tool SHALL accept `{name: string, note?: string, flagged?: boolean, deferDate?: string, plannedDate?: string, dueDate?: string, estimatedMinutes?: number, projectId?: string, parentTaskId?: string, tagIds?: string[], repetitionRule?: RepetitionRuleInput}`. Placement SHALL be determined as follows: if both `projectId` and `parentTaskId` are provided the tool SHALL return an error; if only `projectId` is provided the task is placed at the project root; if only `parentTaskId` is provided the task is created as a subtask inheriting its parent's project; if neither is provided the task is placed in the inbox. When `repetitionRule` is provided, the task SHALL have the specified recurrence set at creation.

#### Scenario: Create inbox task
- **WHEN** `create_task` is called with `{name: "Buy milk"}` and no `projectId` or `parentTaskId`
- **THEN** the tool creates the task in the OmniFocus inbox and returns its full detail record including a stable `id`

#### Scenario: Create task in a project
- **WHEN** `create_task` is called with `{name: "Write tests", projectId: "abc123"}`
- **THEN** the tool creates the task at the root of the specified project and returns its full detail record

#### Scenario: Create subtask
- **WHEN** `create_task` is called with `{name: "Review PR", parentTaskId: "xyz789"}`
- **THEN** the tool creates the task as a child of the specified parent task and returns its full detail record

#### Scenario: Ambiguous placement is rejected
- **WHEN** `create_task` is called with both `projectId` and `parentTaskId`
- **THEN** the tool returns a validation error before any snippet executes

#### Scenario: Non-existent project returns not-found error
- **WHEN** `create_task` is called with a `projectId` that does not correspond to any project
- **THEN** the tool returns a structured not-found error

#### Scenario: Create task with repetition rule
- **WHEN** `create_task` is called with `{ name: "Weekly review", repetitionRule: { frequency: "weekly", interval: 1, method: "start" } }`
- **THEN** the task is created with the specified recurrence and the returned TaskDetail includes the parsed repetitionRule

#### Scenario: Create task with planned date
- **WHEN** `create_task` is called with `{ name: "Clean kitchen", plannedDate: "2026-04-15T09:00:00Z" }`
- **THEN** the task is created with the specified planned date and the returned TaskDetail includes `plannedDate`

### Requirement: Edit task

The system SHALL provide an `edit_task` tool that modifies an existing task and returns its updated full detail record. The tool SHALL accept `{id: string}` plus any subset of `{name?: string, note?: string, flagged?: boolean, deferDate?: string | null, plannedDate?: string | null, dueDate?: string | null, estimatedMinutes?: number | null, tagIds?: string[], repetitionRule?: RepetitionRuleInput | null}`. Fields omitted from the call SHALL be left unchanged. When `tagIds` is provided it SHALL replace the task's entire tag set; when omitted, tags SHALL be unchanged. Passing `null` for a date or `estimatedMinutes` SHALL clear the field. Passing `repetitionRule: null` SHALL clear the task's recurrence; passing a `RepetitionRuleInput` object SHALL set or replace the recurrence; omitting `repetitionRule` SHALL leave the existing recurrence unchanged.

#### Scenario: Edit a single field
- **WHEN** `edit_task` is called with `{id: "abc123", flagged: true}`
- **THEN** only the `flagged` field is changed; all other fields retain their previous values

#### Scenario: Replace tag set
- **WHEN** `edit_task` is called with `{id: "abc123", tagIds: ["t1", "t2"]}`
- **THEN** the task's tags are set to exactly `["t1", "t2"]`, replacing any previously assigned tags

#### Scenario: Clear a date field
- **WHEN** `edit_task` is called with `{id: "abc123", dueDate: null}`
- **THEN** the task's due date is cleared

#### Scenario: Clear planned date
- **WHEN** `edit_task` is called with `{id: "abc123", plannedDate: null}`
- **THEN** the task's planned date is cleared

#### Scenario: Non-existent task returns not-found error
- **WHEN** `edit_task` is called with an ID that does not correspond to any task
- **THEN** the tool returns a structured not-found error

#### Scenario: Non-existent tag ID returns not-found error
- **WHEN** `edit_task` is called with a `tagIds` array containing an ID that does not correspond to any tag
- **THEN** the tool returns a structured not-found error and the task is not modified

#### Scenario: Set repetition via edit
- **WHEN** `edit_task` is called with `{ id: "t1", repetitionRule: { frequency: "monthly", interval: 1, method: "dueDate" } }`
- **THEN** the task's recurrence is set and all other fields are unchanged

#### Scenario: Clear repetition via edit
- **WHEN** `edit_task` is called with `{ id: "t1", repetitionRule: null }`
- **THEN** the task's recurrence is cleared and all other fields are unchanged
