import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema } from "../schemas/index.js";

const DeleteProjectInput = z.object({
  id: IdSchema.describe("The project's id.primaryKey"),
});

const DeleteProjectResult = z.object({ id: z.string() });

export async function deleteProjectHandler(
  input: z.infer<typeof DeleteProjectInput>
): Promise<z.infer<typeof DeleteProjectResult>> {
  const raw = await runSnippet("delete_project", { id: input.id });
  return DeleteProjectResult.parse(raw);
}

export const deleteProjectTool = {
  name: "delete_project",
  description:
    "Permanently delete a project and ALL its tasks. THIS ACTION CANNOT BE UNDONE. Before calling this tool you MUST ask the user to explicitly confirm they want to permanently delete the project, and inform them that all tasks within the project will also be deleted.",
  inputSchema: DeleteProjectInput,
  handler: deleteProjectHandler,
} as const;
