import { describe, it, expect } from "vitest";
import { CreateFolderInput, EditFolderInput } from "../../src/schemas/index.js";

describe("CreateFolderInput schema", () => {
  it("accepts name only (top-level)", () => {
    expect(() => CreateFolderInput.parse({ name: "My Folder" })).not.toThrow();
  });

  it("accepts name with parentFolderId", () => {
    expect(() =>
      CreateFolderInput.parse({ name: "Nested", parentFolderId: "abc123" })
    ).not.toThrow();
  });

  it("rejects missing name", () => {
    expect(() => CreateFolderInput.parse({})).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => CreateFolderInput.parse({ name: "" })).toThrow();
  });
});

describe("EditFolderInput schema", () => {
  it("accepts id and name", () => {
    expect(() =>
      EditFolderInput.parse({ id: "abc123", name: "Renamed" })
    ).not.toThrow();
  });

  it("rejects missing id", () => {
    expect(() => EditFolderInput.parse({ name: "Renamed" })).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => EditFolderInput.parse({ id: "abc123", name: "" })).toThrow();
  });
});
