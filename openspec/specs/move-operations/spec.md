## Requirements

### Requirement: Move task to a new container

The system SHALL provide a `move_task` tool that accepts `{id: string, projectId?: string, parentTaskId?: string}` and moves the specified task to the given container. Exactly one of `projectId` or `parentTaskId` SHALL be provided; if both or neither are given, the tool SHALL return a validation error. When `projectId` is provided, the task SHALL become a top-level task in that project. When `parentTaskId` is provided, the task SHALL become a direct subtask of that task. The tool SHALL return a structured not-found error if any of the IDs do not correspond to existing objects.

#### Scenario: Move task to a project
- **WHEN** `move_task` is called with `{id: "t1", projectId: "p2"}`
- **THEN** the task appears as a top-level task in project p2 and is no longer in its previous container

#### Scenario: Make task a subtask
- **WHEN** `move_task` is called with `{id: "t1", parentTaskId: "t2"}`
- **THEN** the task becomes a direct child of task t2

#### Scenario: Both destinations provided is a validation error
- **WHEN** `move_task` is called with both `projectId` and `parentTaskId`
- **THEN** the tool returns a validation error before any snippet executes

#### Scenario: Non-existent task ID returns not-found error
- **WHEN** `move_task` is called with an ID that does not correspond to any task
- **THEN** the tool returns a structured not-found error

### Requirement: Move project to a folder

The system SHALL provide a `move_project` tool that accepts `{id: string, folderId: string | null}` and moves the specified project to the given folder. When `folderId` is `null`, the project SHALL be moved to the top level (no containing folder). The tool SHALL return a structured not-found error if the project ID or folder ID does not correspond to an existing object.

#### Scenario: Move project to a folder
- **WHEN** `move_project` is called with `{id: "p1", folderId: "f2"}`
- **THEN** the project is now contained within folder f2

#### Scenario: Move project to top level
- **WHEN** `move_project` is called with `{id: "p1", folderId: null}`
- **THEN** the project has no parent folder

#### Scenario: Non-existent project ID returns not-found error
- **WHEN** `move_project` is called with a project ID that does not exist
- **THEN** the tool returns a structured not-found error

#### Scenario: Non-existent folder ID returns not-found error
- **WHEN** `move_project` is called with a folderId that does not correspond to any folder
- **THEN** the tool returns a structured not-found error
