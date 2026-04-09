import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, createTestTag, deleteTestTag, type TestFixture } from "./fixtures.js";
import { TaskDetail } from "../../src/schemas/index.js";

describe("edit_task (integration)", () => {
  let fixture: TestFixture;
  let taskId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();
    const projectId = await createTestProject(fixture.folderId, "EditTask Test Project");
    const taskRaw = await runSnippet("create_task", {
      name: "Original name",
      projectId,
      dueDate: "2026-12-31T00:00:00.000Z",
    });
    taskId = TaskDetail.parse(taskRaw).id;
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("edits name only; other fields unchanged", async () => {
    const raw = await runSnippet("edit_task", { id: taskId, name: "Updated name" });
    const task = TaskDetail.parse(raw);
    expect(task.name).toBe("Updated name");
    expect(task.dueDate).not.toBeNull();
  });

  it("sets flagged", async () => {
    const raw = await runSnippet("edit_task", { id: taskId, flagged: true });
    const task = TaskDetail.parse(raw);
    expect(task.flagged).toBe(true);
  });

  it("clears due date with null", async () => {
    const raw = await runSnippet("edit_task", { id: taskId, dueDate: null });
    const task = TaskDetail.parse(raw);
    expect(task.dueDate).toBeNull();
  });

  it("replaces tag set", async () => {
    const tagId = await createTestTag(`__mcp_test_tag_${Date.now()}__`);
    try {
      const raw = await runSnippet("edit_task", { id: taskId, tagIds: [tagId] });
      const task = TaskDetail.parse(raw);
      expect(task.tagIds).toContain(tagId);
      // Clear tags before deleting the tag
      await runSnippet("edit_task", { id: taskId, tagIds: [] });
    } finally {
      await deleteTestTag(tagId);
    }
  });
});
