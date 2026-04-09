## ADDED Requirements

### Requirement: Capability declared

The `database-inspection` capability SHALL cover scoped, paged, and filtered traversal of the full OmniFocus database, including a `dump_database` tool that accepts `{scope, id?, include, format}` parameters, inbox inspection, and database metadata (name, sync status, object counts). The default behavior of `dump_database` SHALL exclude completed tasks, dropped entities, and task notes to keep payloads manageable; those are opt-in via the `include` parameter. Requirements for individual tools SHALL be added by the `forecast-and-inspection` change.

#### Scenario: Capability is named and scoped
- **WHEN** a future change proposes adding database-inspection tools
- **THEN** it lands requirements under this capability rather than inventing a new capability name
