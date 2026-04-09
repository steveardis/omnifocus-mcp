import { z } from "zod";
import {
  IdSchema,
  ProjectType,
  ProjectStatus,
  TaskStatus,
  TagStatus,
  FolderStatus,
  EntityType,
} from "./enums.js";

// ─── Task ────────────────────────────────────────────────────────────────────

export const TaskSummary = z.object({
  id: IdSchema,
  name: z.string(),
  status: TaskStatus,
  flagged: z.boolean(),
  containerId: IdSchema.nullable(),
  containerType: z.enum(["project", "inbox", "task"]).nullable(),
});

export const TaskDetail = z.object({
  id: IdSchema,
  name: z.string(),
  note: z.string(),
  status: TaskStatus,
  flagged: z.boolean(),
  deferDate: z.string().datetime().nullable(),
  dueDate: z.string().datetime().nullable(),
  completionDate: z.string().datetime().nullable(),
  estimatedMinutes: z.number().nullable(),
  containerId: IdSchema.nullable(),
  containerType: z.enum(["project", "inbox", "task"]).nullable(),
  tagIds: z.array(IdSchema),
});

// ─── Project ─────────────────────────────────────────────────────────────────

export const ProjectSummary = z.object({
  id: IdSchema,
  name: z.string(),
  folderPath: z.string(),
  status: ProjectStatus,
  type: ProjectType,
});

export const ProjectDetail = z.object({
  id: IdSchema,
  name: z.string(),
  note: z.string(),
  folderPath: z.string(),
  status: ProjectStatus,
  type: ProjectType,
  flagged: z.boolean(),
  deferDate: z.string().datetime().nullable(),
  dueDate: z.string().datetime().nullable(),
  completionDate: z.string().datetime().nullable(),
  reviewInterval: z.string().nullable(),
  nextReviewDate: z.string().datetime().nullable(),
  lastReviewDate: z.string().datetime().nullable(),
  tagIds: z.array(IdSchema),
});

// ─── Folder ──────────────────────────────────────────────────────────────────

export const FolderSummary = z.object({
  id: IdSchema,
  name: z.string(),
  path: z.string(),
  parentId: IdSchema.nullable(),
  status: FolderStatus,
});

export const FolderDetail = z.object({
  id: IdSchema,
  name: z.string(),
  path: z.string(),
  parentId: IdSchema.nullable(),
  status: FolderStatus,
  childFolderIds: z.array(IdSchema),
  projectIds: z.array(IdSchema),
});

// ─── Tag ─────────────────────────────────────────────────────────────────────

export const TagSummary = z.object({
  id: IdSchema,
  name: z.string(),
  path: z.string(),
  parentId: IdSchema.nullable(),
  status: TagStatus,
});

export const TagDetail = z.object({
  id: IdSchema,
  name: z.string(),
  path: z.string(),
  parentId: IdSchema.nullable(),
  status: TagStatus,
  childTagIds: z.array(IdSchema),
});

// ─── Resolution ──────────────────────────────────────────────────────────────

export const ResolveCandidate = z.object({
  id: IdSchema,
  name: z.string(),
  path: z.string(),
  type: EntityType,
});
