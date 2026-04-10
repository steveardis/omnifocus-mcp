import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, type TestFixture } from "./fixtures.js";
import { TaskDetail } from "../../src/schemas/index.js";

describe("task recurrence (integration)", () => {
  let fixture: TestFixture;
  let projectId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();
    projectId = await createTestProject(fixture.folderId, "__mcp_recurrence_test__");
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("creates task with daily repetition and get_task returns it", async () => {
    const raw = await runSnippet("create_task", {
      name: "__mcp_daily_task__",
      projectId,
      repetitionRule: { frequency: "daily", interval: 1, method: "fixed" },
    });
    const task = TaskDetail.parse(raw);
    expect(task.repetitionRule).not.toBeNull();
    expect(task.repetitionRule?.frequency).toBe("daily");
    expect(task.repetitionRule?.interval).toBe(1);
    expect(task.repetitionRule?.method).toBe("fixed");

    const getraw = await runSnippet("get_task", { id: task.id });
    const fetched = TaskDetail.parse(getraw);
    expect(fetched.repetitionRule?.frequency).toBe("daily");
    expect(fetched.repetitionRule?.method).toBe("fixed");
  });

  it("creates task with weekly repetition on Mon/Wed/Fri", async () => {
    const raw = await runSnippet("create_task", {
      name: "__mcp_weekly_task__",
      projectId,
      repetitionRule: {
        frequency: "weekly",
        interval: 1,
        daysOfWeek: ["monday", "wednesday", "friday"],
        method: "start",
      },
    });
    const task = TaskDetail.parse(raw);
    expect(task.repetitionRule?.frequency).toBe("weekly");
    expect(task.repetitionRule?.daysOfWeek).toEqual(
      expect.arrayContaining(["monday", "wednesday", "friday"])
    );
    expect(task.repetitionRule?.daysOfWeek).toHaveLength(3);
    expect(task.repetitionRule?.method).toBe("start");
  });

  it("edits existing task to add monthly repetition", async () => {
    const created = await runSnippet("create_task", {
      name: "__mcp_edit_recur_task__",
      projectId,
    });
    const task = TaskDetail.parse(created);
    expect(task.repetitionRule).toBeNull();

    const edited = await runSnippet("edit_task", {
      id: task.id,
      repetitionRule: { frequency: "monthly", interval: 1, method: "dueDate" },
    });
    const updated = TaskDetail.parse(edited);
    expect(updated.repetitionRule?.frequency).toBe("monthly");
    expect(updated.repetitionRule?.interval).toBe(1);
    expect(updated.repetitionRule?.method).toBe("dueDate");
  });

  it("clears repetition via edit with null", async () => {
    const created = await runSnippet("create_task", {
      name: "__mcp_clear_recur_task__",
      projectId,
      repetitionRule: { frequency: "daily", interval: 1, method: "fixed" },
    });
    const task = TaskDetail.parse(created);
    expect(task.repetitionRule).not.toBeNull();

    const cleared = await runSnippet("edit_task", {
      id: task.id,
      repetitionRule: null,
    });
    const updated = TaskDetail.parse(cleared);
    expect(updated.repetitionRule).toBeNull();

    const fetched = TaskDetail.parse(await runSnippet("get_task", { id: task.id }));
    expect(fetched.repetitionRule).toBeNull();
  });

  it("task created without repetitionRule returns repetitionRule: null", async () => {
    const raw = await runSnippet("create_task", {
      name: "__mcp_no_recur_task__",
      projectId,
    });
    const task = TaskDetail.parse(raw);
    expect(task.repetitionRule).toBeNull();

    const fetched = TaskDetail.parse(await runSnippet("get_task", { id: task.id }));
    expect(fetched.repetitionRule).toBeNull();
  });
});
