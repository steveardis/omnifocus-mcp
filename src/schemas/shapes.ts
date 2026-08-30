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

// ─── Recurrence ──────────────────────────────────────────────────────────────

const RepetitionFrequency = z.enum(["daily", "weekly", "monthly", "yearly"]);
const RepetitionMethod = z.enum(["fixed", "dueDate", "start"]);
const DayOfWeek = z.enum(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]);

export const RepetitionRuleInput = z.object({
  frequency: RepetitionFrequency,
  interval: z.number().int().positive().default(1),
  daysOfWeek: z.array(DayOfWeek).optional().describe("Only valid when frequency is 'weekly'"),
  method: RepetitionMethod,
});

export const RepetitionRuleDetail = z.object({
  frequency: RepetitionFrequency,
  interval: z.number(),
  daysOfWeek: z.array(DayOfWeek).optional(),
  method: RepetitionMethod,
});

// ─── Task ────────────────────────────────────────────────────────────────────

// Accepts either a full ISO datetime ("2026-07-17T00:00:00.000Z") or a bare
// date ("2026-07-17"). A bare date resolves to local midnight on the machine
// running the connector — the same local day OmniFocus itself uses to decide
// availability — rather than being parsed as UTC midnight.
const DateOrBareDate = z.union([z.string().date(), z.string().datetime()]);

export const TaskSummary = z.object({
  id: IdSchema,
  name: z.string(),
  status: TaskStatus,
  flagged: z.boolean(),
  containerId: IdSchema.nullable(),
  containerType: z.enum(["project", "inbox", "task"]).nullable(),
  dueDate: z.string().datetime().nullable(),
  deferDate: z.string().datetime().nullable(),
  plannedDate: z.string().datetime().nullable(),
  completionDate: z.string().datetime().nullable(),
  dropDate: z.string().datetime().nullable(),
  tagIds: z.array(IdSchema),
});

export const ListTasksFilter = z.object({
  flagged: z.literal(true).optional(),
  status: z.array(TaskStatus).optional(),
  tagId: IdSchema.optional(),
  dueBeforeDate: z.string().datetime().optional(),
  hasDeferDate: z.literal(true).optional().describe("Return only tasks that have a defer date set"),
  completedAfter: z.string().datetime().optional().describe("Return only tasks completed at or after this timestamp. NOTE: complete tasks are excluded by default, so this filter returns nothing unless you also pass status including \"complete\" (e.g. status: [\"complete\"])."),
  droppedAfter: z.string().datetime().optional().describe("Return only tasks dropped at or after this timestamp. NOTE: dropped tasks are excluded by default, so this filter returns nothing unless you also pass status including \"dropped\" (e.g. status: [\"dropped\"])."),
});

export const TaskDetail = z.object({
  id: IdSchema,
  name: z.string(),
  note: z.string(),
  status: TaskStatus,
  flagged: z.boolean(),
  deferDate: z.string().datetime().nullable(),
  plannedDate: z.string().datetime().nullable(),
  dueDate: z.string().datetime().nullable(),
  completionDate: z.string().datetime().nullable(),
  dropDate: z.string().datetime().nullable(),
  estimatedMinutes: z.number().nullable(),
  containerId: IdSchema.nullable(),
  containerType: z.enum(["project", "inbox", "task"]).nullable(),
  tagIds: z.array(IdSchema),
  parentTaskId: IdSchema.nullable(),
  repetitionRule: RepetitionRuleDetail.nullable(),
  sequential: z.boolean(),
});

export const CreateTaskInput = z
  .object({
    name: z.string().min(1),
    note: z.string().optional(),
    flagged: z.boolean().optional(),
    deferDate: DateOrBareDate.optional(),
    plannedDate: DateOrBareDate.optional(),
    dueDate: DateOrBareDate.optional(),
    estimatedMinutes: z.number().int().positive().optional(),
    projectId: IdSchema.optional(),
    parentTaskId: IdSchema.optional(),
    tagIds: z.array(IdSchema).optional(),
    repetitionRule: RepetitionRuleInput.optional(),
    sequential: z.boolean().optional().describe("Whether this task's own subtasks must be completed in order. Omit to leave OmniFocus's default (parallel)."),
  })
  .refine((d) => !(d.projectId && d.parentTaskId), {
    message: "Provide projectId or parentTaskId, not both",
  });

