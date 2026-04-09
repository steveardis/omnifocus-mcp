import { describe, it, expect } from "vitest";
import { CreateProjectInput, EditProjectInput, ReviewIntervalInput } from "../../src/schemas/index.js";

describe("ReviewIntervalInput schema", () => {
  it("accepts valid steps and unit", () => {
    expect(() =>
      ReviewIntervalInput.parse({ steps: 2, unit: "weeks" })
    ).not.toThrow();
  });

  it("rejects invalid unit", () => {
    expect(() =>
      ReviewIntervalInput.parse({ steps: 2, unit: "fortnights" })
    ).toThrow();
  });

  it("rejects non-positive steps", () => {
    expect(() =>
      ReviewIntervalInput.parse({ steps: 0, unit: "weeks" })
    ).toThrow();
  });
});

describe("CreateProjectInput schema", () => {
  it("accepts name only (top-level)", () => {
    expect(() => CreateProjectInput.parse({ name: "My Project" })).not.toThrow();
  });

  it("accepts name with folderId", () => {
    expect(() =>
      CreateProjectInput.parse({ name: "My Project", folderId: "abc123" })
    ).not.toThrow();
  });

  it("accepts valid type enum values", () => {
    for (const type of ["parallel", "sequential", "singleActions"] as const) {
      expect(() =>
        CreateProjectInput.parse({ name: "P", type })
      ).not.toThrow();
    }
  });

  it("rejects invalid type", () => {
    expect(() =>
      CreateProjectInput.parse({ name: "P", type: "waterfall" })
    ).toThrow();
  });

  it("accepts valid status values", () => {
    for (const status of ["active", "onHold"] as const) {
      expect(() =>
        CreateProjectInput.parse({ name: "P", status })
      ).not.toThrow();
    }
  });

  it("accepts reviewInterval", () => {
    expect(() =>
      CreateProjectInput.parse({
        name: "P",
        reviewInterval: { steps: 1, unit: "months" },
      })
    ).not.toThrow();
  });

  it("rejects missing name", () => {
    expect(() => CreateProjectInput.parse({})).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => CreateProjectInput.parse({ name: "" })).toThrow();
  });
});

describe("EditProjectInput schema", () => {
  it("accepts id with a single field", () => {
    expect(() =>
      EditProjectInput.parse({ id: "abc123", status: "onHold" })
    ).not.toThrow();
  });

  it("accepts null deferDate to clear the field", () => {
    expect(() =>
      EditProjectInput.parse({ id: "abc123", deferDate: null })
    ).not.toThrow();
  });

  it("accepts null dueDate", () => {
    expect(() =>
      EditProjectInput.parse({ id: "abc123", dueDate: null })
    ).not.toThrow();
  });

  it("accepts structured reviewInterval", () => {
    expect(() =>
      EditProjectInput.parse({
        id: "abc123",
        reviewInterval: { steps: 2, unit: "weeks" },
      })
    ).not.toThrow();
  });

  it("rejects invalid reviewInterval unit", () => {
    expect(() =>
      EditProjectInput.parse({
        id: "abc123",
        reviewInterval: { steps: 2, unit: "fortnights" },
      })
    ).toThrow();
  });

  it("rejects missing id", () => {
    expect(() => EditProjectInput.parse({ name: "Updated" })).toThrow();
  });
});
