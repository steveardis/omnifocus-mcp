## ADDED Requirements

### Requirement: Filter list_projects results

The system SHALL allow `list_projects` to accept an optional `filter` object that restricts which projects are returned. All filter fields are optional and combine as AND conditions. When `filter.status` is omitted, the tool SHALL exclude projects with status `done` or `dropped` by default.

Filter fields:
- `status` (array of ProjectStatus): return only projects whose status is in the array; overrides the default exclusion of done/dropped
- `folderId` (string): return only projects within the specified folder or any of its descendant folders; throws not-found if the folder ID does not exist
- `flagged` (boolean): when `true`, return only flagged projects

#### Scenario: Default excludes done and dropped projects
- **WHEN** `list_projects` is called with no filter
- **THEN** the tool returns only projects with status `active` or `onHold`

#### Scenario: Filter by status array
- **WHEN** `list_projects` is called with `{ filter: { status: ["active"] } }`
- **THEN** the tool returns only active projects

#### Scenario: Explicit status filter retrieves done projects
- **WHEN** `list_projects` is called with `{ filter: { status: ["done"] } }`
- **THEN** the tool returns completed projects (the default exclusion does not apply)

#### Scenario: Filter by folderId returns projects in subtree
- **WHEN** `list_projects` is called with `{ filter: { folderId: "abc123" } }`
- **THEN** the tool returns only projects whose parent folder chain includes the specified folder

#### Scenario: Non-existent folderId returns not-found error
- **WHEN** `list_projects` is called with a `folderId` that does not correspond to any folder
- **THEN** the tool returns a structured not-found error

#### Scenario: Filter by flagged
- **WHEN** `list_projects` is called with `{ filter: { flagged: true } }`
- **THEN** the tool returns only flagged projects, excluding done and dropped projects

#### Scenario: Combined filters act as AND
- **WHEN** `list_projects` is called with `{ filter: { status: ["active"], flagged: true } }`
- **THEN** the tool returns only projects that are both active AND flagged

### Requirement: Limit list_projects results

The system SHALL allow `list_projects` to accept an optional `limit` integer that caps the number of projects returned. When `limit` is omitted, a default of 100 SHALL apply.

#### Scenario: Default limit of 100
- **WHEN** `list_projects` is called without a `limit` and more than 100 projects match
- **THEN** the tool returns at most 100 projects

#### Scenario: Custom limit
- **WHEN** `list_projects` is called with `{ limit: 20 }`
- **THEN** the tool returns at most 20 projects

### Requirement: Enriched project summary includes flagged and folderId

The `ProjectSummary` returned by `list_projects` SHALL include `flagged` (boolean) and `folderId` (string or null) in addition to existing fields. `folderId` SHALL be the direct parent folder's `id.primaryKey`, or `null` for top-level projects.

#### Scenario: Summary includes flagged
- **WHEN** `list_projects` returns a flagged project
- **THEN** the project summary includes `flagged: true`

#### Scenario: Summary includes folderId for nested project
- **WHEN** `list_projects` returns a project inside a folder
- **THEN** the project summary includes `folderId` set to the parent folder's ID

#### Scenario: Summary includes folderId null for top-level project
- **WHEN** `list_projects` returns a top-level project with no containing folder
- **THEN** the project summary includes `folderId: null`
