import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema } from "../schemas/index.js";

const DeleteTagInput = z.object({
  id: IdSchema.describe("The tag's id.primaryKey"),
});

const DeleteTagResult = z.object({ id: z.string() });

export async function deleteTagHandler(
  input: z.infer<typeof DeleteTagInput>
): Promise<z.infer<typeof DeleteTagResult>> {
  const raw = await runSnippet("delete_tag", { id: input.id });
  return DeleteTagResult.parse(raw);
}

export const deleteTagTool = {
  name: "delete_tag",
  description:
    "Permanently delete an OmniFocus tag. THIS ACTION CANNOT BE UNDONE. All child tags are also deleted, and all tasks/projects that held this tag have it removed automatically. Before calling this tool you MUST ask the user to explicitly confirm they want to permanently delete the tag and all its child tags.",
  inputSchema: DeleteTagInput,
  handler: deleteTagHandler,
} as const;
