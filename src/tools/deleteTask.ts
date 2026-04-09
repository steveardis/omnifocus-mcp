import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema } from "../schemas/index.js";

const deleteTaskSchema = z.object({
  id: IdSchema.describe("The task's id.primaryKey"),
});

export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;

const DeleteTaskResult = z.object({ id: IdSchema });

export async function deleteTaskHandler(
  input: DeleteTaskInput
): Promise<z.infer<typeof DeleteTaskResult>> {
  const raw = await runSnippet("delete_task", { id: input.id });
  return DeleteTaskResult.parse(raw);
}

export const deleteTaskTool = {
  name: "delete_task",
  description:
    "Permanently delete a task and all its subtasks. THIS ACTION CANNOT BE UNDONE. Before calling this tool you MUST ask the user to explicitly confirm they want to permanently delete the task, and inform them that all subtasks will also be deleted.",
  inputSchema: deleteTaskSchema,
  handler: deleteTaskHandler,
} as const;
