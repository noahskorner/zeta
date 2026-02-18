import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export interface ProjectMetadata {
  name: string;
  folderPath: string;
  createdAt: string;
}

export interface CreateProjectInput {
  folderPath: string;
  projectName?: string;
  dataDir: string;
}

const PROJECTS_FILE = 'projects.json';

export function helloWorld(): string {
  return 'Hello from @zeta/commands';
}

export async function createProject(
  input: CreateProjectInput,
): Promise<ProjectMetadata> {
  const absoluteFolderPath = path.resolve(input.folderPath);
  const folderStats = await stat(absoluteFolderPath);

  if (!folderStats.isDirectory()) {
    throw new Error(`Path is not a directory: ${absoluteFolderPath}`);
  }

  const projects = await listProjects(input.dataDir);
  const alreadyExists = projects.some(
    (project) => path.resolve(project.folderPath) === absoluteFolderPath,
  );

  if (alreadyExists) {
    throw new Error(`Project already exists: ${absoluteFolderPath}`);
  }

  const name = input.projectName?.trim() || path.basename(absoluteFolderPath);
  const createdAt = new Date().toISOString();
  const nextProject: ProjectMetadata = {
    name,
    folderPath: absoluteFolderPath,
    createdAt,
  };

  await writeProjects(input.dataDir, [...projects, nextProject]);

  return nextProject;
}

export async function listProjects(dataDir: string): Promise<ProjectMetadata[]> {
  const projectsFilePath = getProjectsFilePath(dataDir);

  try {
    const raw = await readFile(projectsFilePath, 'utf8');
    const parsed = JSON.parse(raw) as ProjectMetadata[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((project) => {
      return (
        typeof project?.name === 'string' &&
        typeof project?.folderPath === 'string' &&
        typeof project?.createdAt === 'string'
      );
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return [];
    }

    throw error;
  }
}

export function getDefaultProjectDataDir(appName = 'zeta'): string {
  if (process.platform === 'win32') {
    const appDataPath = process.env.APPDATA;
    if (appDataPath) {
      return path.join(appDataPath, appName);
    }
  }

  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', appName);
  }

  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    return path.join(xdgConfigHome, appName);
  }

  return path.join(os.homedir(), '.config', appName);
}

function getProjectsFilePath(dataDir: string): string {
  return path.join(dataDir, PROJECTS_FILE);
}

async function writeProjects(
  dataDir: string,
  projects: ProjectMetadata[],
): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  const projectsFilePath = getProjectsFilePath(dataDir);
  await writeFile(projectsFilePath, JSON.stringify(projects, null, 2), 'utf8');
}
