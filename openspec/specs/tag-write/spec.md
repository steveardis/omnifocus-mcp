## ADDED Requirements

### Requirement: Create tag

The system SHALL provide a `create_tag` tool that creates a new OmniFocus tag and returns its full detail record. The tool SHALL accept `{name: string, parentTagId?: string}`. If `parentTagId` is provided the tag SHALL be created nested under that tag; otherwise it SHALL be created at the top level.

#### Scenario: Create top-level tag
- **WHEN** `create_tag` is called with `{name: "Waiting"}` and no `parentTagId`
- **THEN** the tool creates the tag at the top level and returns its full detail record including a stable `id`

#### Scenario: Create child tag
- **WHEN** `create_tag` is called with `{name: "Email", parentTagId: "abc123"}`
- **THEN** the tool creates the tag nested under the specified parent tag and returns its full detail record with `path` and `parentId` set correctly

#### Scenario: Non-existent parent tag returns not-found error
- **WHEN** `create_tag` is called with a `parentTagId` that does not correspond to any tag
- **THEN** the tool returns a structured not-found error

### Requirement: Edit tag

The system SHALL provide an `edit_tag` tool that modifies an existing tag and returns its updated full detail record. The tool SHALL accept `{id: string}` plus any subset of `{name?: string, status?: "active" | "onHold" | "dropped"}`. Fields omitted SHALL be left unchanged.

#### Scenario: Rename a tag
- **WHEN** `edit_tag` is called with `{id: "abc123", name: "Delegated"}`
- **THEN** the tag's name is updated and the tool returns the updated detail record

#### Scenario: Put tag on hold
- **WHEN** `edit_tag` is called with `{id: "abc123", status: "onHold"}`
- **THEN** the tag's status becomes `"onHold"` and the tool returns the updated detail record

#### Scenario: Non-existent tag returns not-found error
- **WHEN** `edit_tag` is called with an ID that does not correspond to any tag
- **THEN** the tool returns a structured not-found error

### Requirement: Delete tag

The system SHALL provide a `delete_tag` tool that permanently deletes a tag and all its child tags using OmniJS `deleteObject()`. Tasks and projects that held the tag have it removed automatically by OmniFocus. The tool description SHALL instruct the AI to confirm with the user before invoking, noting that child tags are also deleted.

#### Scenario: Delete a tag
- **WHEN** `delete_tag` is called with the ID of an existing tag
- **THEN** the tag is permanently removed from OmniFocus, all tasks that held it have it removed, and the tool returns a confirmation envelope

#### Scenario: Delete tag with children removes entire subtree
- **WHEN** `delete_tag` is called with the ID of a tag that has child tags
- **THEN** the tag and all its descendant tags are deleted

#### Scenario: Non-existent tag returns not-found error
- **WHEN** `delete_tag` is called with an ID that does not correspond to any tag
- **THEN** the tool returns a structured not-found error
