import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, type TestFixture } from "./fixtures.js";
import { TaskDetail, TaskSummary } from "../../src/schemas/index.js";
import { z } from "zod";

const TaskSummaryArray = z.array(TaskSummary);

// Regression coverage for BUG-003: completing a parent task effectively
// completes its children too, but a child's own completionDate stays null
// unless the connector reports its *effective* completion date instead.
describe("effective completion date on parent-completed subtasks (BUG-003, integration)", () => {
  let fixture: TestFixture;
  let projectId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();
    projectId = await createTestProject(fixture.folderId, "BUG-003 Test Project");
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("get_task reports a non-null completionDate for a child completed via its parent", async () => {
    const parent = TaskDetail.parse(
      await runSnippet("create_task", { name: "Parent task", projectId })
    );
    const child = TaskDetail.parse(
      await runSnippet("create_task", { name: "Child task", parentTaskId: parent.id })
    );
    expect(child.completionDate).toBeNull();

    const beforeComplete = new Date().toISOString();
    await runSnippet("complete_task", { id: parent.id });

    const fetchedChild = TaskDetail.parse(await runSnippet("get_task", { id: child.id }));
    expect(fetchedChild.status).toBe("complete");
    expect(fetchedChild.completionDate).not.toBeNull();
    expect(new Date(fetchedChild.completionDate!).getTime()).toBeGreaterThanOrEqual(
      new Date(beforeComplete).getTime()
    );
  });

  it("list_tasks completedAfter scan catches a child completed via its parent", async () => {
    const parent = TaskDetail.parse(
      await runSnippet("create_task", { name: "Parent task for scan", projectId })
    );
    const child = TaskDetail.parse(
      await runSnippet("create_task", { name: "Child task for scan", parentTaskId: parent.id })
    );

    const beforeComplete = new Date().toISOString();
    await runSnippet("complete_task", { id: parent.id });

    const raw = await runSnippet("list_tasks", {
      scope: { projectId },
      filter: { status: ["complete"], completedAfter: beforeComplete },
    });
    const tasks = TaskSummaryArray.parse(raw);
    expect(tasks.some((t) => t.id === parent.id)).toBe(true);
    expect(tasks.some((t) => t.id === child.id)).toBe(true);
    const scannedChild = tasks.find((t) => t.id === child.id);
    expect(scannedChild!.completionDate).not.toBeNull();
  });

  it("a normally-completed (non-child) task still reports its own real completionDate", async () => {
    const task = TaskDetail.parse(
      await runSnippet("create_task", { name: "Solo task", projectId })
    );
    const completed = TaskDetail.parse(await runSnippet("complete_task", { id: task.id }));
    expect(completed.completionDate).not.toBeNull();
  });
});
