## ADDED Requirements

### Requirement: Capability declared

The `settings` capability SHALL cover reading OmniFocus application settings and preferences where the OmniJS API exposes them. Write access SHALL be limited to the subset of settings that OmniJS documents as writable; the specific writable keys SHALL be enumerated when the `settings` change is drafted. Requirements for individual tools SHALL be added by that change.

#### Scenario: Capability is named and scoped
- **WHEN** a future change proposes adding settings tools
- **THEN** it lands requirements under this capability, with an explicit enumeration of writable keys vs read-only keys
