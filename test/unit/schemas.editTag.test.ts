import { describe, it, expect } from "vitest";
import { CreateTagInput, EditTagInput } from "../../src/schemas/index.js";

describe("CreateTagInput schema", () => {
  it("accepts name only (top-level)", () => {
    expect(() => CreateTagInput.parse({ name: "Waiting" })).not.toThrow();
  });

  it("accepts name with parentTagId", () => {
    expect(() =>
      CreateTagInput.parse({ name: "Email", parentTagId: "abc123" })
    ).not.toThrow();
  });

  it("rejects missing name", () => {
    expect(() => CreateTagInput.parse({})).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => CreateTagInput.parse({ name: "" })).toThrow();
  });
});

describe("EditTagInput schema", () => {
  it("accepts id with name only", () => {
    expect(() =>
      EditTagInput.parse({ id: "abc123", name: "Renamed" })
    ).not.toThrow();
  });

  it("accepts id with status only", () => {
    expect(() =>
      EditTagInput.parse({ id: "abc123", status: "onHold" })
    ).not.toThrow();
  });

  it("accepts id with both name and status", () => {
    expect(() =>
      EditTagInput.parse({ id: "abc123", name: "New", status: "active" })
    ).not.toThrow();
  });

  it("accepts all valid status values", () => {
    for (const status of ["active", "onHold", "dropped"] as const) {
      expect(() =>
        EditTagInput.parse({ id: "abc123", status })
      ).not.toThrow();
    }
  });

  it("rejects neither name nor status (refine)", () => {
    expect(() => EditTagInput.parse({ id: "abc123" })).toThrow();
  });

  it("rejects invalid status enum", () => {
    expect(() =>
      EditTagInput.parse({ id: "abc123", status: "paused" })
    ).toThrow();
  });

  it("rejects missing id", () => {
    expect(() => EditTagInput.parse({ name: "X" })).toThrow();
  });
});
