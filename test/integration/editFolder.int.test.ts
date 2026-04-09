import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, type TestFixture } from "./fixtures.js";
import { FolderDetail } from "../../src/schemas/index.js";

describe("edit_folder (integration)", () => {
  let fixture: TestFixture;
  let childFolderId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();
    // Create a child folder to rename
    const raw = await runSnippet("create_folder", {
      name: "Original Name",
      parentFolderId: fixture.folderId,
    });
    const folder = FolderDetail.parse(raw);
    childFolderId = folder.id;
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("renames a folder and returns updated name and path", async () => {
    const raw = await runSnippet("edit_folder", {
      id: childFolderId,
      name: "Renamed Folder",
    });
    const folder = FolderDetail.parse(raw);
    expect(folder.name).toBe("Renamed Folder");
    expect(folder.path).toContain("Renamed Folder");
  });

  it("returns not-found error for invalid id", async () => {
    await expect(
      runSnippet("edit_folder", { id: "nonexistent-id-xyz", name: "X" })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });
});
