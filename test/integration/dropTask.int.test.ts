import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, type TestFixture } from "./fixtures.js";
import { TaskDetail } from "../../src/schemas/index.js";

describe("drop_task (integration)", () => {
  let fixture: TestFixture;
  let taskId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();
    const projectId = await createTestProject(fixture.folderId, "DropTask Test Project");
    const taskRaw = await runSnippet("create_task", {
      name: "Task to drop",
      projectId,
    });
    taskId = TaskDetail.parse(taskRaw).id;
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("marks task dropped and returns status dropped", async () => {
    const raw = await runSnippet("drop_task", { id: taskId });
    const task = TaskDetail.parse(raw);
    expect(task.status).toBe("dropped");
  });
});
