import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { ProjectSummary, ListProjectsFilter } from "../schemas/index.js";

export const listProjectsSchema = z.object({
  filter: ListProjectsFilter.optional().describe(
    "Optional filters. All fields combine as AND. When status is omitted, done and dropped projects are excluded by default."
  ),
  limit: z.number().int().positive().optional().describe(
    "Maximum number of projects to return. Defaults to 100."
  ),
});

export type ListProjectsInput = z.infer<typeof listProjectsSchema>;

export async function listProjectsHandler(
  input: ListProjectsInput
): Promise<z.infer<typeof ProjectSummary>[]> {
  const raw = await runSnippet("list_projects", {
    filter: input.filter,
    limit: input.limit,
  });
  return z.array(ProjectSummary).parse(raw);
}

export const listProjectsTool = {
  name: "list_projects",
  description:
    "List projects in OmniFocus. By default, done and dropped projects are excluded — pass filter.status to override. Optional filter fields: status (array of status strings), folderId (restricts to that folder's subtree), flagged (boolean). Results are capped at limit (default 100). Each project includes folderId and flagged in addition to id, name, folderPath, status, and type.",
  inputSchema: listProjectsSchema,
  handler: listProjectsHandler,
} as const;
