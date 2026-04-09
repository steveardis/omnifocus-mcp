# perspective-management

## Purpose

Covers listing built-in and custom perspectives, reading perspective metadata, and activating a perspective in a document window. Individual tools will be defined in the `perspectives-and-windows` change.

## Requirements

### Requirement: Capability declared

The `perspective-management` capability SHALL cover listing built-in and custom perspectives, reading perspective metadata, and activating a perspective in a document window. Custom perspective *creation and editing* are a non-goal pending verification of OmniJS scriptability of `Perspective.Custom` definitions; if a future investigation proves the API is available, the non-goal may be revisited by a later change. Requirements for individual tools SHALL be added by the `perspectives-and-windows` change.

#### Scenario: Capability is named and scoped
- **WHEN** a future change proposes adding perspective tools
- **THEN** it lands requirements under this capability rather than inventing a new capability name
