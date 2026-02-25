import { stat } from "node:fs/promises";
import path from "node:path";
import { UpdateTaskCommand } from "./update-task.command";
import { UpdateTaskModel } from "./update-task.model";

export class UpdateTaskService {
  public async execute(command: UpdateTaskCommand): Promise<UpdateTaskModel> {
    // Validate the selected project path is an existing directory.
    const absoluteProjectPath = path.resolve(command.projectPath);
    const projectStats = await stat(absoluteProjectPath);
    if (!projectStats.isDirectory()) {
      throw new Error(`Path is not a directory: ${absoluteProjectPath}`);
    }

    // Normalize and validate update target and any provided field values.
    const taskId = command.taskId.trim();
    const friendlyName = command.friendlyName?.trim();
    const description = command.description?.trim();
    if (!taskId) {
      throw new Error("Task id is required.");
    }
    if (friendlyName !== undefined && !friendlyName) {
      throw new Error("Task friendly name is required.");
    }
    if (description !== undefined && !description) {
      throw new Error("Task description is required.");
    }
    if (friendlyName === undefined && description === undefined) {
      throw new Error("Provide at least one field to update.");
    }

    // Validate this is a git repository before mutating task metadata.
    const git = await createSimpleGit(absoluteProjectPath);
    const isRepository = await git.checkIsRepo();
    if (!isRepository) {
      throw new Error(`Project is not a git repository: ${absoluteProjectPath}`);
    }

    return {
      projectPath: absoluteProjectPath,
      taskId,
      friendlyName,
      description,
    } satisfies UpdateTaskModel;
  }
}

type GitClient = {
  checkIsRepo: () => Promise<boolean>;
};

async function createSimpleGit(baseDir: string): Promise<GitClient> {
  const moduleName = "simple-git";
  const simpleGitModule = (await import(moduleName)) as {
    simpleGit: (directory: string) => GitClient;
  };

  return simpleGitModule.simpleGit(baseDir);
}
