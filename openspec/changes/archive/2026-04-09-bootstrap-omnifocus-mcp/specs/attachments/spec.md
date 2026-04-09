## ADDED Requirements

### Requirement: Capability declared

The `attachments` capability SHALL cover listing, reading, adding, and removing file attachments on task notes via the OmniJS `FileWrapper` API. The on-wire representation of attachment contents across the MCP boundary (inline base64, filesystem path reference, or a hybrid with a size threshold) SHALL be decided when the `attachments` change is drafted. Requirements for individual tools SHALL be added by that change.

#### Scenario: Capability is named and scoped
- **WHEN** a future change proposes adding attachment tools
- **THEN** it lands requirements under this capability and makes the on-wire encoding decision explicit
