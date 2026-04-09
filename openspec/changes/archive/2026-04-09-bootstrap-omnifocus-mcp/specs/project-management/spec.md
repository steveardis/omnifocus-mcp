## ADDED Requirements

### Requirement: List projects

The system SHALL provide a `list_projects` tool that returns every project in the OmniFocus database as an array of summaries, each containing at minimum `{id, name, folderPath, status, type}`. The `status` field SHALL be one of `"active" | "onHold" | "done" | "dropped"`. The `type` field SHALL be one of `"parallel" | "sequential" | "singleActions"`. The `folderPath` field SHALL use the canonical ` ▸ ` separator and SHALL be an empty string for projects at the top level with no containing folder.

#### Scenario: All projects are returned with canonical fields
- **WHEN** `list_projects` is called with no arguments
- **THEN** the tool returns every project in the database, each with id, name, folderPath, status, and type populated using the canonical enum values

#### Scenario: Single Actions list is reported with correct type
- **WHEN** the database contains a Single Actions list project
- **THEN** that project appears in the result with `type: "singleActions"`, never as `"parallel"` or `"sequential"`

### Requirement: Get project by ID

The system SHALL provide a `get_project` tool that accepts `{id: string}` and returns the full detail record of the named project, including `{id, name, note, folderPath, status, type, flagged, deferDate, dueDate, completionDate, reviewInterval, nextReviewDate, lastReviewDate, tagIds}`. If no project exists with that ID, the tool SHALL return a structured not-found error.

#### Scenario: Existing project returns full detail
- **WHEN** `get_project` is called with the ID of an existing project
- **THEN** the tool returns the project's full detail record

#### Scenario: Missing project returns not-found error
- **WHEN** `get_project` is called with an ID that does not correspond to any project
- **THEN** the tool returns a structured error with a not-found code
