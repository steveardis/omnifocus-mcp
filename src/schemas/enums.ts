import { z } from "zod";

export const IdSchema = z.string().min(1, "ID must be a non-empty string");

export const EntityType = z.enum([
  "task",
  "project",
  "folder",
  "tag",
  "perspective",
]);

export const ProjectType = z.enum(["parallel", "sequential", "singleActions"]);

export const ProjectStatus = z.enum(["active", "onHold", "done", "dropped"]);

export const TaskStatus = z.enum([
  "available",
  "incomplete",
  "completedByChildren",
  "complete",
  "dropped",
  "dueSoon",
  "overdue",
  "flagged",
  "blocked",
  "next",
]);

export const TagStatus = z.enum(["active", "onHold", "dropped"]);

export const FolderStatus = z.enum(["active", "dropped"]);
