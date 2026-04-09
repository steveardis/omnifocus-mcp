# folder-management

## Purpose

Defines tools for reading and listing OmniFocus folders, including full folder listing and detail retrieval by ID.

## Requirements

### Requirement: List folders

The system SHALL provide a `list_folders` tool that returns every folder in the OmniFocus database as an array of summaries, each containing at minimum `{id, name, path, parentId, status}`. The `path` field SHALL use the canonical ` ▸ ` separator and SHALL equal the folder's name for top-level folders. The `parentId` field SHALL be `null` for top-level folders. The `status` field SHALL be one of `"active" | "dropped"`.

#### Scenario: All folders are returned with full paths
- **WHEN** `list_folders` is called with no arguments
- **THEN** the tool returns every folder in the database including nested folders, each with its full ancestor path

#### Scenario: Top-level folders have null parent
- **WHEN** a folder exists at the root of the folder hierarchy
- **THEN** its summary carries `parentId: null` and `path` equal to its name

### Requirement: Get folder by ID

The system SHALL provide a `get_folder` tool that accepts `{id: string}` and returns the full detail record of the named folder, including `{id, name, path, parentId, status, childFolderIds, projectIds}`. If no folder exists with that ID, the tool SHALL return a structured not-found error.

#### Scenario: Existing folder returns full detail with children
- **WHEN** `get_folder` is called with the ID of an existing folder
- **THEN** the tool returns the folder's full detail including the IDs of its immediate child folders and immediate child projects

#### Scenario: Missing folder returns not-found error
- **WHEN** `get_folder` is called with an ID that does not correspond to any folder
- **THEN** the tool returns a structured error with a not-found code
