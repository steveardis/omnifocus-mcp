import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema, TaskDetail } from "../schemas/index.js";

const dropTaskSchema = z.object({
  id: IdSchema.describe("The task's id.primaryKey"),
});

export type DropTaskInput = z.infer<typeof dropTaskSchema>;

export async function dropTaskHandler(
  input: DropTaskInput
): Promise<z.infer<typeof TaskDetail>> {
  const raw = await runSnippet("drop_task", { id: input.id });
  return TaskDetail.parse(raw);
}

export const dropTaskTool = {
  name: "drop_task",
  description: "Mark a task dropped by its stable ID. Returns the updated task detail.",
  inputSchema: dropTaskSchema,
  handler: dropTaskHandler,
} as const;
