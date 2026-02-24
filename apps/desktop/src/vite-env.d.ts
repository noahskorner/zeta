import {
  AddToolCommand,
  AddToolResponse,
  CreateTaskCommand,
  ExecuteToolCommand,
  ExecuteToolResponse,
  FindProjectsResponse,
  ListToolsResponse,
  ListTasksResponse,
  ListTasksQuery,
  ToolExecutionStreamDataMessage,
  ToolExecutionStreamExitMessage,
} from '@zeta/commands';

declare module '*.md?raw' {
  const content: string;
  export default content;
}

interface ProjectFileContent {
  content: string;
  isBinary: boolean;
  truncated: boolean;
}

declare global {
  const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
  const MAIN_WINDOW_VITE_NAME: string;

  interface Window {
    zetaApi: {
      // Manage projects from the desktop renderer.
      addProject: () => Promise<string | null>;
      listProjects: () => Promise<FindProjectsResponse>;
      // Manage tasks from the desktop renderer.
      addTask: (command: CreateTaskCommand) => Promise<string>;
      listTasks: (query: ListTasksQuery) => Promise<ListTasksResponse>;
      // Manage tools from the desktop renderer.
      addTool: (command: AddToolCommand) => Promise<AddToolResponse>;
      listTools: () => Promise<ListToolsResponse>;
      executeTool: (command: ExecuteToolCommand) => Promise<Omit<ExecuteToolResponse, 'stream'>>;
      writeToolInput: (toolExecutionId: string, data: string) => Promise<boolean>;
      resizeToolTerminal: (toolExecutionId: string, cols: number, rows: number) => Promise<boolean>;
      killToolExecution: (toolExecutionId: string) => Promise<boolean>;
      onToolOutput: (cb: (message: ToolExecutionStreamDataMessage) => void) => () => void;
      onToolExit: (cb: (message: ToolExecutionStreamExitMessage) => void) => () => void;
      // Open the shared zeta app data folder in the OS file explorer.
      openAppDataFolder: () => Promise<string>;
      // Open a URL using the operating system default external handler.
      openExternalUrl: (url: string) => Promise<void>;
      // Read files from a selected project for renderer views.
      listProjectFiles: (projectPath: string) => Promise<string[]>;
      readProjectFile: (
        projectPath: string,
        relativeFilePath: string,
      ) => Promise<ProjectFileContent>;
      // Control window actions from a custom desktop titlebar.
      minimizeWindow: () => Promise<void>;
      toggleMaximizeWindow: () => Promise<boolean>;
      closeWindow: () => Promise<void>;
      isWindowMaximized: () => Promise<boolean>;
      onWindowMaximizeStateChanged: (callback: (isMaximized: boolean) => void) => () => void;
    };
  }
}

export {};
