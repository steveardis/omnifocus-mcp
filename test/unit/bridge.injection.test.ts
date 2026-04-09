import { describe, it, expect } from "vitest";

/**
 * Proves Design Decision 2:
 * JSON.stringify(args) produces a valid JS expression for any args value,
 * including apostrophes, quotes, backslashes, newlines, and unicode.
 *
 * We test the injection logic directly without hitting the bridge or OmniFocus.
 */

const TRICKY_ARGS = {
  name: "Finn's \"birthday\" 🎯",
  note: "line1\nline2\ttabbed",
  path: "Work ▸ Clients ▸ Acme",
  backslash: "C:\\Users\\test",
  unicode: "\u2603 snowman \u0000 null",
};

function injectArgs(template: string, args: unknown): string {
  return template.replace("__ARGS__", JSON.stringify(args));
}

describe("argument injection safety", () => {
  it("produces valid JavaScript for tricky string values", () => {
    const template = "(() => { const args = __ARGS__; return args; })()";
    const injected = injectArgs(template, TRICKY_ARGS);
    // new Function wraps the body in a function; we eval the IIFE directly
    let result: unknown;
    expect(() => {
      result = new Function(`return ${injected}`)();
    }).not.toThrow();
    expect(result).toEqual(TRICKY_ARGS);
  });

  it("recovers apostrophes exactly", () => {
    const template = "(() => { const args = __ARGS__; return args; })()";
    const args = { name: "it's a test's value" };
    const injected = injectArgs(template, args);
    const result = new Function(`return ${injected}`)() as typeof args;
    expect(result.name).toBe("it's a test's value");
  });

  it("recovers double quotes exactly", () => {
    const template = "(() => { const args = __ARGS__; return args; })()";
    const args = { name: 'She said "hello"' };
    const injected = injectArgs(template, args);
    const result = new Function(`return ${injected}`)() as typeof args;
    expect(result.name).toBe('She said "hello"');
  });

  it("recovers newlines exactly", () => {
    const template = "(() => { const args = __ARGS__; return args; })()";
    const args = { note: "line1\nline2\nline3" };
    const injected = injectArgs(template, args);
    const result = new Function(`return ${injected}`)() as typeof args;
    expect(result.note).toBe("line1\nline2\nline3");
  });

  it("recovers unicode exactly", () => {
    const template = "(() => { const args = __ARGS__; return args; })()";
    const args = { symbol: "▸ ★ 🎉" };
    const injected = injectArgs(template, args);
    const result = new Function(`return ${injected}`)() as typeof args;
    expect(result.symbol).toBe("▸ ★ 🎉");
  });
});
