import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema, ProjectDetail } from "../schemas/index.js";

const DropProjectInput = z.object({
  id: IdSchema.describe("The project's id.primaryKey"),
});

export async function dropProjectHandler(
  input: z.infer<typeof DropProjectInput>
): Promise<z.infer<typeof ProjectDetail>> {
  const raw = await runSnippet("drop_project", { id: input.id });
  return ProjectDetail.parse(raw);
}

export const dropProjectTool = {
  name: "drop_project",
  description: "Mark a project as dropped. Returns the updated project detail.",
  inputSchema: DropProjectInput,
  handler: dropProjectHandler,
} as const;
