import { describe, it, expect } from "vitest";
import { CreateTaskInput, EditTaskInput } from "../../src/schemas/index.js";

describe("CreateTaskInput schema", () => {
  it("accepts name only (inbox placement)", () => {
    expect(() => CreateTaskInput.parse({ name: "Buy milk" })).not.toThrow();
  });

  it("accepts name with projectId", () => {
    expect(() =>
      CreateTaskInput.parse({ name: "Write tests", projectId: "abc123" })
    ).not.toThrow();
  });

  it("accepts name with parentTaskId", () => {
    expect(() =>
      CreateTaskInput.parse({ name: "Review PR", parentTaskId: "xyz789" })
    ).not.toThrow();
  });

  it("accepts all optional fields", () => {
    expect(() =>
      CreateTaskInput.parse({
        name: "Full task",
        note: "some note",
        flagged: true,
        deferDate: "2026-04-10T00:00:00.000Z",
        dueDate: "2026-04-15T00:00:00.000Z",
        estimatedMinutes: 30,
        projectId: "proj1",
        tagIds: ["tag1", "tag2"],
      })
    ).not.toThrow();
  });

  it("rejects both projectId and parentTaskId", () => {
    expect(() =>
      CreateTaskInput.parse({
        name: "Ambiguous",
        projectId: "proj1",
        parentTaskId: "task1",
      })
    ).toThrow();
  });

  it("rejects missing name", () => {
    expect(() => CreateTaskInput.parse({})).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => CreateTaskInput.parse({ name: "" })).toThrow();
  });

  it("accepts a bare date (no time) for deferDate/plannedDate/dueDate", () => {
    expect(() =>
      CreateTaskInput.parse({
        name: "Bare date task",
        deferDate: "2026-07-17",
        plannedDate: "2026-07-17",
        dueDate: "2026-07-18",
      })
    ).not.toThrow();
  });

  it("rejects a malformed date string", () => {
    expect(() =>
      CreateTaskInput.parse({ name: "Bad date", deferDate: "17 July 2026" })
    ).toThrow();
  });

  it("accepts sequential", () => {
    expect(() =>
      CreateTaskInput.parse({ name: "Sequential parent", sequential: true })
    ).not.toThrow();
  });
});

describe("EditTaskInput schema", () => {
  it("accepts id with a single field", () => {
    expect(() =>
      EditTaskInput.parse({ id: "abc123", flagged: true })
    ).not.toThrow();
  });

  it("rejects null deferDate (use clearDeferDate flag instead)", () => {
    expect(() =>
      EditTaskInput.parse({ id: "abc123", deferDate: null })
    ).toThrow();
  });

  it("rejects null dueDate (use clearDueDate flag instead)", () => {
    expect(() =>
      EditTaskInput.parse({ id: "abc123", dueDate: null })
    ).toThrow();
  });

  it("accepts null estimatedMinutes", () => {
    expect(() =>
      EditTaskInput.parse({ id: "abc123", estimatedMinutes: null })
    ).not.toThrow();
  });

  it("rejects missing id", () => {
    expect(() => EditTaskInput.parse({ name: "Updated" })).toThrow();
  });

  it("rejects empty id", () => {
    expect(() => EditTaskInput.parse({ id: "", name: "Updated" })).toThrow();
  });

  it("accepts a bare date (no time) for deferDate", () => {
    expect(() =>
      EditTaskInput.parse({ id: "abc123", deferDate: "2026-07-17" })
    ).not.toThrow();
  });

  it("accepts sequential", () => {
    expect(() =>
      EditTaskInput.parse({ id: "abc123", sequential: false })
    ).not.toThrow();
  });
});
