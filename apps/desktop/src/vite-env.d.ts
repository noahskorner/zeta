import { CreateTaskCommand, FindProjectsResponse } from "@zeta/commands";

declare global {
  const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
  const MAIN_WINDOW_VITE_NAME: string;

  interface Window {
    zetaApi: {
      addProject: () => Promise<string | null>;
      listProjects: () => Promise<FindProjectsResponse>;
      addTask: (command: CreateTaskCommand) => Promise<string>;
    };
  }
}

export {};
