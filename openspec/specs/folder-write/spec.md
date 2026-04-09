## ADDED Requirements

### Requirement: Create folder

The system SHALL provide a `create_folder` tool that creates a new OmniFocus folder and returns its full detail record. The tool SHALL accept `{name: string, parentFolderId?: string}`. If `parentFolderId` is provided the folder SHALL be created nested inside that folder; otherwise it SHALL be created at the top level.

#### Scenario: Create top-level folder
- **WHEN** `create_folder` is called with `{name: "Work"}` and no `parentFolderId`
- **THEN** the tool creates the folder at the top level and returns its full detail record including a stable `id`

#### Scenario: Create nested folder
- **WHEN** `create_folder` is called with `{name: "Active", parentFolderId: "abc123"}`
- **THEN** the tool creates the folder inside the specified parent folder and returns its full detail record with `path` reflecting the full ancestor chain

#### Scenario: Non-existent parent folder returns not-found error
- **WHEN** `create_folder` is called with a `parentFolderId` that does not correspond to any folder
- **THEN** the tool returns a structured not-found error

### Requirement: Edit folder

The system SHALL provide an `edit_folder` tool that renames an existing folder and returns its updated full detail record. The tool SHALL accept `{id: string, name: string}`.

#### Scenario: Rename a folder
- **WHEN** `edit_folder` is called with `{id: "abc123", name: "Personal"}`
- **THEN** the folder's name is updated and the tool returns the updated detail record with the new name reflected in `path`

#### Scenario: Non-existent folder returns not-found error
- **WHEN** `edit_folder` is called with an ID that does not correspond to any folder
- **THEN** the tool returns a structured not-found error

### Requirement: Delete folder

The system SHALL provide a `delete_folder` tool that permanently and recursively deletes a folder, all child folders, all projects within those folders, and all tasks within those projects. The tool description SHALL instruct the AI to confirm with the user before invoking, explicitly stating that the entire subtree — child folders, projects, and all tasks — is permanently deleted and cannot be undone.

#### Scenario: Delete a folder and all its contents
- **WHEN** `delete_folder` is called with the ID of an existing folder
- **THEN** the folder, all descendant folders, all projects within those folders, and all tasks within those projects are permanently removed from OmniFocus and the tool returns a confirmation envelope

#### Scenario: Delete empty folder
- **WHEN** `delete_folder` is called with the ID of a folder that contains no projects or child folders
- **THEN** the folder is removed and the tool returns a confirmation envelope

#### Scenario: Non-existent folder returns not-found error
- **WHEN** `delete_folder` is called with an ID that does not correspond to any folder
- **THEN** the tool returns a structured not-found error
