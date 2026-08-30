import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema, TaskDetail } from "../schemas/index.js";

export const getTaskSchema = z.object({
  id: IdSchema.describe("The task's id.primaryKey"),
});

export type GetTaskInput = z.infer<typeof getTaskSchema>;

export async function getTaskHandler(
  input: GetTaskInput
): Promise<z.infer<typeof TaskDetail>> {
  const raw = await runSnippet("get_task", { id: input.id });
  return TaskDetail.parse(raw);
}

export const getTaskTool = {
  name: "get_task",
  description:
    "Get full detail for a task by its stable ID. Returns note, status, flagged, defer/due/completion/drop dates, estimated minutes, container info, tag IDs, parentTaskId (null for top-level tasks, set to the parent task's ID for subtasks), and sequential (whether this task's own subtasks must be completed in order).",
  inputSchema: getTaskSchema,
  handler: getTaskHandler,
} as const;
