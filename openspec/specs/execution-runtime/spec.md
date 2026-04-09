# execution-runtime

## Purpose

Defines the contract for executing OmniFocus domain operations through the OmniJS/JXA bridge, including snippet injection, result protocol, caching, and timeouts.

## Requirements

### Requirement: OmniJS execution via JXA bridge

The system SHALL execute every OmniFocus domain operation inside OmniFocus's OmniJS runtime by invoking `Application('OmniFocus').evaluateJavascript(snippet)` from a JXA host process spawned via `osascript -l JavaScript`. The JXA host SHALL NOT invoke any OmniFocus scripting-dictionary method other than `evaluateJavascript` for domain operations.

#### Scenario: Tool invocation routes through the bridge
- **WHEN** a tool handler invokes the runtime with a snippet and args
- **THEN** the runtime spawns `osascript -l JavaScript`, passes a JXA wrapper that calls `Application('OmniFocus').evaluateJavascript` with the prepared snippet, and awaits stdout

#### Scenario: Scripting-dictionary domain methods are forbidden
- **WHEN** a contributor adds a tool handler that calls e.g. `Application('OmniFocus').defaultDocument.projects` directly
- **THEN** a unit test (or review) flags the call as a runtime-contract violation and the change is rejected

### Requirement: Snippet argument injection via JSON literal

The system SHALL construct executable scripts by replacing exactly one `__ARGS__` placeholder in a static `.js` snippet template with the result of `JSON.stringify(args)`. No other interpolation of user-supplied data into script source is permitted anywhere in the codebase.

#### Scenario: Apostrophes and quotes survive injection
- **WHEN** a tool is invoked with `args = {name: "Finn's \"birthday\""}`
- **THEN** the executed snippet receives `args.name === "Finn's \"birthday\""` and no syntax error occurs

#### Scenario: Unicode and newlines survive injection
- **WHEN** a tool is invoked with `args = {note: "line1\nline2 — emoji 🎯"}`
- **THEN** the executed snippet receives the note verbatim including the newline and unicode code points

#### Scenario: Snippets are standalone and paste-ready
- **WHEN** a developer opens any file under `src/snippets/`
- **THEN** the file is a valid JavaScript program that can be pasted into OmniFocus's Automation Console after replacing `__ARGS__` with a hand-written object literal, with no additional preprocessing required

### Requirement: One-line JSON result protocol

The system SHALL represent every bridge invocation's result as exactly one line of JSON on the JXA host's stdout, matching the envelope `{ok: true, data: <value>} | {ok: false, error: {name: string, message: string, stack?: string}}`. The TypeScript runtime SHALL read stdout, extract the first JSON-parseable line, and return the parsed envelope to the caller. A result envelope with `ok: false` SHALL be thrown as a structured error with the error details preserved.

#### Scenario: Successful operation returns data envelope
- **WHEN** a snippet completes without throwing and its final expression is `JSON.stringify({ok: true, data: {id: "abc"}})`
- **THEN** the TS runtime receives `{ok: true, data: {id: "abc"}}` and returns `{id: "abc"}` to the tool handler

#### Scenario: Snippet exception produces error envelope
- **WHEN** a snippet throws an `Error` with message "not found"
- **THEN** the JXA shim catches the exception, prints `{ok: false, error: {name: "Error", message: "not found", ...}}` as one line on stdout, and the TS runtime throws a structured error carrying the name, message, and stack

#### Scenario: Extraneous stdout chatter does not corrupt results
- **WHEN** any process in the pipeline writes incidental non-JSON output to stdout before the result line
- **THEN** the TS runtime still parses the result envelope correctly by selecting the first complete JSON-parseable line

### Requirement: Snippet loader

The system SHALL load snippet templates from `src/snippets/<name>.js` relative to the compiled server's known snippet root, caching the file contents in memory after the first read. The loader SHALL reject snippets that do not contain exactly one `__ARGS__` token.

#### Scenario: Snippet is loaded and cached
- **WHEN** a tool handler invokes the runtime with snippet name `"list_projects"` twice in the same process
- **THEN** the file `list_projects.js` is read from disk exactly once and the cached content is used for the second invocation

#### Scenario: Snippet with zero placeholders is rejected
- **WHEN** a snippet file contains no `__ARGS__` token
- **THEN** the loader throws a contract violation at load time, not at runtime

#### Scenario: Snippet with multiple placeholders is rejected
- **WHEN** a snippet file contains two or more `__ARGS__` tokens
- **THEN** the loader throws a contract violation at load time

### Requirement: Script timeout

The system SHALL enforce a configurable per-invocation timeout on `osascript` execution, defaulting to 30 seconds, and SHALL terminate the child process and throw a timeout error when exceeded.

#### Scenario: Long-running snippet is terminated
- **WHEN** a snippet runs longer than the configured timeout
- **THEN** the runtime sends SIGTERM to the `osascript` process and throws a timeout error identifying the snippet name and elapsed time
