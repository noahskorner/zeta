// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {
  AddProviderCommand,
  AddProviderResponse,
  AddToolCommand,
  AddToolResponse,
  CreateTaskCommand,
  ExecuteToolCommand,
  ExecuteToolResponse,
  ListProjectsResponse,
  ProviderEntity,
  ListToolsResponse,
  ListTasksResponse,
  ListTasksQuery,
  UpdateTaskCommand,
  UpdateTaskResponse,
  ToolExecutionStreamDataMessage,
  ToolExecutionStreamExitMessage,
} from '@zeta/commands';
import { contextBridge, ipcRenderer } from 'electron';

interface ProjectFileContent {
  content: string;
  isBinary: boolean;
  truncated: boolean;
}

contextBridge.exposeInMainWorld('zetaApi', {
  // Manage projects
  addProject: (): Promise<string | null> => ipcRenderer.invoke('projects:add'),
  listProjects: (): Promise<ListProjectsResponse> => ipcRenderer.invoke('projects:list'),
  // Manage tasks
  addTask: (command: CreateTaskCommand): Promise<string> =>
    ipcRenderer.invoke('tasks:add', command),
  listTasks: (query: ListTasksQuery): Promise<ListTasksResponse> =>
    ipcRenderer.invoke('tasks:list', query),
  updateTask: (command: UpdateTaskCommand): Promise<UpdateTaskResponse> =>
    ipcRenderer.invoke('tasks:update', command),
  // Manage providers
  addProvider: (command: AddProviderCommand): Promise<AddProviderResponse> =>
    ipcRenderer.invoke('providers:add', command),
  listProviders: (): Promise<{ providers: ProviderEntity[] }> =>
    ipcRenderer.invoke('providers:list'),
  // Manage tools
  addTool: (command: AddToolCommand): Promise<AddToolResponse> =>
    ipcRenderer.invoke('tools:add', command),
  listTools: (): Promise<ListToolsResponse> => ipcRenderer.invoke('tools:list'),
  executeTool: (command: ExecuteToolCommand): Promise<Omit<ExecuteToolResponse, 'stream'>> =>
    ipcRenderer.invoke('tools:execute', command),
  writeToolInput: (toolExecutionId: string, data: string): Promise<boolean> =>
    ipcRenderer.invoke('tools:execute:write', { toolExecutionId, data }),
  resizeToolTerminal: (toolExecutionId: string, cols: number, rows: number): Promise<boolean> =>
    ipcRenderer.invoke('tools:execute:resize', { toolExecutionId, cols, rows }),
  killToolExecution: (toolExecutionId: string): Promise<boolean> =>
    ipcRenderer.invoke('tools:execute:kill', toolExecutionId),
  onToolOutput: (cb: (message: ToolExecutionStreamDataMessage) => void) => {
    const handler = (_: unknown, msg: ToolExecutionStreamDataMessage) => cb(msg);
    ipcRenderer.on('tools:execute:data', handler);
    return () => ipcRenderer.removeListener('tools:execute:data', handler);
  },
  onToolExit: (cb: (message: ToolExecutionStreamExitMessage) => void) => {
    const handler = (_: unknown, msg: ToolExecutionStreamExitMessage) => cb(msg);
    ipcRenderer.on('tools:execute:exit', handler);
    return () => ipcRenderer.removeListener('tools:execute:exit', handler);
  },
  // Open the shared zeta app data folder in the OS file explorer.
  openAppDataFolder: (): Promise<string> => ipcRenderer.invoke('app:open-data-folder'),
  // Open a URL in the user's OS default browser/email client.
  openExternalUrl: (url: string): Promise<void> => ipcRenderer.invoke('app:open-external-url', url),
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
