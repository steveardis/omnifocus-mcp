import { describe, it, expect } from "vitest";
import { RepetitionRuleInput, CreateTaskInput, EditTaskInput } from "../../src/schemas/index.js";

describe("RepetitionRuleInput schema", () => {
  it("accepts daily repetition", () => {
    expect(() =>
      RepetitionRuleInput.parse({ frequency: "daily", interval: 1, method: "fixed" })
    ).not.toThrow();
  });

  it("accepts weekly repetition with daysOfWeek", () => {
    expect(() =>
      RepetitionRuleInput.parse({
        frequency: "weekly",
        interval: 2,
        daysOfWeek: ["monday", "wednesday", "friday"],
        method: "start",
      })
    ).not.toThrow();
  });

  it("accepts monthly repetition", () => {
    expect(() =>
      RepetitionRuleInput.parse({ frequency: "monthly", interval: 1, method: "dueDate" })
    ).not.toThrow();
  });

  it("accepts yearly repetition", () => {
    expect(() =>
      RepetitionRuleInput.parse({ frequency: "yearly", interval: 1, method: "fixed" })
    ).not.toThrow();
  });

  it("defaults interval to 1 when omitted", () => {
    const result = RepetitionRuleInput.parse({ frequency: "daily", method: "fixed" });
    expect(result.interval).toBe(1);
  });

  it("rejects interval of zero", () => {
    expect(() =>
      RepetitionRuleInput.parse({ frequency: "daily", interval: 0, method: "fixed" })
    ).toThrow();
  });

  it("rejects negative interval", () => {
    expect(() =>
      RepetitionRuleInput.parse({ frequency: "weekly", interval: -1, method: "fixed" })
    ).toThrow();
  });

  it("rejects invalid frequency", () => {
    expect(() =>
      RepetitionRuleInput.parse({ frequency: "hourly", interval: 1, method: "fixed" })
    ).toThrow();
  });

  it("rejects invalid method", () => {
    expect(() =>
      RepetitionRuleInput.parse({ frequency: "daily", interval: 1, method: "completion" })
    ).toThrow();
  });
});

describe("CreateTaskInput with repetitionRule", () => {
  it("accepts task without repetitionRule (backward compat)", () => {
    expect(() => CreateTaskInput.parse({ name: "Buy milk" })).not.toThrow();
  });

  it("accepts task with repetitionRule", () => {
    expect(() =>
      CreateTaskInput.parse({
        name: "Stand-up",
        repetitionRule: { frequency: "daily", interval: 1, method: "fixed" },
      })
    ).not.toThrow();
  });
});

describe("EditTaskInput with repetitionRule", () => {
  it("accepts edit without repetitionRule (leave unchanged)", () => {
    expect(() => EditTaskInput.parse({ id: "abc", flagged: true })).not.toThrow();
  });

  it("accepts edit with repetitionRule object (set rule)", () => {
    expect(() =>
      EditTaskInput.parse({
        id: "abc",
        repetitionRule: { frequency: "weekly", interval: 1, method: "start" },
      })
    ).not.toThrow();
  });

  it("accepts edit with clearRepetitionRule true (clear rule)", () => {
    expect(() =>
      EditTaskInput.parse({ id: "abc", clearRepetitionRule: true })
    ).not.toThrow();
  });
});

describe("EditTaskInput clear date flags", () => {
  it("accepts clearDeferDate: true", () => {
    expect(() =>
      EditTaskInput.parse({ id: "abc", clearDeferDate: true })
    ).not.toThrow();
  });

  it("accepts clearPlannedDate: true", () => {
    expect(() =>
      EditTaskInput.parse({ id: "abc", clearPlannedDate: true })
    ).not.toThrow();
  });

  it("accepts clearDueDate: true", () => {
    expect(() =>
      EditTaskInput.parse({ id: "abc", clearDueDate: true })
    ).not.toThrow();
  });

  it("accepts setting a date string (no clear flag)", () => {
    expect(() =>
      EditTaskInput.parse({ id: "abc", dueDate: "2026-04-15T09:00:00.000Z" })
    ).not.toThrow();
  });

  it("rejects null for deferDate (must use clearDeferDate flag)", () => {
    expect(() =>
      EditTaskInput.parse({ id: "abc", deferDate: null })
    ).toThrow();
  });

  it("rejects null for dueDate (must use clearDueDate flag)", () => {
    expect(() =>
      EditTaskInput.parse({ id: "abc", dueDate: null })
    ).toThrow();
  });
});
