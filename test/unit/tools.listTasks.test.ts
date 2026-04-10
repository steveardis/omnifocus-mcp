import { describe, it, expect } from "vitest";
import { listTasksSchema } from "../../src/tools/listTasks.js";
import { ListTasksFilter } from "../../src/schemas/index.js";

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

  it("accepts filter with flagged", () => {
    expect(() =>
      listTasksSchema.parse({ scope: { all: true }, filter: { flagged: true } })
    ).not.toThrow();
  });

  it("accepts filter with status array", () => {
    expect(() =>
      listTasksSchema.parse({ scope: { all: true }, filter: { status: ["overdue", "dueSoon"] } })
    ).not.toThrow();
  });

  it("accepts filter with tagId", () => {
    expect(() =>
      listTasksSchema.parse({ scope: { all: true }, filter: { tagId: "tag123" } })
    ).not.toThrow();
  });

  it("accepts filter with dueBeforeDate", () => {
    expect(() =>
      listTasksSchema.parse({ scope: { all: true }, filter: { dueBeforeDate: "2026-04-09T23:59:59.000Z" } })
    ).not.toThrow();
  });

  it("accepts limit", () => {
    expect(() =>
      listTasksSchema.parse({ scope: { all: true }, limit: 50 })
    ).not.toThrow();
  });

  it("rejects non-positive limit", () => {
    expect(() =>
      listTasksSchema.parse({ scope: { all: true }, limit: 0 })
    ).toThrow();
  });
});

describe("ListTasksFilter schema", () => {
  it("accepts empty filter object", () => {
    expect(() => ListTasksFilter.parse({})).not.toThrow();
  });

  it("accepts all valid filter fields", () => {
    expect(() =>
      ListTasksFilter.parse({
        flagged: true,
        status: ["available", "overdue"],
        tagId: "tag123",
        dueBeforeDate: "2026-04-09T23:59:59.000Z",
      })
    ).not.toThrow();
  });

  it("rejects invalid status enum in array", () => {
    expect(() =>
      ListTasksFilter.parse({ status: ["available", "flying"] })
    ).toThrow();
  });

  it("rejects non-ISO dueBeforeDate", () => {
    expect(() =>
      ListTasksFilter.parse({ dueBeforeDate: "April 9, 2026" })
    ).toThrow();
  });

  it("rejects flagged: false (must be literal true or absent)", () => {
    expect(() =>
      ListTasksFilter.parse({ flagged: false })
    ).toThrow();
  });
});
