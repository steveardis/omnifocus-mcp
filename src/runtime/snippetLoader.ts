import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNIPPETS_DIR = join(__dirname, "..", "snippets");

const cache = new Map<string, string>();

export function loadSnippet(name: string): string {
  if (cache.has(name)) {
    return cache.get(name)!;
  }

  const filePath = join(SNIPPETS_DIR, `${name}.js`);
  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch (err) {
    throw new Error(
      `Snippet not found: "${name}" (looked in ${filePath})`
    );
  }

  const matches = content.split("__ARGS__").length - 1;
  if (matches === 0) {
    throw new Error(
      `Snippet "${name}" contains no __ARGS__ placeholder. Every snippet must have exactly one.`
    );
  }
  if (matches > 1) {
    throw new Error(
      `Snippet "${name}" contains ${matches} __ARGS__ placeholders. Exactly one is required.`
    );
  }

  cache.set(name, content);
  return content;
}

/** For testing: clear the in-memory cache. */
export function clearSnippetCache(): void {
  cache.clear();
}
