import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema, TaskDetail } from "../schemas/index.js";

const completeTaskSchema = z.object({
  id: IdSchema.describe("The task's id.primaryKey"),
});

export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;

export async function completeTaskHandler(
  input: CompleteTaskInput
): Promise<z.infer<typeof TaskDetail>> {
  const raw = await runSnippet("complete_task", { id: input.id });
  return TaskDetail.parse(raw);
}

export const completeTaskTool = {
  name: "complete_task",
  description: "Mark a task complete by its stable ID. Returns the updated task detail.",
  inputSchema: completeTaskSchema,
  handler: completeTaskHandler,
} as const;
