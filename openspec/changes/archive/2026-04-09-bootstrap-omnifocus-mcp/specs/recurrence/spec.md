## ADDED Requirements

### Requirement: Capability declared

The `recurrence` capability SHALL cover the construction, assignment, reading, and clearing of `Task.RepetitionRule` values on OmniFocus tasks, including the `RepetitionMethod` (`Fixed`, `DueDate`, `Start`, `None`) and the underlying ICS RRULE string. Tools under this capability SHALL expose both a structured schema for common recurrence patterns (frequency, interval, weekday set) and a raw `rrule` escape hatch for patterns the structured schema does not express. Requirements for individual tools SHALL be added by the `recurrence` change. This change only declares the capability and its scope.

#### Scenario: Capability is named and scoped
- **WHEN** a future change proposes adding recurrence-related tools
- **THEN** it lands requirements under this capability rather than inventing a new capability name
