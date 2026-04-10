## MODIFIED Requirements

### Requirement: List projects

The system SHALL provide a `list_projects` tool that returns projects in the OmniFocus database as an array of summaries, each containing `{id, name, folderPath, folderId, status, type, flagged}`. The `status` field SHALL be one of `"active" | "onHold" | "done" | "dropped"`. The `type` field SHALL be one of `"parallel" | "sequential" | "singleActions"`. The `folderPath` field SHALL use the canonical ` ▸ ` separator and SHALL be an empty string for top-level projects. The `folderId` field SHALL be the direct parent folder's ID or `null` for top-level projects. The tool SHALL accept an optional `filter` object (see project-filtering spec) and an optional `limit` integer (default 100). When no `filter.status` is provided, projects with status `done` or `dropped` SHALL be excluded by default.

#### Scenario: Active and on-hold projects returned by default
- **WHEN** `list_projects` is called with no arguments
- **THEN** the tool returns only projects with status `active` or `onHold`, each with id, name, folderPath, folderId, status, type, and flagged populated

#### Scenario: Single Actions list is reported with correct type
- **WHEN** the database contains a Single Actions list project
- **THEN** that project appears in the result with `type: "singleActions"`, never as `"parallel"` or `"sequential"`
