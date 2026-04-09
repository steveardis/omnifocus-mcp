import { describe, it, expect } from "vitest";
import {
  ProjectType,
  ProjectStatus,
  TaskStatus,
  FolderStatus,
  TagStatus,
  TaskSummary,
  TaskDetail,
  ProjectSummary,
  FolderSummary,
  TagSummary,
} from "../../src/schemas/index.js";

describe("ProjectType enum", () => {
  it("accepts valid values", () => {
    expect(ProjectType.parse("parallel")).toBe("parallel");
    expect(ProjectType.parse("sequential")).toBe("sequential");
    expect(ProjectType.parse("singleActions")).toBe("singleActions");
  });

  it("rejects boolean (the sequential-as-boolean regression)", () => {
    expect(() => ProjectType.parse(true)).toThrow();
    expect(() => ProjectType.parse(false)).toThrow();
  });

  it("rejects string 'true' (the sequential-as-string regression)", () => {
    expect(() => ProjectType.parse("true")).toThrow();
    expect(() => ProjectType.parse("false")).toThrow();
  });
});

describe("ProjectSummary schema", () => {
  const valid = {
    id: "abc123",
    name: "My Project",
    folderPath: "Work ▸ Projects",
    status: "active",
    type: "parallel",
  };

  it("parses a valid summary", () => {
    expect(() => ProjectSummary.parse(valid)).not.toThrow();
  });

  it("rejects empty id", () => {
    expect(() => ProjectSummary.parse({ ...valid, id: "" })).toThrow();
  });

  it("rejects invalid status", () => {
    expect(() =>
      ProjectSummary.parse({ ...valid, status: "unknown" })
    ).toThrow();
  });
});

describe("TaskSummary schema", () => {
  const valid = {
    id: "t1",
    name: "Buy milk",
    status: "available",
    flagged: false,
    containerId: "p1",
    containerType: "project",
  };

  it("parses a valid task summary", () => {
    expect(() => TaskSummary.parse(valid)).not.toThrow();
  });

  it("rejects items-as-string on TaskDetail (the batch_remove_items regression)", () => {
    // The regression: passing a serialised JSON string where an array is expected
    const detailBase = {
      id: "t1", name: "Buy milk", note: "", status: "available",
      flagged: false, deferDate: null, dueDate: null, completionDate: null,
      estimatedMinutes: null, containerId: "p1", containerType: "project",
    };
    expect(() =>
      TaskDetail.parse({ ...detailBase, tagIds: '["abc"]' })
    ).toThrow();
  });
});

describe("FolderSummary schema", () => {
  it("parses valid folder summary with null parent", () => {
    expect(() =>
      FolderSummary.parse({
        id: "f1",
        name: "Work",
        path: "Work",
        parentId: null,
        status: "active",
      })
    ).not.toThrow();
  });

  it("rejects invalid status", () => {
    expect(() =>
      FolderSummary.parse({
        id: "f1",
        name: "Work",
        path: "Work",
        parentId: null,
        status: "onHold", // folders only have active/dropped
      })
    ).toThrow();
  });
});

describe("TagSummary schema", () => {
  it("parses valid tag summary with onHold status", () => {
    expect(() =>
      TagSummary.parse({
        id: "t1",
        name: "Waiting",
        path: "Waiting",
        parentId: null,
        status: "onHold",
      })
    ).not.toThrow();
  });
});
