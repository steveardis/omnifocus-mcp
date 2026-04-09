# url-automation

## Purpose

Covers `omnifocus://` URL construction and parsing. Individual tools will be defined in the `url-automation` change.

## Requirements

### Requirement: Capability declared

The `url-automation` capability SHALL cover `omnifocus://` URL construction (including task-paste format for bulk creation, add-to-inbox URLs, and deep links to entities by ID) and parsing of incoming `omnifocus://` URLs into structured form. Requirements for individual tools SHALL be added by the `url-automation` change.

#### Scenario: Capability is named and scoped
- **WHEN** a future change proposes adding URL-automation tools
- **THEN** it lands requirements under this capability rather than inventing a new capability name
