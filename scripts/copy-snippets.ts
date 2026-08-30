/**
 * Copies the OmniJS snippet templates into the compiled output tree.
 *
 * `tsc` only emits TypeScript sources, so the plain `.js` snippets under
 * `src/snippets/` never reach `dist/`. The snippet loader resolves them as a
 * sibling of its own compiled location (`dist/snippets/`), so without this step
 * every tool call fails with "snippet could not be loaded".
 */
import { copyFileSync, existsSync, mkdirSync, rmSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { ALLOWED_SNIPPETS } from "../src/runtime/snippetLoader.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

export const SNIPPET_SOURCE_DIR = join(repoRoot, "src/snippets");
export const SNIPPET_DEST_DIR = join(repoRoot, "dist/snippets");

/**
 * Mirrors every allowlisted snippet from `sourceDir` into `destDir`, replacing
 * whatever was there before so the output never carries stale snippets.
 * Returns the snippet names copied, in allowlist order.
 */
export function copySnippets(sourceDir: string, destDir: string): string[] {
  const missing = [...ALLOWED_SNIPPETS].filter(
    (name) => !existsSync(join(sourceDir, `${name}.js`))
  );
  if (missing.length > 0) {
    throw new Error(
      `Snippet source directory "${sourceDir}" is missing ${missing.length} ` +
        `allowlisted snippet(s): ${missing.join(", ")}`
    );
  }

  rmSync(destDir, { recursive: true, force: true });
  mkdirSync(destDir, { recursive: true });

  const copied: string[] = [];
  for (const name of ALLOWED_SNIPPETS) {
    copyFileSync(join(sourceDir, `${name}.js`), join(destDir, `${name}.js`));
    copied.push(name);
  }
  return copied;
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const copied = copySnippets(SNIPPET_SOURCE_DIR, SNIPPET_DEST_DIR);
  console.log(`Copied ${copied.length} snippets to ${SNIPPET_DEST_DIR}`);
}
