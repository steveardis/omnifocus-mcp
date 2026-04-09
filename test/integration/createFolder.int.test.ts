import { describe, it, expect, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { cleanupTestFolder } from "./fixtures.js";
import { FolderDetail } from "../../src/schemas/index.js";

describe("create_folder (integration)", () => {
  const createdFolderIds: string[] = [];

  afterAll(async () => {
    for (const id of createdFolderIds) {
      await cleanupTestFolder(id);
    }
  });

  it("creates a top-level folder and returns stable id", async () => {
    const name = `__mcp_test_folder_${Date.now()}__`;
    const raw = await runSnippet("create_folder", { name });
    const folder = FolderDetail.parse(raw);
    expect(folder.id).toBeTruthy();
    expect(folder.name).toBe(name);
    expect(folder.parentId).toBeNull();
    expect(folder.path).toBe(name);
    createdFolderIds.push(folder.id);
  });

  it("creates a nested folder with correct path and parentId", async () => {
    const parentName = `__mcp_test_parent_${Date.now()}__`;
    const parentRaw = await runSnippet("create_folder", { name: parentName });
    const parent = FolderDetail.parse(parentRaw);
    createdFolderIds.push(parent.id);

    const childRaw = await runSnippet("create_folder", {
      name: "Child",
      parentFolderId: parent.id,
    });
    const child = FolderDetail.parse(childRaw);
    expect(child.parentId).toBe(parent.id);
    expect(child.path).toContain(parentName);
    expect(child.path).toContain("Child");
  });

  it("returns not-found error for invalid parentFolderId", async () => {
    await expect(
      runSnippet("create_folder", { name: "X", parentFolderId: "nonexistent-id-xyz" })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });
});