export const EditTaskInput = z.object({
  id: IdSchema,
  name: z.string().min(1).optional(),
  note: z.string().optional(),
  flagged: z.boolean().optional(),
  deferDate: DateOrBareDate.optional(),
  plannedDate: DateOrBareDate.optional(),
  dueDate: DateOrBareDate.optional(),
  clearDeferDate: z.literal(true).optional().describe("Set to true to clear the task's defer date"),
  clearPlannedDate: z.literal(true).optional().describe("Set to true to clear the task's planned date"),
  clearDueDate: z.literal(true).optional().describe("Set to true to clear the task's due date"),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  tagIds: z.array(IdSchema).optional(),
  repetitionRule: RepetitionRuleInput.optional(),
  clearRepetitionRule: z.literal(true).optional().describe("Set to true to clear the task's repetition rule"),
  sequential: z.boolean().optional().describe("Whether this task's own subtasks must be completed in order"),
});

// ─── Project ─────────────────────────────────────────────────────────────────

export const ReviewIntervalInput = z.object({
  steps: z.number().int().positive(),
  unit: z.enum(["days", "weeks", "months", "years"]),
});

export const CreateProjectInput = z.object({
  name: z.string().min(1),
  folderId: IdSchema.optional(),
  note: z.string().optional(),
  type: ProjectType.optional(),
  status: z.enum(["active", "onHold"]).optional(),
  flagged: z.boolean().optional(),
  deferDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  reviewInterval: ReviewIntervalInput.optional(),
  tagIds: z.array(IdSchema).optional(),
});

export const EditProjectInput = z.object({
  id: IdSchema,
  name: z.string().min(1).optional(),
  note: z.string().optional(),
  type: ProjectType.optional(),
  status: z.enum(["active", "onHold"]).optional(),
  flagged: z.boolean().optional(),
  deferDate: z.string().datetime().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  reviewInterval: ReviewIntervalInput.optional(),
  tagIds: z.array(IdSchema).optional(),
});

export const MoveTaskInput = z
  .object({
    id: IdSchema,
    projectId: IdSchema.optional(),
    parentTaskId: IdSchema.optional(),
  })
  .refine(
    (d) => (d.projectId !== undefined) !== (d.parentTaskId !== undefined),
    { message: "Exactly one of projectId or parentTaskId must be provided" }
  );

export const MoveProjectInput = z.object({
  id: IdSchema,
  folderId: IdSchema.nullable(),
});

export const ListFoldersFilter = z.object({
  status: FolderStatus.optional(),
});

export const ListTagsFilter = z.object({
  status: TagStatus.optional(),
});

export const ListProjectsFilter = z.object({
  status: z.array(ProjectStatus).optional(),
  folderId: IdSchema.optional(),
  flagged: z.literal(true).optional(),
});

export const ProjectSummary = z.object({
  id: IdSchema,
  name: z.string(),
  folderPath: z.string(),
  folderId: IdSchema.nullable(),
  status: ProjectStatus,
  type: ProjectType,
  flagged: z.boolean(),
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

export const CreateFolderInput = z.object({
  name: z.string().min(1),
  parentFolderId: IdSchema.optional(),
});

export const EditFolderInput = z.object({
  id: IdSchema,
  name: z.string().min(1),
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

export const CreateTagInput = z.object({
  name: z.string().min(1),
  parentTagId: IdSchema.optional(),
});

export const EditTagInput = z
  .object({
    id: IdSchema,
    name: z.string().min(1).optional(),
    status: TagStatus.optional(),
  })
  .refine((d) => d.name !== undefined || d.status !== undefined, {
    message: "Provide at least one of name or status",
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
