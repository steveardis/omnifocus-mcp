import { z } from "zod";
import { runSnippet } from "../runtime/index.js";
import { CreateProjectInput, ProjectDetail } from "../schemas/index.js";

export type CreateProjectInputType = z.infer<typeof CreateProjectInput>;

export async function createProjectHandler(
  input: CreateProjectInputType
): Promise<z.infer<typeof ProjectDetail>> {
  const raw = await runSnippet("create_project", input);
  return ProjectDetail.parse(raw);
}

export const createProjectTool = {
  name: "create_project",
  description:
    "Create a new OmniFocus project. Omit folderId to create at the top level; provide folderId to place it inside a folder. Optionally set type (parallel/sequential/singleActions), status (active/onHold), review interval, and tags.",
  inputSchema: CreateProjectInput,
  handler: createProjectHandler,
} as const;
