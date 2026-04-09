import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema } from "../schemas/index.js";

const DeleteFolderInput = z.object({
  id: IdSchema.describe("The folder's id.primaryKey"),
});

const DeleteFolderResult = z.object({ id: z.string() });

export async function deleteFolderHandler(
  input: z.infer<typeof DeleteFolderInput>
): Promise<z.infer<typeof DeleteFolderResult>> {
  const raw = await runSnippet("delete_folder", { id: input.id });
  return DeleteFolderResult.parse(raw);
}

export const deleteFolderTool = {
  name: "delete_folder",
  description:
    "Permanently and recursively delete an OmniFocus folder. THIS ACTION CANNOT BE UNDONE. The ENTIRE subtree is destroyed: all child folders, all projects within those folders, and all tasks within those projects. Before calling this tool you MUST ask the user to explicitly confirm they want to permanently delete the folder and all of its contents.",
  inputSchema: DeleteFolderInput,
  handler: deleteFolderHandler,
} as const;
