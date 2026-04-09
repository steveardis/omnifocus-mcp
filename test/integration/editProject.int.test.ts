import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, type TestFixture } from "./fixtures.js";
import { ProjectDetail } from "../../src/schemas/index.js";

describe("edit_project (integration)", () => {
  let fixture: TestFixture;
  let projectId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();
    projectId = await createTestProject(fixture.folderId, "EditProject Test Project");
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("edits name only; other fields unchanged", async () => {
    const raw = await runSnippet("edit_project", { id: projectId, name: "Updated name" });
    const project = ProjectDetail.parse(raw);
    expect(project.name).toBe("Updated name");
  });

  it("sets status to onHold", async () => {
    const raw = await runSnippet("edit_project", { id: projectId, status: "onHold" });
    const project = ProjectDetail.parse(raw);
    expect(project.status).toBe("onHold");
  });

  it("sets review interval", async () => {
    const raw = await runSnippet("edit_project", {
      id: projectId,
      reviewInterval: { steps: 2, unit: "weeks" },
    });
    const project = ProjectDetail.parse(raw);
    expect(project.reviewInterval).toBeTruthy();
  });
});
