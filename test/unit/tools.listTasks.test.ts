import { describe, it, expect } from "vitest";
import { listTasksSchema } from "../../src/tools/listTasks.js";

describe("listTasks input validation", () => {
  it("accepts projectId scope", () => {
    expect(() =>
      listTasksSchema.parse({ scope: { projectId: "abc" } })
    ).not.toThrow();
  });

  it("accepts folderId scope", () => {
    expect(() =>
      listTasksSchema.parse({ scope: { folderId: "f1" } })
    ).not.toThrow();
  });

  it("accepts inbox scope", () => {
    expect(() =>
      listTasksSchema.parse({ scope: { inbox: true } })
    ).not.toThrow();
  });

  it("accepts all scope", () => {
    expect(() =>
      listTasksSchema.parse({ scope: { all: true } })
    ).not.toThrow();
  });

  it("rejects scope with both projectId and inbox (mutual exclusivity)", () => {
    expect(() =>
      listTasksSchema.parse({ scope: { projectId: "abc", inbox: true } })
    ).toThrow();
  });

  it("rejects scope with both folderId and all", () => {
    expect(() =>
      listTasksSchema.parse({ scope: { folderId: "f1", all: true } })
    ).toThrow();
  });

  it("rejects empty scope object (no discriminator)", () => {
    expect(() => listTasksSchema.parse({ scope: {} })).toThrow();
  });

  it("rejects missing scope", () => {
    expect(() => listTasksSchema.parse({})).toThrow();
  });

  it("rejects empty projectId string", () => {
    expect(() =>
      listTasksSchema.parse({ scope: { projectId: "" } })
    ).toThrow();
  });
});
