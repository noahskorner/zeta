import { stat } from 'node:fs/promises';
import path from 'node:path';
import { ProjectsRepository } from '../../projects';
import { CreateTaskCommand } from './create-task.command';
import { CreateTaskModel } from './create-task.model';

export class CreateTaskService {
  constructor(private _projectsRepository: ProjectsRepository = new ProjectsRepository()) {}

  public async execute(command: CreateTaskCommand): Promise<CreateTaskModel> {
    // Validate that the project exists
    const projects = await this._projectsRepository.findAll();
    const project = projects.find((candidate) => candidate.id === command.projectId);
    if (!project) {
      throw new Error(`Project not found: ${command.projectId}`);
    }

    // Validate the selected project path is an existing directory.
    const absoluteProjectPath = path.resolve(project.folderPath);
    const projectStats = await stat(absoluteProjectPath);
    if (!projectStats.isDirectory()) {
      throw new Error(`Path is not a directory: ${absoluteProjectPath}`);
    }

    // Validate required input fields before touching git state.
    const name = command.name.trim();
    const friendlyName = command.friendlyName.trim();
    const description = command.description.trim();
    if (!name) {
      throw new Error('Task name is required.');
    }
    if (!friendlyName) {
      throw new Error('Task friendly name is required.');
    }
    if (!description) {
      throw new Error('Task description is required.');
    }

    // Validate this is a git repository and task name is a valid branch/worktree name.
    const git = await createSimpleGit(absoluteProjectPath);
    const isRepository = await git.checkIsRepo();
    if (!isRepository) {
      throw new Error(`Project is not a git repository: ${absoluteProjectPath}`);
    }
    await git.raw(['check-ref-format', '--branch', name]);

    return {
      projectPath: absoluteProjectPath,
      name,
      friendlyName,
      description,
    } satisfies CreateTaskModel;
  }
}

type GitClient = {
  checkIsRepo: () => Promise<boolean>;
  raw: (commands: string[]) => Promise<string>;
};

async function createSimpleGit(baseDir: string): Promise<GitClient> {
  const moduleName = 'simple-git';
  const simpleGitModule = (await import(moduleName)) as {
    simpleGit: (directory: string) => GitClient;
  };

  return simpleGitModule.simpleGit(baseDir);
}
