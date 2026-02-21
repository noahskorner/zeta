// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { CreateTaskCommand, FindProjectsResponse } from "@zeta/commands";
import { contextBridge, ipcRenderer } from "electron";

interface ProjectFileContent {
  content: string;
  isBinary: boolean;
  truncated: boolean;
}

contextBridge.exposeInMainWorld("zetaApi", {
  addProject: (): Promise<string | null> => ipcRenderer.invoke("projects:add"),
  listProjects: (): Promise<FindProjectsResponse> => ipcRenderer.invoke("projects:list"),
  addTask: (command: CreateTaskCommand): Promise<string> =>
    ipcRenderer.invoke("tasks:add", command),
  listProjectFiles: (projectPath: string): Promise<string[]> =>
    ipcRenderer.invoke("projects:list-files", projectPath),
  readProjectFile: (projectPath: string, relativeFilePath: string): Promise<ProjectFileContent> =>
    ipcRenderer.invoke("projects:read-file", projectPath, relativeFilePath),
});
