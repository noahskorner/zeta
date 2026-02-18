// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import type { ProjectMetadata } from '@zeta/commands';

interface ProjectFileContent {
  content: string;
  isBinary: boolean;
  truncated: boolean;
}

contextBridge.exposeInMainWorld('zetaApi', {
  addProject: (): Promise<ProjectMetadata | null> => ipcRenderer.invoke('projects:add'),
  listProjects: (): Promise<ProjectMetadata[]> => ipcRenderer.invoke('projects:list'),
  listProjectFiles: (projectPath: string): Promise<string[]> =>
    ipcRenderer.invoke('projects:list-files', projectPath),
  readProjectFile: (
    projectPath: string,
    relativeFilePath: string,
  ): Promise<ProjectFileContent> =>
    ipcRenderer.invoke('projects:read-file', projectPath, relativeFilePath),
});
