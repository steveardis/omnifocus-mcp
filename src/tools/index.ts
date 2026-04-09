export { listProjectsTool } from "./listProjects.js";
export { getProjectTool } from "./getProject.js";
export { listFoldersTool } from "./listFolders.js";
export { getFolderTool } from "./getFolder.js";
export { listTasksTool } from "./listTasks.js";
export { getTaskTool } from "./getTask.js";
export { listTagsTool } from "./listTags.js";
export { getTagTool } from "./getTag.js";
export { resolveNameTool } from "./resolveName.js";
export { createTaskTool } from "./createTask.js";
export { editTaskTool } from "./editTask.js";
export { completeTaskTool } from "./completeTask.js";
export { dropTaskTool } from "./dropTask.js";
export { deleteTaskTool } from "./deleteTask.js";

import { listProjectsTool } from "./listProjects.js";
import { getProjectTool } from "./getProject.js";
import { listFoldersTool } from "./listFolders.js";
import { getFolderTool } from "./getFolder.js";
import { listTasksTool } from "./listTasks.js";
import { getTaskTool } from "./getTask.js";
import { listTagsTool } from "./listTags.js";
import { getTagTool } from "./getTag.js";
import { resolveNameTool } from "./resolveName.js";
import { createTaskTool } from "./createTask.js";
import { editTaskTool } from "./editTask.js";
import { completeTaskTool } from "./completeTask.js";
import { dropTaskTool } from "./dropTask.js";
import { deleteTaskTool } from "./deleteTask.js";

export const allTools = [
  listProjectsTool,
  getProjectTool,
  listFoldersTool,
  getFolderTool,
  listTasksTool,
  getTaskTool,
  listTagsTool,
  getTagTool,
  resolveNameTool,
  createTaskTool,
  editTaskTool,
  completeTaskTool,
  dropTaskTool,
  deleteTaskTool,
] as const;
