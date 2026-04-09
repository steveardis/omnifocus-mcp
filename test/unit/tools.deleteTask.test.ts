import { describe, it, expect } from "vitest";
import { deleteTaskTool } from "../../src/tools/deleteTask.js";

describe("deleteTask tool description", () => {
  it("contains confirmation language", () => {
    const desc = deleteTaskTool.description.toLowerCase();
    expect(desc).toMatch(/confirm/);
  });

  it("mentions permanent deletion", () => {
    const desc = deleteTaskTool.description.toLowerCase();
    expect(desc).toMatch(/permanent/);
  });

  it("warns about subtasks", () => {
    const desc = deleteTaskTool.description.toLowerCase();
    expect(desc).toMatch(/subtask/);
  });
});
