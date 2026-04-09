import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema, TaskSummary } from "../schemas/index.js";

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
});

export type ListTasksInput = z.infer<typeof listTasksSchema>;

export async function listTasksHandler(
  input: ListTasksInput
): Promise<z.infer<typeof TaskSummary>[]> {
  const raw = await runSnippet("list_tasks", { scope: input.scope });
  return z.array(TaskSummary).parse(raw);
}

export const listTasksTool = {
  name: "list_tasks",
  description:
    "List tasks in OmniFocus within a scope. Provide exactly one of: projectId (tasks in a project), folderId (tasks across all projects in a folder), inbox (inbox tasks), or all (every task).",
  inputSchema: listTasksSchema,
  handler: listTasksHandler,
} as const;
