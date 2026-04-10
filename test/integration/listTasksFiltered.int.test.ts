import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import {
  createTestFolder,
  cleanupTestFolder,
  createTestProject,
  createTestTag,
  deleteTestTag,
  type TestFixture,
} from "./fixtures.js";
import { TaskSummary } from "../../src/schemas/index.js";
import { z } from "zod";

const TaskSummaryArray = z.array(TaskSummary);

describe("list_tasks filtering (integration)", () => {
  let fixture: TestFixture;
  let projectId: string;
  let tagId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();
    projectId = await createTestProject(fixture.folderId, "FilterTest Project");
    tagId = await createTestTag(`__mcp_filter_tag_${Date.now()}__`);

    // Create tasks with various properties inside the project
    // flagged task
    await runSnippet("create_task", {
      name: "Flagged Task",
      projectId,
      flagged: true,
    });
    // task with tag and due date in the past
    await runSnippet("create_task", {
      name: "Tagged Past Due Task",
      projectId,
      tagIds: [tagId],
      dueDate: "2020-01-01T00:00:00.000Z",
    });
    // task with due date far in future
    await runSnippet("create_task", {
      name: "Future Due Task",
      projectId,
      dueDate: "2099-12-31T23:59:59.000Z",
    });
    // plain task (no flags, no tags, no due date)
    await runSnippet("create_task", { name: "Plain Task", projectId });
  });

  afterAll(async () => {
    await deleteTestTag(tagId);
    await cleanupTestFolder(fixture.folderId);
  });

  it("returns dueDate and tagIds on each task summary", async () => {
    const raw = await runSnippet("list_tasks", { scope: { projectId } });
    const tasks = TaskSummaryArray.parse(raw);
    expect(tasks.length).toBeGreaterThan(0);
    // Every task must have these fields (added to TaskSummary)
    for (const t of tasks) {
      expect(t).toHaveProperty("dueDate");
      expect(t).toHaveProperty("tagIds");
      expect(Array.isArray(t.tagIds)).toBe(true);
    }
  });

  it("enriched summary includes correct dueDate and tagIds", async () => {
    const raw = await runSnippet("list_tasks", { scope: { projectId } });
    const tasks = TaskSummaryArray.parse(raw);
    const tagged = tasks.find((t) => t.name === "Tagged Past Due Task");
    expect(tagged).toBeDefined();
    expect(tagged!.dueDate).toBe("2020-01-01T00:00:00.000Z");
    expect(tagged!.tagIds).toContain(tagId);
  });

  it("default excludes complete and dropped tasks", async () => {
    // Complete one task then check it's absent by default
    const raw1 = await runSnippet("list_tasks", { scope: { projectId } });
    const tasks1 = TaskSummaryArray.parse(raw1);
    const plain = tasks1.find((t) => t.name === "Plain Task");
    expect(plain).toBeDefined();

    await runSnippet("complete_task", { id: plain!.id });

    const raw2 = await runSnippet("list_tasks", { scope: { projectId } });
    const tasks2 = TaskSummaryArray.parse(raw2);
    expect(tasks2.find((t) => t.id === plain!.id)).toBeUndefined();
  });

  it("explicit status filter retrieves complete tasks", async () => {
    const raw = await runSnippet("list_tasks", {
      scope: { projectId },
      filter: { status: ["complete"] },
    });
    const tasks = TaskSummaryArray.parse(raw);
    expect(tasks.some((t) => t.name === "Plain Task")).toBe(true);
    expect(tasks.every((t) => t.status === "complete")).toBe(true);
  });

  it("flagged filter returns only flagged tasks", async () => {
    const raw = await runSnippet("list_tasks", {
      scope: { projectId },
      filter: { flagged: true },
    });
    const tasks = TaskSummaryArray.parse(raw);
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((t) => t.flagged)).toBe(true);
    expect(tasks.some((t) => t.name === "Flagged Task")).toBe(true);
  });

  it("tagId filter returns only tasks with that tag", async () => {
    const raw = await runSnippet("list_tasks", {
      scope: { projectId },
      filter: { tagId },
    });
    const tasks = TaskSummaryArray.parse(raw);
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((t) => t.tagIds.includes(tagId))).toBe(true);
    expect(tasks.some((t) => t.name === "Tagged Past Due Task")).toBe(true);
  });

  it("dueBeforeDate filter returns tasks due on or before the date", async () => {
    // Cutoff in 2021 — should match the 2020 task, not the 2099 task
    const raw = await runSnippet("list_tasks", {
      scope: { projectId },
      filter: { dueBeforeDate: "2021-01-01T00:00:00.000Z" },
    });
    const tasks = TaskSummaryArray.parse(raw);
    expect(tasks.some((t) => t.name === "Tagged Past Due Task")).toBe(true);
    expect(tasks.some((t) => t.name === "Future Due Task")).toBe(false);
  });

  it("limit caps the number of returned tasks", async () => {
    const raw = await runSnippet("list_tasks", {
      scope: { projectId },
      limit: 1,
    });
    const tasks = TaskSummaryArray.parse(raw);
    expect(tasks.length).toBeLessThanOrEqual(1);
  });
});
