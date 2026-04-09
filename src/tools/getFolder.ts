import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { IdSchema, FolderDetail } from "../schemas/index.js";

export const getFolderSchema = z.object({
  id: IdSchema.describe("The folder's id.primaryKey"),
});

export type GetFolderInput = z.infer<typeof getFolderSchema>;

export async function getFolderHandler(
  input: GetFolderInput
): Promise<z.infer<typeof FolderDetail>> {
  const raw = await runSnippet("get_folder", { id: input.id });
  return FolderDetail.parse(raw);
}

export const getFolderTool = {
  name: "get_folder",
  description:
    "Get full detail for a folder by its stable ID. Returns path, parentId, status, child folder IDs, and immediate project IDs.",
  inputSchema: getFolderSchema,
  handler: getFolderHandler,
} as const;
