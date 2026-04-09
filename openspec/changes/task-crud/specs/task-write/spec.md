## ADDED Requirements

### Requirement: Create task

The system SHALL provide a `create_task` tool that creates a new OmniFocus task and returns its full detail record. The tool SHALL accept `{name: string, note?: string, flagged?: boolean, deferDate?: string, dueDate?: string, estimatedMinutes?: number, projectId?: string, parentTaskId?: string, tagIds?: string[]}`. Placement SHALL be determined as follows: if both `projectId` and `parentTaskId` are provided the tool SHALL return an error; if only `projectId` is provided the task is placed at the project root; if only `parentTaskId` is provided the task is created as a subtask inheriting its parent's project; if neither is provided the task is placed in the inbox.

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

### Requirement: Edit task

The system SHALL provide an `edit_task` tool that modifies an existing task and returns its updated full detail record. The tool SHALL accept `{id: string}` plus any subset of `{name?: string, note?: string, flagged?: boolean, deferDate?: string | null, dueDate?: string | null, estimatedMinutes?: number | null, tagIds?: string[]}`. Fields omitted from the call SHALL be left unchanged. When `tagIds` is provided it SHALL replace the task's entire tag set; when omitted, tags SHALL be unchanged. Passing `null` for a date or `estimatedMinutes` SHALL clear the field.

#### Scenario: Edit a single field
- **WHEN** `edit_task` is called with `{id: "abc123", flagged: true}`
- **THEN** only the `flagged` field is changed; all other fields retain their previous values

#### Scenario: Replace tag set
- **WHEN** `edit_task` is called with `{id: "abc123", tagIds: ["t1", "t2"]}`
- **THEN** the task's tags are set to exactly `["t1", "t2"]`, replacing any previously assigned tags

#### Scenario: Clear a date field
- **WHEN** `edit_task` is called with `{id: "abc123", dueDate: null}`
- **THEN** the task's due date is cleared

#### Scenario: Non-existent task returns not-found error
- **WHEN** `edit_task` is called with an ID that does not correspond to any task
- **THEN** the tool returns a structured not-found error

#### Scenario: Non-existent tag ID returns not-found error
- **WHEN** `edit_task` is called with a `tagIds` array containing an ID that does not correspond to any tag
- **THEN** the tool returns a structured not-found error and the task is not modified

### Requirement: Complete task

The system SHALL provide a `complete_task` tool that marks an existing task complete using OmniJS `markComplete()` and returns the task's updated full detail record.

#### Scenario: Complete an existing task
- **WHEN** `complete_task` is called with the ID of an available task
- **THEN** the task's status becomes `"complete"` and the tool returns the updated detail record

#### Scenario: Non-existent task returns not-found error
- **WHEN** `complete_task` is called with an ID that does not correspond to any task
- **THEN** the tool returns a structured not-found error

### Requirement: Drop task

The system SHALL provide a `drop_task` tool that marks an existing task dropped using OmniJS `drop()` and returns the task's updated full detail record.

#### Scenario: Drop an existing task
- **WHEN** `drop_task` is called with the ID of an available task
- **THEN** the task's status becomes `"dropped"` and the tool returns the updated detail record

#### Scenario: Non-existent task returns not-found error
- **WHEN** `drop_task` is called with an ID that does not correspond to any task
- **THEN** the tool returns a structured not-found error

### Requirement: Delete task

The system SHALL provide a `delete_task` tool that permanently deletes a task and all its subtasks using OmniJS `deleteObject()`. The tool description SHALL instruct the AI to confirm with the user before invoking this tool, noting that deletion is permanent and includes all subtasks.

#### Scenario: Delete an existing task
- **WHEN** `delete_task` is called with the ID of an existing task
- **THEN** the task and all its subtasks are permanently removed from OmniFocus and the tool returns a confirmation envelope

#### Scenario: Delete task with subtasks removes all children
- **WHEN** `delete_task` is called with the ID of a task that has subtasks
- **THEN** the task and all descendant subtasks are deleted

#### Scenario: Non-existent task returns not-found error
- **WHEN** `delete_task` is called with an ID that does not correspond to any task
- **THEN** the tool returns a structured not-found error
