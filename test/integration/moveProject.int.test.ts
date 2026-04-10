import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, type TestFixture } from "./fixtures.js";
import { ProjectSummary } from "../../src/schemas/index.js";

describe("move_project (integration)", () => {
  let fixtureA: TestFixture;
  let fixtureB: TestFixture;
  let projectId: string;

  beforeAll(async () => {
    fixtureA = await createTestFolder();
    fixtureB = await createTestFolder();
    projectId = await createTestProject(fixtureA.folderId, "__mcp_move_project__");
  });

  afterAll(async () => {
    // Delete the project explicitly — it may have been moved to top level (outside any fixture folder)
    try {
      await runSnippet("delete_project", { id: projectId });
    } catch (_) { /* already gone */ }
    await cleanupTestFolder(fixtureA.folderId);
    await cleanupTestFolder(fixtureB.folderId);
  });

  it("moves project to a different folder", async () => {
    const raw = await runSnippet("move_project", { id: projectId, folderId: fixtureB.folderId });
    const result = ProjectSummary.parse(raw);
    expect(result.id).toBe(projectId);
    expect(result.folderId).toBe(fixtureB.folderId);
  });

  it("moves project to top level (folderId null)", async () => {
    const raw = await runSnippet("move_project", { id: projectId, folderId: null });
    const result = ProjectSummary.parse(raw);
    expect(result.id).toBe(projectId);
    expect(result.folderId).toBeNull();
  });

  it("non-existent project ID returns NotFoundError", async () => {
    await expect(
      runSnippet("move_project", { id: "nonexistent-project-xyz", folderId: fixtureA.folderId })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });

  it("non-existent folder ID returns NotFoundError", async () => {
    await expect(
      runSnippet("move_project", { id: projectId, folderId: "nonexistent-folder-xyz" })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });
});
