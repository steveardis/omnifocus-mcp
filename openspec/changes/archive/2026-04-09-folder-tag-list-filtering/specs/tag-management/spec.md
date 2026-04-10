## MODIFIED Requirements

### Requirement: List tags

The system SHALL provide a `list_tags` tool that returns tags in the OmniFocus database as an array of summaries, each containing `{id, name, path, parentId, status}`. Tags form a tree in OmniFocus; the `path` field SHALL use the canonical ` ▸ ` separator and represent the full ancestor chain. The `parentId` field SHALL be `null` for top-level tags. The `status` field SHALL be one of `"active" | "onHold" | "dropped"`. The tool SHALL accept an optional `status` filter string and an optional `limit` integer (default 200). When `status` is omitted, all tags are returned regardless of status. When `limit` is omitted, at most 200 tags are returned.

#### Scenario: All tags returned by default
- **WHEN** `list_tags` is called with no arguments
- **THEN** the tool returns all tags (active, onHold, and dropped) up to the limit

#### Scenario: On-hold tag is reported with correct status
- **WHEN** the database contains a tag that has been placed on hold
- **THEN** that tag appears in the result with `status: "onHold"`

#### Scenario: Filter by status returns only matching tags
- **WHEN** `list_tags` is called with `{ filter: { status: "active" } }`
- **THEN** only active tags are returned

#### Scenario: Limit caps the number of returned tags
- **WHEN** `list_tags` is called with `{ limit: 5 }`
- **THEN** at most 5 tags are returned
