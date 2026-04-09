import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { EditFolderInput, FolderDetail } from "../schemas/index.js";

export type EditFolderInputType = z.infer<typeof EditFolderInput>;

export async function editFolderHandler(
  input: EditFolderInputType
): Promise<z.infer<typeof FolderDetail>> {
  const raw = await runSnippet("edit_folder", input);
  return FolderDetail.parse(raw);
}

export const editFolderTool = {
  name: "edit_folder",
  description: "Rename an existing OmniFocus folder by its ID.",
  inputSchema: EditFolderInput,
  handler: editFolderHandler,
} as const;
