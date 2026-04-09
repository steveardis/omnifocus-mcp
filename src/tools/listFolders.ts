import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { FolderSummary } from "../schemas/index.js";

export const listFoldersSchema = z.object({});

export type ListFoldersInput = z.infer<typeof listFoldersSchema>;

export async function listFoldersHandler(
  _input: ListFoldersInput
): Promise<z.infer<typeof FolderSummary>[]> {
  const raw = await runSnippet("list_folders", {});
  return z.array(FolderSummary).parse(raw);
}

export const listFoldersTool = {
  name: "list_folders",
  description:
    "List all folders in OmniFocus. Returns id, name, full path (ancestors joined with ▸), parentId, and status for every folder.",
  inputSchema: listFoldersSchema,
  handler: listFoldersHandler,
} as const;
