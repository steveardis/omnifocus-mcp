## ADDED Requirements

### Requirement: Capability declared

The `window-state` capability SHALL cover read-only inspection of OmniFocus document window state, including the currently active window, active perspective, sidebar selection, and content selection. Window *mutation* (resize, close, focus, open) is an explicit non-goal. Requirements for individual tools SHALL be added by the `perspectives-and-windows` change.

#### Scenario: Capability is named and read-only scope is fixed
- **WHEN** a future change proposes adding window-state tools
- **THEN** it lands read-only requirements under this capability; any mutation proposal requires first revisiting the non-goal in design
