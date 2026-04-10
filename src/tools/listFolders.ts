import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { FolderSummary, ListFoldersFilter } from "../schemas/index.js";

export const listFoldersSchema = z.object({
  filter: ListFoldersFilter.optional().describe(
    "Optional filter. When status is provided, only folders with that status are returned. When omitted, all folders (active and dropped) are returned."
  ),
  limit: z.number().int().positive().optional().describe(
    "Maximum number of folders to return. Defaults to 200."
  ),
});

export type ListFoldersInput = z.infer<typeof listFoldersSchema>;

export async function listFoldersHandler(
  input: ListFoldersInput
): Promise<z.infer<typeof FolderSummary>[]> {
  const raw = await runSnippet("list_folders", {
    filter: input.filter,
    limit: input.limit,
  });
  return z.array(FolderSummary).parse(raw);
}

export const listFoldersTool = {
  name: "list_folders",
  description:
    "List folders in OmniFocus. By default, all folders (active and dropped) are returned. Optional filter.status ('active' | 'dropped') restricts to that status. Results are capped at limit (default 200). Each folder includes id, name, full path (ancestors joined with ▸), parentId, and status.",
  inputSchema: listFoldersSchema,
  handler: listFoldersHandler,
} as const;
