import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, type TestFixture } from "./fixtures.js";
import { TaskSummary } from "../../src/schemas/index.js";

describe("move_task (integration)", () => {
  let fixture: TestFixture;
  let projectAId: string;
  let projectBId: string;
  let taskId: string;
  let parentTaskId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();
    projectAId = await createTestProject(fixture.folderId, "__mcp_move_proj_a__");
    projectBId = await createTestProject(fixture.folderId, "__mcp_move_proj_b__");

    // Create a task in project A
    const taskRaw = await runSnippet("create_task", {
      name: "__mcp_move_task__",
      projectId: projectAId,
    });
    taskId = (taskRaw as { id: string }).id;

    // Create a parent task in project B
    const parentRaw = await runSnippet("create_task", {
      name: "__mcp_parent_task__",
      projectId: projectBId,
    });
    parentTaskId = (parentRaw as { id: string }).id;
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("moves task to a different project", async () => {
    const raw = await runSnippet("move_task", { id: taskId, projectId: projectBId });
    const result = TaskSummary.parse(raw);
    expect(result.id).toBe(taskId);
    expect(result.containerId).toBe(projectBId);
    expect(result.containerType).toBe("project");
  });

  it("makes task a subtask of another task", async () => {
    const raw = await runSnippet("move_task", { id: taskId, parentTaskId });
    const result = TaskSummary.parse(raw);
    expect(result.id).toBe(taskId);
    expect(result.containerId).toBe(parentTaskId);
    expect(result.containerType).toBe("task");
  });

  it("non-existent task ID returns NotFoundError", async () => {
    await expect(
      runSnippet("move_task", { id: "nonexistent-task-xyz", projectId: projectAId })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });
});
