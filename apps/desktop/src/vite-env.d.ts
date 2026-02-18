declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

interface ProjectMetadata {
  name: string;
  folderPath: string;
  createdAt: string;
}

interface ProjectFileContent {
  content: string;
  isBinary: boolean;
  truncated: boolean;
}

interface Window {
  zetaApi: {
    addProject: () => Promise<ProjectMetadata | null>;
    listProjects: () => Promise<ProjectMetadata[]>;
    listProjectFiles: (projectPath: string) => Promise<string[]>;
    readProjectFile: (
      projectPath: string,
      relativeFilePath: string,
    ) => Promise<ProjectFileContent>;
  };
}
