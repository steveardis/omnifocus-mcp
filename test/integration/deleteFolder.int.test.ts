import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, type TestFixture } from "./fixtures.js";
import { FolderDetail } from "../../src/schemas/index.js";

describe("delete_folder (integration)", () => {
  let fixture: TestFixture;

  beforeAll(async () => {
    fixture = await createTestFolder();
  });

  afterAll(async () => {
    // Best-effort cleanup — the folder may already be deleted by the test
    try { await cleanupTestFolder(fixture.folderId); } catch (_) {}
  });

  it("deletes folder with child project and get_folder returns not-found afterwards", async () => {
    // Create a nested folder with a project inside the fixture
    const childRaw = await runSnippet("create_folder", {
      name: "ToDelete",
      parentFolderId: fixture.folderId,
    });
    const childFolder = FolderDetail.parse(childRaw);
    await createTestProject(childFolder.id, "Project inside folder");

    // Delete the child folder
    await runSnippet("delete_folder", { id: childFolder.id });

    // get_folder should return not-found
    await expect(
      runSnippet("get_folder", { id: childFolder.id })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });

  it("deletes an empty folder", async () => {
    const raw = await runSnippet("create_folder", {
      name: "EmptyToDelete",
      parentFolderId: fixture.folderId,
    });
    const folder = FolderDetail.parse(raw);

    await runSnippet("delete_folder", { id: folder.id });

    await expect(
      runSnippet("get_folder", { id: folder.id })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });

  it("returns not-found error for invalid id", async () => {
    await expect(
      runSnippet("delete_folder", { id: "nonexistent-id-xyz" })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });
});
