import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, type TestFixture } from "./fixtures.js";
import { ProjectDetail } from "../../src/schemas/index.js";

describe("delete_project (integration)", () => {
  let fixture: TestFixture;
  let projectId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();
    projectId = await createTestProject(fixture.folderId, "DeleteProject Test Project");
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("deletes the project and get_project returns not-found afterwards", async () => {
    await runSnippet("delete_project", { id: projectId });

    await expect(
      runSnippet("get_project", { id: projectId })
    ).rejects.toSatisfy(
      (e: unknown) => {
        const err = e as Record<string, unknown>;
        return err.name === "ExecutionError" && err.errorName === "NotFoundError";
      }
    );
  });
});
