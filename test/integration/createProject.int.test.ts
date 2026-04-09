import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, type TestFixture } from "./fixtures.js";
import { ProjectDetail } from "../../src/schemas/index.js";

describe("create_project (integration)", () => {
  let fixture: TestFixture;

  beforeAll(async () => {
    fixture = await createTestFolder();
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("creates a top-level project and returns stable id", async () => {
    const name = `__mcp_test_proj_${Date.now()}__`;
    const raw = await runSnippet("create_project", { name });
    const project = ProjectDetail.parse(raw);
    expect(project.id).toBeTruthy();
    expect(project.name).toBe(name);
    expect(project.folderPath).toBe("");
    expect(project.type).toBe("parallel");
    // Clean up the top-level project
    await runSnippet("delete_project", { id: project.id });
  });

  it("creates project inside a folder and sets folderPath", async () => {
    const raw = await runSnippet("create_project", {
      name: "Folder Project Test",
      folderId: fixture.folderId,
    });
    const project = ProjectDetail.parse(raw);
    expect(project.id).toBeTruthy();
    expect(project.folderPath).toBeTruthy();
    expect(project.type).toBe("parallel");
  });

  it("creates sequential project and returns type sequential", async () => {
    const raw = await runSnippet("create_project", {
      name: "Sequential Project Test",
      folderId: fixture.folderId,
      type: "sequential",
    });
    const project = ProjectDetail.parse(raw);
    expect(project.type).toBe("sequential");
  });
});
