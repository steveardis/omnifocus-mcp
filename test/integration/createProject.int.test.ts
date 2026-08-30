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
    // type is explicit here rather than relying on OmniFocus's own
    // "default new project type" preference, which is per-user configurable
    // and not something the connector controls (see issue: createProject
    // tests assumed the tester's default was parallel).
    const raw = await runSnippet("create_project", { name, type: "parallel" });
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
      type: "parallel",
    });
    const project = ProjectDetail.parse(raw);
    expect(project.id).toBeTruthy();
    expect(project.folderPath).toBeTruthy();
    expect(project.type).toBe("parallel");
  });

  it("omitting type falls through to OmniFocus's own default (still a valid type)", async () => {
    const raw = await runSnippet("create_project", {
      name: "Omitted Type Project Test",
      folderId: fixture.folderId,
    });
    const project = ProjectDetail.parse(raw);
    // Deliberately not asserting a specific value here — the default when
    // type is omitted is whatever the user's own OmniFocus preference says,
    // which this suite can't and shouldn't assume.
    expect(["parallel", "sequential", "singleActions"]).toContain(project.type);
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
