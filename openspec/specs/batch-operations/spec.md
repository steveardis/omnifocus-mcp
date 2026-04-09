# batch-operations

## Purpose

Covers batch variants of every mutating tool with typed-array validation, partial-success semantics, and single-snippet execution. Individual tools will be defined in the `batch-operations` change.

## Requirements

### Requirement: Capability declared

The `batch-operations` capability SHALL cover batch variants of every mutating tool (create, update, delete, move, complete, assign). Batch tools SHALL accept strictly typed arrays validated at the TypeScript boundary (never serialized JSON strings) and SHALL return a per-item result array with partial-success semantics: each element is an `{ok, data?, error?}` envelope carrying that item's outcome independent of other items. Batch tools SHALL execute as a single OmniJS snippet that iterates internally, not as a loop of per-item bridge invocations. Requirements for individual batch tools SHALL be added by the `batch-operations` change.

#### Scenario: Capability is named and semantics are fixed
- **WHEN** a future change proposes adding batch tools
- **THEN** it lands requirements under this capability with typed-array validation and partial-success result semantics as invariants
