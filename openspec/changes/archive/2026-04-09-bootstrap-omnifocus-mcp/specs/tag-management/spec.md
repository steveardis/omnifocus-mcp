## ADDED Requirements

### Requirement: List tags

The system SHALL provide a `list_tags` tool that returns every tag in the OmniFocus database as an array of summaries, each containing at minimum `{id, name, path, parentId, status}`. Tags form a tree in OmniFocus; the `path` field SHALL use the canonical ` ▸ ` separator and represent the full ancestor chain. The `parentId` field SHALL be `null` for top-level tags. The `status` field SHALL be one of `"active" | "onHold" | "dropped"`.

#### Scenario: All tags are returned including nested tags
- **WHEN** `list_tags` is called with no arguments
- **THEN** the tool returns every tag in the database, top-level and nested, each with its full path and correct parentId

#### Scenario: On-hold tag is reported with correct status
- **WHEN** the database contains a tag that has been placed on hold
- **THEN** that tag appears in the result with `status: "onHold"`

### Requirement: Get tag by ID

The system SHALL provide a `get_tag` tool that accepts `{id: string}` and returns the full detail record of the named tag, including `{id, name, path, parentId, status, childTagIds}`. If no tag exists with that ID, the tool SHALL return a structured not-found error.

#### Scenario: Existing tag returns full detail
- **WHEN** `get_tag` is called with the ID of an existing tag
- **THEN** the tool returns the tag's full detail including the IDs of its immediate child tags

#### Scenario: Missing tag returns not-found error
- **WHEN** `get_tag` is called with an ID that does not correspond to any tag
- **THEN** the tool returns a structured error with a not-found code
