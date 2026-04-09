# identity-resolution

## Purpose

Defines how OmniFocus entities are addressed and resolved — canonical ID addressing, name/path-based lookup with ambiguity reporting, and the folder path format.

## Requirements

### Requirement: Canonical ID addressing

The system SHALL use `id.primaryKey` as the canonical identifier for every addressable OmniFocus entity (Task, Project, Folder, Tag, Perspective). Every read tool SHALL return an `id` field carrying this value. Every write tool (in this and future changes) SHALL accept an `id` parameter as its primary addressing mode.

#### Scenario: Read tools return primary key
- **WHEN** a caller invokes `list_projects`
- **THEN** every returned element has an `id` field equal to the OmniJS expression `project.id.primaryKey` for that project

#### Scenario: IDs are stable within a session
- **WHEN** a caller reads a project's ID via `list_projects`, then reads the same project again via `get_project` using that ID
- **THEN** the second read succeeds and returns the same project, without re-resolving by name

### Requirement: Name and path resolution with ambiguity reporting

The system SHALL provide a `resolve_name` tool that accepts `{type, query, scope?}` and returns a list of candidate entities `[{id, name, path, type, ...}]`. When more than one entity matches the query, the tool SHALL return all matches and SHALL NOT silently pick a winner. The caller is responsible for disambiguating.

#### Scenario: Unique match returns single candidate
- **WHEN** `resolve_name` is called with `{type: "project", query: "Q4 Planning"}` and exactly one project has that name
- **THEN** the tool returns a list with one element containing the project's id, name, and full folder path

#### Scenario: Ambiguous match returns all candidates
- **WHEN** `resolve_name` is called with `{type: "project", query: "Inbox Cleanup"}` and two projects have that name under different folders
- **THEN** the tool returns a list with both candidates, each carrying a distinct id and distinct folder path

#### Scenario: No match returns empty list
- **WHEN** `resolve_name` is called with a query that matches no entity of the requested type
- **THEN** the tool returns an empty list and does not throw an error

#### Scenario: Path-qualified query narrows scope
- **WHEN** `resolve_name` is called with `{type: "folder", query: "Acme", scope: "Work ▸ Clients"}`
- **THEN** the tool returns only folders named "Acme" that are direct or transitive children of the folder at path "Work ▸ Clients"

### Requirement: Folder path addressing

The system SHALL represent folder paths as strings using the separator ` ▸ ` (U+25B8 with surrounding spaces) and SHALL support resolving a folder by its full path as an alternative to its ID. When a path is ambiguous (the same path exists under multiple roots, which cannot occur for folders but can for tags), the resolution SHALL report the ambiguity through `resolve_name`.

#### Scenario: Folder resolves by full path
- **WHEN** `resolve_name` is called with `{type: "folder", query: "Work ▸ Clients ▸ Acme"}`
- **THEN** the tool returns the folder whose full ancestor chain matches that path exactly

#### Scenario: Returned paths use the canonical separator
- **WHEN** any read tool returns a folder path or a project's containing folder path
- **THEN** the path uses ` ▸ ` as the separator between ancestor names
