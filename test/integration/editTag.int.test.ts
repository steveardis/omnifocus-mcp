import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestTag, deleteTestTag } from "./fixtures.js";
import { TagDetail } from "../../src/schemas/index.js";

describe("edit_tag (integration)", () => {
  let tagId: string;

  beforeAll(async () => {
    tagId = await createTestTag(`__mcp_test_edit_tag_${Date.now()}__`);
  });

  afterAll(async () => {
    await deleteTestTag(tagId);
  });

  it("renames a tag", async () => {
    const raw = await runSnippet("edit_tag", { id: tagId, name: "Renamed Tag" });
    const tag = TagDetail.parse(raw);
    expect(tag.name).toBe("Renamed Tag");
  });

  it("puts tag on hold", async () => {
    const raw = await runSnippet("edit_tag", { id: tagId, status: "onHold" });
    const tag = TagDetail.parse(raw);
    expect(tag.status).toBe("onHold");
  });

  it("restores tag to active", async () => {
    const raw = await runSnippet("edit_tag", { id: tagId, status: "active" });
    const tag = TagDetail.parse(raw);
    expect(tag.status).toBe("active");
  });

  it("returns not-found error for invalid id", async () => {
    await expect(
      runSnippet("edit_tag", { id: "nonexistent-id-xyz", name: "X" })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });
});
