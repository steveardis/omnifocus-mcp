import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema, ProjectDetail } from "../schemas/index.js";

const CompleteProjectInput = z.object({
  id: IdSchema.describe("The project's id.primaryKey"),
});

export async function completeProjectHandler(
  input: z.infer<typeof CompleteProjectInput>
): Promise<z.infer<typeof ProjectDetail>> {
  const raw = await runSnippet("complete_project", { id: input.id });
  return ProjectDetail.parse(raw);
}

export const completeProjectTool = {
  name: "complete_project",
  description: "Mark a project as done (complete). Returns the updated project detail.",
  inputSchema: CompleteProjectInput,
  handler: completeProjectHandler,
} as const;
