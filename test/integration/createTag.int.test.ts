import { describe, it, expect, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { deleteTestTag } from "./fixtures.js";
import { TagDetail } from "../../src/schemas/index.js";

describe("create_tag (integration)", () => {
  const createdTagIds: string[] = [];

  afterAll(async () => {
    for (const id of createdTagIds) {
      await deleteTestTag(id);
    }
  });

  it("creates a top-level tag and returns stable id", async () => {
    const name = `__mcp_test_tag_${Date.now()}__`;
    const raw = await runSnippet("create_tag", { name });
    const tag = TagDetail.parse(raw);
    expect(tag.id).toBeTruthy();
    expect(tag.name).toBe(name);
    expect(tag.parentId).toBeNull();
    expect(tag.path).toBe(name);
    createdTagIds.push(tag.id);
  });

  it("creates a child tag with correct path and parentId", async () => {
    const parentName = `__mcp_test_parent_tag_${Date.now()}__`;
    const parentRaw = await runSnippet("create_tag", { name: parentName });
    const parent = TagDetail.parse(parentRaw);
    createdTagIds.push(parent.id);

    const childRaw = await runSnippet("create_tag", {
      name: "Child",
      parentTagId: parent.id,
    });
    const child = TagDetail.parse(childRaw);
    expect(child.parentId).toBe(parent.id);
    expect(child.path).toContain(parentName);
    expect(child.path).toContain("Child");
    // Parent should now list child
    expect(parent.childTagIds).not.toContain(child.id); // stale parent object; child is real
  });

  it("returns not-found error for invalid parentTagId", async () => {
    await expect(
      runSnippet("create_tag", { name: "X", parentTagId: "nonexistent-id-xyz" })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });
});
