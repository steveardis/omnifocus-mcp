import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, type TestFixture } from "./fixtures.js";
import { TaskDetail } from "../../src/schemas/index.js";

describe("plannedDate (integration)", () => {
  let fixture: TestFixture;
  let projectId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();
    projectId = await createTestProject(fixture.folderId, "__mcp_planned_date_test__");
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("creates task with plannedDate and get_task returns it", async () => {
    const raw = await runSnippet("create_task", {
      name: "__mcp_planned_create__",
      projectId,
      plannedDate: "2026-04-15T09:00:00.000Z",
    });
    const task = TaskDetail.parse(raw);
    expect(task.plannedDate).not.toBeNull();
    expect(task.plannedDate).toContain("2026-04-15");

    const fetched = TaskDetail.parse(await runSnippet("get_task", { id: task.id }));
    expect(fetched.plannedDate).toContain("2026-04-15");
  });

  it("edits task to set plannedDate", async () => {
    const created = TaskDetail.parse(
      await runSnippet("create_task", { name: "__mcp_planned_edit__", projectId })
    );
    expect(created.plannedDate).toBeNull();

    const edited = TaskDetail.parse(
      await runSnippet("edit_task", { id: created.id, plannedDate: "2026-05-01T10:00:00.000Z" })
    );
    expect(edited.plannedDate).toContain("2026-05-01");
  });

  it("clears plannedDate via edit with null", async () => {
    const created = TaskDetail.parse(
      await runSnippet("create_task", {
        name: "__mcp_planned_clear__",
        projectId,
        plannedDate: "2026-04-20T08:00:00.000Z",
      })
    );
    expect(created.plannedDate).not.toBeNull();

    const cleared = TaskDetail.parse(
      await runSnippet("edit_task", { id: created.id, plannedDate: null })
    );
    expect(cleared.plannedDate).toBeNull();

    const fetched = TaskDetail.parse(await runSnippet("get_task", { id: created.id }));
    expect(fetched.plannedDate).toBeNull();
  });

  it("task without plannedDate returns null (backward compat)", async () => {
    const raw = await runSnippet("create_task", {
      name: "__mcp_planned_none__",
      projectId,
    });
    const task = TaskDetail.parse(raw);
    expect(task.plannedDate).toBeNull();
  });
});
