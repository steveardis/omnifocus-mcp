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
    "Create a new task. Placement: omit projectId and parentTaskId for inbox; provide projectId to add to a project; provide parentTaskId to create a subtask. Providing both projectId and parentTaskId is an error. deferDate/plannedDate/dueDate accept either a full ISO datetime or a bare date (YYYY-MM-DD); a bare date resolves to local midnight, so deferring to today makes the task Available immediately rather than only from a fixed UTC hour. sequential controls whether this task's own subtasks must be completed in order (omit to leave OmniFocus's default of parallel, i.e. all children Available at once).",
  inputSchema: CreateTaskInput,
  handler: createTaskHandler,
} as const;
