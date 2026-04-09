# Contributing

## Snippet authoring rules

Every OmniFocus operation in this server is implemented as a standalone `.js` file under `src/snippets/`. These rules are invariants — violating them causes the same class of bugs the server was built to eliminate.

### Rule 1: One `__ARGS__` placeholder per snippet, no other interpolation

Every snippet file must contain exactly one occurrence of the token `__ARGS__`. The runtime injects arguments by doing:

```ts
template.replace("__ARGS__", JSON.stringify(args))
```

This is the **only** way user-supplied data enters a snippet. No string concatenation, no template literals constructing JS source, no manual escaping. If you find yourself writing `"'"+someValue+"'"` or `` `const name = "${value}"` `` inside a snippet template, stop — that is the apostrophe/injection bug pattern this architecture was built to eliminate.

Because `JSON.stringify` produces output that is a syntactic subset of JavaScript, the injected args literal is safe for all inputs including apostrophes, double quotes, backslashes, newlines, emoji, and arbitrary unicode.

### Rule 2: Snippets must work standalone

Every snippet must be paste-able into the OmniFocus Automation Console for manual testing. Replace `__ARGS__` with a hand-written object literal:

```js
// Paste this into OmniFocus Automation Console:
const args = { id: "jMBMptE7rJ1" };
// ... rest of the snippet
```

If your snippet cannot be tested this way, it's not a self-contained snippet — refactor until it is. This is what makes the snippets independently verifiable and debuggable.

### Rule 3: Snippets return a JSON string in the result envelope format

Every snippet's last expression must be a JSON string matching:

```js
JSON.stringify({ ok: true, data: <your result> })
```

On error, throw (don't return an error envelope) — the JXA shim catches the exception and constructs the error envelope automatically:

```js
// Good
throw new Error("Project not found: " + args.id);

// Don't do this — the shim handles it
// return JSON.stringify({ ok: false, error: { ... } })
```

The one exception is inline error returns used to avoid the overhead of an exception for expected cases (like "not found" in a list operation). If you do this, use the same envelope shape:

```js
return JSON.stringify({ ok: false, error: { name: "NotFoundError", message: "..." } });
```

### Rule 4: No JXA scripting-dictionary domain methods

The JXA shim uses `Application('OmniFocus').evaluateJavascript()` and nothing else. Inside snippets (which run in OmniJS), you have the full Omni Automation API: `flattenedProjects`, `flattenedTasks`, `flattenedFolders`, `flattenedTags`, `new Project(...)`, `new Folder(...)`, `moveTasks(...)`, etc.

Do **not** use the JXA scripting dictionary for domain operations. Concretely, in the `src/runtime/jxaShim.ts` JXA wrapper, the only call to the OmniFocus application object is `evaluateJavascript`. In snippets themselves, there is no JXA application object — you're inside OmniJS already.

This rule is why the server can do things the prior AppleScript-based server could not: folder creation, Single Actions lists, task moves, stable IDs, and recurrence rules all live in the OmniJS API, not the scripting dictionary.

## Adding a new tool

1. Write the OmniJS snippet as `src/snippets/<tool_name>.js`. Verify it works standalone in the Automation Console.
2. Add the zod input schema and handler to `src/tools/<ToolName>.ts`.
3. Export from `src/tools/index.ts` and add to `allTools`.
4. Add the corresponding spec requirement and scenario to the relevant capability spec file under `openspec/changes/<change-name>/specs/<capability>/spec.md`.
5. Write a unit test for schema validation and a unit test for injection safety if the tool has new parameter types.
6. Write an integration test that exercises the tool against a real OmniFocus instance, scoped to a `withTestFolder` fixture.

## Running tests

```bash
# Unit tests (no OmniFocus required)
npm test

# Integration tests (requires OmniFocus running on macOS)
npm run test:integration

# Clean up stale test fixtures from interrupted runs
npm run test:cleanup-fixtures
```
