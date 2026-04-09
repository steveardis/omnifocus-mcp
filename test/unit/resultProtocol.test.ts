import { describe, it, expect } from "vitest";
import { parseResultLine, ExecutionError } from "../../src/runtime/resultProtocol.js";

describe("parseResultLine", () => {
  it("parses a well-formed success envelope", () => {
    const stdout = JSON.stringify({ ok: true, data: { id: "abc" } });
    const result = parseResultLine(stdout);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ id: "abc" });
    }
  });

  it("parses a well-formed error envelope", () => {
    const stdout = JSON.stringify({
      ok: false,
      error: { name: "NotFoundError", message: "Not found", stack: "..." },
    });
    const result = parseResultLine(stdout);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.name).toBe("NotFoundError");
      expect(result.error.message).toBe("Not found");
    }
  });

  it("selects first parseable JSON line when preceded by chatter", () => {
    const stdout =
      "osascript warning: something\nnot json at all\n" +
      JSON.stringify({ ok: true, data: [1, 2, 3] }) +
      "\n";
    const result = parseResultLine(stdout);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual([1, 2, 3]);
    }
  });

  it("throws on empty stdout", () => {
    expect(() => parseResultLine("")).toThrow(/No valid JSON result envelope/);
  });

  it("throws on non-envelope JSON", () => {
    expect(() => parseResultLine('{"foo":"bar"}')).toThrow(/not a valid result envelope/);
  });

  it("throws on malformed-only stdout with no parseable lines", () => {
    expect(() => parseResultLine("not json\nalso not json\n")).toThrow(
      /No valid JSON result envelope/
    );
  });
});

describe("ExecutionError", () => {
  it("carries name, message, and stack from the error detail", () => {
    const err = new ExecutionError({
      name: "TypeError",
      message: "cannot read property",
      stack: "TypeError: cannot...\n  at line 1",
    });
    expect(err.message).toBe("cannot read property");
    expect(err.errorName).toBe("TypeError");
    expect(err.remoteStack).toContain("TypeError:");
    expect(err.name).toBe("ExecutionError");
  });

  it("works without a stack field", () => {
    const err = new ExecutionError({ name: "Error", message: "boom" });
    expect(err.remoteStack).toBeUndefined();
  });
});
