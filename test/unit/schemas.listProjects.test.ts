import { describe, it, expect } from "vitest";
import { ListProjectsFilter } from "../../src/schemas/index.js";

describe("ListProjectsFilter schema", () => {
  it("accepts empty filter object", () => {
    expect(() => ListProjectsFilter.parse({})).not.toThrow();
  });

  it("accepts status array", () => {
    expect(() =>
      ListProjectsFilter.parse({ status: ["active", "onHold"] })
    ).not.toThrow();
  });

  it("accepts folderId", () => {
    expect(() =>
      ListProjectsFilter.parse({ folderId: "folder123" })
    ).not.toThrow();
  });

  it("accepts flagged: true", () => {
    expect(() =>
      ListProjectsFilter.parse({ flagged: true })
    ).not.toThrow();
  });

  it("accepts all fields together", () => {
    expect(() =>
      ListProjectsFilter.parse({ status: ["active"], folderId: "f1", flagged: true })
    ).not.toThrow();
  });

  it("rejects invalid status enum in array", () => {
    expect(() =>
      ListProjectsFilter.parse({ status: ["active", "flying"] })
    ).toThrow();
  });

  it("rejects flagged: false (must be literal true or absent)", () => {
    expect(() =>
      ListProjectsFilter.parse({ flagged: false })
    ).toThrow();
  });
});
