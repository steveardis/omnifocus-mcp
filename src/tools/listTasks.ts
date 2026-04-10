import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema, TaskSummary, ListTasksFilter } from "../schemas/index.js";

const ScopeSchema = z
  .object({
    projectId: IdSchema.optional(),
    folderId: IdSchema.optional(),
    inbox: z.literal(true).optional(),
    all: z.literal(true).optional(),
  })
  .refine(
    (s) => {
      const keys = [s.projectId, s.folderId, s.inbox, s.all].filter(
        (v) => v !== undefined
      );
      return keys.length === 1;
    },
    {
      message:
        "Exactly one of projectId, folderId, inbox, or all must be provided",
    }
  );

export const listTasksSchema = z.object({
  scope: ScopeSchema.describe(
    "Exactly one of: projectId (string), folderId (string), inbox (true), or all (true)"
  ),
  filter: ListTasksFilter.optional().describe(
    "Optional filters. All fields combine as AND. When status is omitted, complete and dropped tasks are excluded by default."
  ),
  limit: z.number().int().positive().optional().describe(
    "Maximum number of tasks to return. Defaults to 200."
  ),
});

export type ListTasksInput = z.infer<typeof listTasksSchema>;

export async function listTasksHandler(
  input: ListTasksInput
): Promise<z.infer<typeof TaskSummary>[]> {
  const raw = await runSnippet("list_tasks", {
    scope: input.scope,
    filter: input.filter,
    limit: input.limit,
  });
  return z.array(TaskSummary).parse(raw);
}

export const listTasksTool = {
  name: "list_tasks",
  description:
    "List tasks in OmniFocus within a scope. Provide exactly one of: projectId (tasks in a project), folderId (tasks across all projects in a folder), inbox (inbox tasks), or all (every task). By default, complete and dropped tasks are excluded — pass filter.status to override. Optional filter fields: flagged (boolean), status (array of status strings), tagId (string), dueBeforeDate (ISO datetime). Results are capped at limit (default 200). Each returned task includes dueDate and tagIds.",
  inputSchema: listTasksSchema,
  handler: listTasksHandler,
} as const;
