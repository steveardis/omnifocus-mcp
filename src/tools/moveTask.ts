import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { MoveTaskInput, TaskSummary } from "../schemas/index.js";

export type MoveTaskInputType = z.infer<typeof MoveTaskInput>;

export async function moveTaskHandler(
  input: MoveTaskInputType
): Promise<z.infer<typeof TaskSummary>> {
  const raw = await runSnippet("move_task", input);
  return TaskSummary.parse(raw);
}

export const moveTaskTool = {
  name: "move_task",
  description:
    "Move a task to a different project (making it a top-level task) or make it a subtask of another task. Exactly one of projectId or parentTaskId must be provided. Throws a not-found error if any ID does not exist.",
  inputSchema: MoveTaskInput,
  handler: moveTaskHandler,
} as const;
