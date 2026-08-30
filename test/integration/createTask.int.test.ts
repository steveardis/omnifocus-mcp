import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, type TestFixture } from "./fixtures.js";
import { TaskDetail } from "../../src/schemas/index.js";

describe("create_task (integration)", () => {
  let fixture: TestFixture;
  let projectId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();
    projectId = await createTestProject(fixture.folderId, "CreateTask Test Project");
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("creates an inbox task and returns a stable id", async () => {
    const raw = await runSnippet("create_task", { name: "Inbox task test" });
    const task = TaskDetail.parse(raw);
    expect(task.id).toBeTruthy();
    expect(task.name).toBe("Inbox task test");
    expect(task.containerType).toBe("inbox");
    // Clean up inbox task
    await runSnippet("delete_task", { id: task.id });
  });

  it("creates a task in a project and sets containerId", async () => {
    const raw = await runSnippet("create_task", {
      name: "Project task test",
      projectId,
    });
    const task = TaskDetail.parse(raw);
    expect(task.id).toBeTruthy();
    expect(task.name).toBe("Project task test");
    expect(task.containerId).toBe(projectId);
    expect(task.containerType).toBe("project");
  });

  it("resolves a bare deferDate to local midnight, not UTC midnight", async () => {
    const raw = await runSnippet("create_task", {
      name: "Bare defer date test",
      projectId,
      deferDate: "2026-07-20",
    });
    const task = TaskDetail.parse(raw);
    expect(task.deferDate).not.toBeNull();
    const d = new Date(task.deferDate!);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6); // July
    expect(d.getDate()).toBe(20);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });

  it("resolves a bare dueDate to local midnight, not UTC midnight", async () => {
    const raw = await runSnippet("create_task", {
      name: "Bare due date test",
      projectId,
      dueDate: "2026-07-21",
    });
    const task = TaskDetail.parse(raw);
    const d = new Date(task.dueDate!);
    expect(d.getDate()).toBe(21);
    expect(d.getHours()).toBe(0);
  });

  it("creates with sequential set and reports it back", async () => {
    const raw = await runSnippet("create_task", {
      name: "Sequential parent test",
      projectId,
      sequential: true,
    });
    const task = TaskDetail.parse(raw);
    expect(task.sequential).toBe(true);
  });

  it("reports sequential as a boolean when omitted (OmniFocus's own default, whatever it is)", async () => {
    const raw = await runSnippet("create_task", { name: "Default sequential test", projectId });
    const task = TaskDetail.parse(raw);
    expect(typeof task.sequential).toBe("boolean");
  });

  it("creates a subtask and sets parentTaskId", async () => {
    const parentRaw = await runSnippet("create_task", {
      name: "Parent task",
      projectId,
    });
    const parent = TaskDetail.parse(parentRaw);

    const childRaw = await runSnippet("create_task", {
      name: "Child task",
      parentTaskId: parent.id,
    });
    const child = TaskDetail.parse(childRaw);
    expect(child.parentTaskId).toBe(parent.id);
  });
});
