import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { runSnippet } from "../../src/runtime/bridge.js";
import { createTestFolder, cleanupTestFolder, createTestProject, type TestFixture } from "./fixtures.js";
import { ProjectSummary } from "../../src/schemas/index.js";
import { z } from "zod";

const ProjectSummaryArray = z.array(ProjectSummary);

describe("list_projects filtering (integration)", () => {
  let fixture: TestFixture;
  let activeProjectId: string;
  let flaggedProjectId: string;
  let completedProjectId: string;

  beforeAll(async () => {
    fixture = await createTestFolder();

    // Active unflagged project
    activeProjectId = await createTestProject(fixture.folderId, "__mcp_active_proj__");

    // Flagged project
    const flaggedRaw = await runSnippet("create_project", {
      name: "__mcp_flagged_proj__",
      folderId: fixture.folderId,
      flagged: true,
    });
    flaggedProjectId = (flaggedRaw as { id: string }).id;

    // Completed project
    completedProjectId = await createTestProject(fixture.folderId, "__mcp_done_proj__");
    await runSnippet("complete_project", { id: completedProjectId });
  });

  afterAll(async () => {
    await cleanupTestFolder(fixture.folderId);
  });

  it("returns folderId and flagged on each project summary", async () => {
    const raw = await runSnippet("list_projects", { filter: { folderId: fixture.folderId } });
    const projects = ProjectSummaryArray.parse(raw);
    expect(projects.length).toBeGreaterThan(0);
    for (const p of projects) {
      expect(p).toHaveProperty("folderId");
      expect(p).toHaveProperty("flagged");
      expect(typeof p.flagged).toBe("boolean");
    }
  });

  it("default excludes done and dropped projects", async () => {
    const raw = await runSnippet("list_projects", { filter: { folderId: fixture.folderId } });
    const projects = ProjectSummaryArray.parse(raw);
    expect(projects.some((p) => p.id === completedProjectId)).toBe(false);
    expect(projects.some((p) => p.id === activeProjectId)).toBe(true);
  });

  it("explicit status filter retrieves done projects", async () => {
    const raw = await runSnippet("list_projects", {
      filter: { folderId: fixture.folderId, status: ["done"] },
    });
    const projects = ProjectSummaryArray.parse(raw);
    expect(projects.some((p) => p.id === completedProjectId)).toBe(true);
    expect(projects.every((p) => p.status === "done")).toBe(true);
  });

  it("folderId filter returns only projects in that subtree", async () => {
    const raw = await runSnippet("list_projects", { filter: { folderId: fixture.folderId } });
    const projects = ProjectSummaryArray.parse(raw);
    expect(projects.every((p) => p.folderId === fixture.folderId)).toBe(true);
  });

  it("flagged filter returns only flagged projects", async () => {
    const raw = await runSnippet("list_projects", {
      filter: { folderId: fixture.folderId, flagged: true },
    });
    const projects = ProjectSummaryArray.parse(raw);
    expect(projects.length).toBeGreaterThan(0);
    expect(projects.every((p) => p.flagged)).toBe(true);
    expect(projects.some((p) => p.id === flaggedProjectId)).toBe(true);
    expect(projects.some((p) => p.id === activeProjectId)).toBe(false);
  });

  it("limit caps the number of returned projects", async () => {
    const raw = await runSnippet("list_projects", { limit: 1 });
    const projects = ProjectSummaryArray.parse(raw);
    expect(projects.length).toBeLessThanOrEqual(1);
  });

  it("non-existent folderId returns not-found error", async () => {
    await expect(
      runSnippet("list_projects", { filter: { folderId: "nonexistent-id-xyz" } })
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as Record<string, unknown>;
      return err.name === "ExecutionError" && err.errorName === "NotFoundError";
    });
  });
});
