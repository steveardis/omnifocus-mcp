## MODIFIED Requirements

### Requirement: List folders

The system SHALL provide a `list_folders` tool that returns folders in the OmniFocus database as an array of summaries, each containing `{id, name, path, parentId, status}`. The `path` field SHALL use the canonical ` ▸ ` separator and SHALL equal the folder's name for top-level folders. The `parentId` field SHALL be `null` for top-level folders. The `status` field SHALL be one of `"active" | "dropped"`. The tool SHALL accept an optional `status` filter string and an optional `limit` integer (default 200). When `status` is omitted, all folders are returned regardless of status. When `limit` is omitted, at most 200 folders are returned.

#### Scenario: All folders returned by default
- **WHEN** `list_folders` is called with no arguments
- **THEN** the tool returns all folders (active and dropped) up to the limit

#### Scenario: Top-level folders have null parent
- **WHEN** a folder exists at the root of the folder hierarchy
- **THEN** its summary carries `parentId: null` and `path` equal to its name

#### Scenario: Filter by status returns only matching folders
- **WHEN** `list_folders` is called with `{ filter: { status: "active" } }`
- **THEN** only active folders are returned

#### Scenario: Limit caps the number of returned folders
- **WHEN** `list_folders` is called with `{ limit: 5 }`
- **THEN** at most 5 folders are returned
