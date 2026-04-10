import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestTag, deleteTestTag } from "./fixtures.js";
import { TagSummary } from "../../src/schemas/index.js";
import { z } from "zod";

const TagSummaryArray = z.array(TagSummary);

describe("list_tags filtering (integration)", () => {
  let activeTagId: string;
  let onHoldTagId: string;

  beforeAll(async () => {
    activeTagId = await createTestTag("__MCP_ACTIVE_TAG_TEST__");
    onHoldTagId = await createTestTag("__MCP_ONHOLD_TAG_TEST__");
    // Set onHold via edit_tag
    await runSnippet("edit_tag", { id: onHoldTagId, status: "onHold" });
  });

  afterAll(async () => {
    await deleteTestTag(activeTagId);
    await deleteTestTag(onHoldTagId);
  });

  it("no filter returns all tags including onHold", async () => {
    const raw = await runSnippet("list_tags", {});
    const tags = TagSummaryArray.parse(raw);
    const ids = tags.map((t) => t.id);
    expect(ids).toContain(activeTagId);
    expect(ids).toContain(onHoldTagId);
  });

  it("status filter 'active' returns only active tags", async () => {
    const raw = await runSnippet("list_tags", { filter: { status: "active" } });
    const tags = TagSummaryArray.parse(raw);
    expect(tags.every((t) => t.status === "active")).toBe(true);
    expect(tags.some((t) => t.id === activeTagId)).toBe(true);
    expect(tags.some((t) => t.id === onHoldTagId)).toBe(false);
  });

  it("status filter 'onHold' returns only onHold tags", async () => {
    const raw = await runSnippet("list_tags", { filter: { status: "onHold" } });
    const tags = TagSummaryArray.parse(raw);
    expect(tags.every((t) => t.status === "onHold")).toBe(true);
    expect(tags.some((t) => t.id === onHoldTagId)).toBe(true);
    expect(tags.some((t) => t.id === activeTagId)).toBe(false);
  });

  it("limit caps the number of returned tags", async () => {
    const raw = await runSnippet("list_tags", { limit: 1 });
    const tags = TagSummaryArray.parse(raw);
    expect(tags.length).toBeLessThanOrEqual(1);
  });
});
