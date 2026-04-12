import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { EditTaskInput, TaskDetail } from "../schemas/index.js";

export type EditTaskInputType = z.infer<typeof EditTaskInput>;

export async function editTaskHandler(
  input: EditTaskInputType
): Promise<z.infer<typeof TaskDetail>> {
  const raw = await runSnippet("edit_task", input);
  return TaskDetail.parse(raw);
}

export const editTaskTool = {
  name: "edit_task",
  description:
    "Edit an existing task by its stable ID. Only fields included in the call are changed; omitted fields are left unchanged. When tagIds is provided it replaces the full tag set. To clear a date field, pass clearDeferDate, clearPlannedDate, or clearDueDate set to true. Pass null for estimatedMinutes to clear it. To set a repetition rule, pass repetitionRule with frequency/interval/method. To clear repetition, pass clearRepetitionRule: true.",
  inputSchema: EditTaskInput,
  handler: editTaskHandler,
} as const;
