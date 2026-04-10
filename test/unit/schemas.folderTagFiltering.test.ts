import { describe, it, expect } from "vitest";
import { ListFoldersFilter, ListTagsFilter } from "../../src/schemas/index.js";

describe("ListFoldersFilter schema", () => {
  it("accepts empty filter object", () => {
    expect(() => ListFoldersFilter.parse({})).not.toThrow();
  });

  it("accepts status 'active'", () => {
    expect(() => ListFoldersFilter.parse({ status: "active" })).not.toThrow();
  });

  it("accepts status 'dropped'", () => {
    expect(() => ListFoldersFilter.parse({ status: "dropped" })).not.toThrow();
  });

  it("rejects invalid status value", () => {
    expect(() => ListFoldersFilter.parse({ status: "pending" })).toThrow();
  });
});

describe("ListTagsFilter schema", () => {
  it("accepts empty filter object", () => {
    expect(() => ListTagsFilter.parse({})).not.toThrow();
  });

  it("accepts status 'active'", () => {
    expect(() => ListTagsFilter.parse({ status: "active" })).not.toThrow();
  });

  it("accepts status 'onHold'", () => {
    expect(() => ListTagsFilter.parse({ status: "onHold" })).not.toThrow();
  });

  it("accepts status 'dropped'", () => {
    expect(() => ListTagsFilter.parse({ status: "dropped" })).not.toThrow();
  });

  it("rejects invalid status value", () => {
    expect(() => ListTagsFilter.parse({ status: "unknown" })).toThrow();
  });
});
