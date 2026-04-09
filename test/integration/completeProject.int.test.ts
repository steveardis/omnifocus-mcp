import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, type TestFixture } from "./fixtures.js";
import { ProjectDetail } from "../../src/schemas/index.js";

describe("complete_project (integration)", () => {
  let fixture: TestFixture;
  let projectId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();
    projectId = await createTestProject(fixture.folderId, "CompleteProject Test Project");
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("marks project complete and returns status done", async () => {
    const raw = await runSnippet("complete_project", { id: projectId });
    const project = ProjectDetail.parse(raw);
    expect(project.status).toBe("done");
    expect(project.completionDate).not.toBeNull();
  });
});
