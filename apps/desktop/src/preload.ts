// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {
  CreateTaskCommand,
  FindProjectsResponse,
  ListTasksResponse,
  ListTasksQuery,
} from '@zeta/commands';
import { contextBridge, ipcRenderer } from 'electron';

interface ProjectFileContent {
  content: string;
  isBinary: boolean;
  truncated: boolean;
}

contextBridge.exposeInMainWorld('zetaApi', {
  // Manage projects from the desktop renderer.
  addProject: (): Promise<string | null> => ipcRenderer.invoke('projects:add'),
  listProjects: (): Promise<FindProjectsResponse> => ipcRenderer.invoke('projects:list'),
  // Manage tasks from the desktop renderer.
  addTask: (command: CreateTaskCommand): Promise<string> =>
    ipcRenderer.invoke('tasks:add', command),
  // List tasks for a specific project.
  listTasks: (query: ListTasksQuery): Promise<ListTasksResponse> =>
    ipcRenderer.invoke('tasks:list', query),
  // Open the shared zeta app data folder in the OS file explorer.
  openAppDataFolder: (): Promise<string> => ipcRenderer.invoke('app:open-data-folder'),
  listProjectFiles: (projectPath: string): Promise<string[]> =>
    ipcRenderer.invoke('projects:list-files', projectPath),
  readProjectFile: (projectPath: string, relativeFilePath: string): Promise<ProjectFileContent> =>
    ipcRenderer.invoke('projects:read-file', projectPath, relativeFilePath),
  // Control the native window from renderer custom titlebar buttons.
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  toggleMaximizeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:toggle-maximize'),
  closeWindow: (): Promise<void> => ipcRenderer.invoke('window:close'),
  isWindowMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),
  onWindowMaximizeStateChanged: (callback: (isMaximized: boolean) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, isMaximized: boolean) => {
      callback(isMaximized);
    };
    ipcRenderer.on('window:maximize-state-changed', listener);
    return () => {
      ipcRenderer.removeListener('window:maximize-state-changed', listener);
    };
  },
});
