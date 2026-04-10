## 1. Schema changes (src/schemas/)

- [x] 1.1 Define `RepetitionRuleInput` zod schema: `{ frequency, interval (default 1), daysOfWeek?, method }` with `.refine()` that daysOfWeek is only valid when frequency is "weekly"
- [x] 1.2 Define `RepetitionRuleDetail` zod schema: `{ frequency, interval, daysOfWeek?, method }` (no refine needed — read-only)
- [x] 1.3 Add `repetitionRule: RepetitionRuleInput.optional()` to `CreateTaskInput`
- [x] 1.4 Add `repetitionRule: RepetitionRuleInput.nullable().optional()` to `EditTaskInput`
- [x] 1.5 Add `repetitionRule: RepetitionRuleDetail.nullable()` to `TaskDetail`
- [x] 1.6 Export `RepetitionRuleInput` and `RepetitionRuleDetail` from `src/schemas/index.ts`

## 2. Snippet updates (src/snippets/)

- [x] 2.1 Update `create_task.js`: after task creation, if `args.repetitionRule` is provided, construct RRULE string from frequency/interval/daysOfWeek and call `Task.RepetitionRule.make(rrule, method)`; include `repetitionRule` in returned TaskDetail
- [x] 2.2 Update `edit_task.js`: if `args.repetitionRule === null` assign `task.repetitionRule = null`; if `args.repetitionRule` is an object, construct and assign the rule; if `args.repetitionRule` is undefined, leave unchanged; include `repetitionRule` in returned TaskDetail
- [x] 2.3 Update `get_task.js`: read `task.repetitionRule`; if null return `null`; otherwise parse `ruleString` (extract FREQ, INTERVAL, BYDAY via string ops) and map method enum to string; return structured `repetitionRule` field

## 3. Helper: RRULE construction and parsing

- [x] 3.1 In `create_task.js` and `edit_task.js`: implement `buildRrule(rule)` helper that produces the RRULE string — `FREQ=X;INTERVAL=N` plus `BYDAY=MO,WE,...` when daysOfWeek is present
- [x] 3.2 In `create_task.js`, `edit_task.js`, and `get_task.js`: implement `parseRepetitionRule(rule)` helper that reads `rule.ruleString` and `rule.method`, extracts FREQ/INTERVAL/BYDAY via string split, maps back to structured fields

## 4. Unit tests (test/unit/)

- [x] 4.1 Add schema tests for `RepetitionRuleInput`: valid daily; valid weekly with daysOfWeek; valid monthly; valid yearly; invalid daysOfWeek on non-weekly frequency rejected; interval must be positive integer
- [x] 4.2 Add schema tests for extended `CreateTaskInput`: valid with repetitionRule; valid without (backward compat)
- [x] 4.3 Add schema tests for extended `EditTaskInput`: valid with repetitionRule object; valid with repetitionRule null (clear); valid omitting repetitionRule (unchanged)

## 5. Integration tests (test/integration/)

- [x] 5.1 `taskRecurrence.int.test.ts`: create task with daily repetition; verify get_task returns repetitionRule with frequency "daily"
- [x] 5.2 `taskRecurrence.int.test.ts`: create task with weekly repetition on Mon/Wed/Fri; verify get_task returns correct daysOfWeek
- [x] 5.3 `taskRecurrence.int.test.ts`: edit existing task to add monthly repetition; verify get_task reflects new rule
- [x] 5.4 `taskRecurrence.int.test.ts`: edit task to clear repetition (null); verify get_task returns repetitionRule: null
- [x] 5.5 `taskRecurrence.int.test.ts`: create task without repetitionRule; verify get_task returns repetitionRule: null (backward compat)

## 6. Verification

- [x] 6.1 `npm run typecheck` clean
- [x] 6.2 `npm test` (unit suite) clean
- [x] 6.3 Manually run integration suite
