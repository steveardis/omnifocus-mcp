import { describe, it, expect } from "vitest";
import { MoveTaskInput, MoveProjectInput } from "../../src/schemas/index.js";

describe("MoveTaskInput schema", () => {
  it("accepts projectId only", () => {
    expect(() =>
      MoveTaskInput.parse({ id: "t1", projectId: "p1" })
    ).not.toThrow();
  });

  it("accepts parentTaskId only", () => {
    expect(() =>
      MoveTaskInput.parse({ id: "t1", parentTaskId: "t2" })
    ).not.toThrow();
  });

  it("rejects both projectId and parentTaskId", () => {
    expect(() =>
      MoveTaskInput.parse({ id: "t1", projectId: "p1", parentTaskId: "t2" })
    ).toThrow();
  });

  it("rejects neither projectId nor parentTaskId", () => {
    expect(() =>
      MoveTaskInput.parse({ id: "t1" })
    ).toThrow();
  });

  it("rejects missing id", () => {
    expect(() =>
      MoveTaskInput.parse({ projectId: "p1" })
    ).toThrow();
  });
});

describe("MoveProjectInput schema", () => {
  it("accepts folderId as string", () => {
    expect(() =>
      MoveProjectInput.parse({ id: "p1", folderId: "f1" })
    ).not.toThrow();
  });

  it("accepts folderId as null", () => {
    expect(() =>
      MoveProjectInput.parse({ id: "p1", folderId: null })
    ).not.toThrow();
  });

  it("rejects missing id", () => {
    expect(() =>
      MoveProjectInput.parse({ folderId: "f1" })
    ).toThrow();
  });

  it("rejects missing folderId (undefined not same as null)", () => {
    expect(() =>
      MoveProjectInput.parse({ id: "p1" })
    ).toThrow();
  });
});
