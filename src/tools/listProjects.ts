import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { ProjectSummary } from "../schemas/index.js";

export const listProjectsSchema = z.object({});

export type ListProjectsInput = z.infer<typeof listProjectsSchema>;

export async function listProjectsHandler(
  _input: ListProjectsInput
): Promise<z.infer<typeof ProjectSummary>[]> {
  const raw = await runSnippet("list_projects", {});
  return z.array(ProjectSummary).parse(raw);
}

export const listProjectsTool = {
  name: "list_projects",
  description:
    "List all projects in OmniFocus. Returns id, name, folder path, status (active/onHold/done/dropped), and type (parallel/sequential/singleActions) for every project.",
  inputSchema: listProjectsSchema,
  handler: listProjectsHandler,
} as const;
