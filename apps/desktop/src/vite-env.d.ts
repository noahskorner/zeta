import { CreateTaskCommand, FindProjectsResponse } from "@zeta/commands";

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
      // Open the shared zeta app data folder in the OS file explorer.
      openApplicationDataFolder: () => Promise<string>;
      // Read files from a selected project for renderer views.
      listProjectFiles: (projectPath: string) => Promise<string[]>;
      readProjectFile: (projectPath: string, relativeFilePath: string) => Promise<ProjectFileContent>;
    };
  }
}

export {};
