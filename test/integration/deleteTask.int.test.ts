import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, type TestFixture } from "./fixtures.js";
import { TaskDetail } from "../../src/schemas/index.js";

describe("delete_task (integration)", () => {
  let fixture: TestFixture;
  let taskId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();
    const projectId = await createTestProject(fixture.folderId, "DeleteTask Test Project");
    const taskRaw = await runSnippet("create_task", {
      name: "Task to delete",
      projectId,
    });
    taskId = TaskDetail.parse(taskRaw).id;
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("deletes the task and get_task returns not-found afterwards", async () => {
    await runSnippet("delete_task", { id: taskId });

    await expect(
      runSnippet("get_task", { id: taskId })
    ).rejects.toSatisfy(
      (e: unknown) => {
        const err = e as Record<string, unknown>;
        return err.name === "ExecutionError" && err.errorName === "NotFoundError";
      }
    );
  });
});
