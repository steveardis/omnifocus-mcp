import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { CreateFolderInput, FolderDetail } from "../schemas/index.js";

export type CreateFolderInputType = z.infer<typeof CreateFolderInput>;

export async function createFolderHandler(
  input: CreateFolderInputType
): Promise<z.infer<typeof FolderDetail>> {
  const raw = await runSnippet("create_folder", input);
  return FolderDetail.parse(raw);
}

export const createFolderTool = {
  name: "create_folder",
  description:
    "Create a new OmniFocus folder. Omit parentFolderId to create at the top level; provide parentFolderId to nest it inside an existing folder.",
  inputSchema: CreateFolderInput,
  handler: createFolderHandler,
} as const;
