import { describe, it, expect, beforeAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestTag } from "./fixtures.js";
import { TagDetail } from "../../src/schemas/index.js";

describe("delete_tag (integration)", () => {
  let tagId: string;
  let parentTagId: string;

  beforeAll(async () => {
    tagId = await createTestTag(`__mcp_test_del_tag_${Date.now()}__`);
    parentTagId = await createTestTag(`__mcp_test_del_parent_${Date.now()}__`);
  });

  it("deletes a tag and get_tag returns not-found afterwards", async () => {
    await runSnippet("delete_tag", { id: tagId });

    await expect(
      runSnippet("get_tag", { id: tagId })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });

  it("deletes parent tag and child tags are also gone", async () => {
    // Create a child tag under parentTagId
    const childRaw = await runSnippet("create_tag", {
      name: "ChildToDelete",
      parentTagId,
    });
    const child = TagDetail.parse(childRaw);

    // Delete the parent
    await runSnippet("delete_tag", { id: parentTagId });

    // Both parent and child should be gone
    await expect(
      runSnippet("get_tag", { id: parentTagId })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });

    await expect(
      runSnippet("get_tag", { id: child.id })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });

  it("returns not-found error for invalid id", async () => {
    await expect(
      runSnippet("delete_tag", { id: "nonexistent-id-xyz" })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });
});
