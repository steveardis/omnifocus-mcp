import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { EditProjectInput, ProjectDetail } from "../schemas/index.js";

export type EditProjectInputType = z.infer<typeof EditProjectInput>;

export async function editProjectHandler(
  input: EditProjectInputType
): Promise<z.infer<typeof ProjectDetail>> {
  const raw = await runSnippet("edit_project", input);
  return ProjectDetail.parse(raw);
}

export const editProjectTool = {
  name: "edit_project",
  description:
    "Edit an existing project. Only provided fields are changed. Pass null for deferDate, dueDate, or reviewInterval to clear them. When tagIds is provided it replaces the full tag set.",
  inputSchema: EditProjectInput,
  handler: editProjectHandler,
} as const;
