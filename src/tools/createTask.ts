import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { CreateTaskInput, TaskDetail } from "../schemas/index.js";

export type CreateTaskInputType = z.infer<typeof CreateTaskInput>;

export async function createTaskHandler(
  input: CreateTaskInputType
): Promise<z.infer<typeof TaskDetail>> {
  const raw = await runSnippet("create_task", input);
  return TaskDetail.parse(raw);
}

export const createTaskTool = {
  name: "create_task",
  description:
    "Create a new task. Placement: omit projectId and parentTaskId for inbox; provide projectId to add to a project; provide parentTaskId to create a subtask. Providing both projectId and parentTaskId is an error.",
  inputSchema: CreateTaskInput,
  handler: createTaskHandler,
} as const;
