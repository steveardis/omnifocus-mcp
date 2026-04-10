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
export { createProjectTool } from "./createProject.js";
export { editProjectTool } from "./editProject.js";
export { completeProjectTool } from "./completeProject.js";
export { dropProjectTool } from "./dropProject.js";
export { deleteProjectTool } from "./deleteProject.js";
export { createFolderTool } from "./createFolder.js";
export { editFolderTool } from "./editFolder.js";
export { deleteFolderTool } from "./deleteFolder.js";
export { createTagTool } from "./createTag.js";
export { editTagTool } from "./editTag.js";
export { deleteTagTool } from "./deleteTag.js";
export { moveTaskTool } from "./moveTask.js";
export { moveProjectTool } from "./moveProject.js";

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
import { createProjectTool } from "./createProject.js";
import { editProjectTool } from "./editProject.js";
import { completeProjectTool } from "./completeProject.js";
import { dropProjectTool } from "./dropProject.js";
import { deleteProjectTool } from "./deleteProject.js";
import { createFolderTool } from "./createFolder.js";
import { editFolderTool } from "./editFolder.js";
import { deleteFolderTool } from "./deleteFolder.js";
import { createTagTool } from "./createTag.js";
import { editTagTool } from "./editTag.js";
import { deleteTagTool } from "./deleteTag.js";
import { moveTaskTool } from "./moveTask.js";
import { moveProjectTool } from "./moveProject.js";

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
  createProjectTool,
  editProjectTool,
  completeProjectTool,
  dropProjectTool,
  deleteProjectTool,
  createFolderTool,
  editFolderTool,
  deleteFolderTool,
  createTagTool,
  editTagTool,
  deleteTagTool,
  moveTaskTool,
  moveProjectTool,
] as const;
