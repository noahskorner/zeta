import { stat } from "node:fs/promises";
import path from "node:path";
import { CreateTaskCommand } from "./create-task.command";
import { CreateTaskModel } from "./create-task.model";

export class CreateTaskService {
  public async execute(command: CreateTaskCommand): Promise<CreateTaskModel> {
    // Validate the selected project path is an existing directory.
    const absoluteProjectPath = path.resolve(command.projectPath);
    const projectStats = await stat(absoluteProjectPath);
    if (!projectStats.isDirectory()) {
      throw new Error(`Path is not a directory: ${absoluteProjectPath}`);
    }

    // Validate required input fields before touching git state.
    const name = command.name.trim();
    const friendlyName = command.friendlyName.trim();
    const description = command.description.trim();
    if (!name) {
      throw new Error("Task name is required.");
    }
    if (!friendlyName) {
      throw new Error("Task friendly name is required.");
    }
    if (!description) {
      throw new Error("Task description is required.");
    }

    // Validate this is a git repository and task name is a valid branch/worktree name.
    const git = await createSimpleGit(absoluteProjectPath);
    const isRepository = await git.checkIsRepo();
    if (!isRepository) {
      throw new Error(`Project is not a git repository: ${absoluteProjectPath}`);
    }
    await git.raw(["check-ref-format", "--branch", name]);

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
  const moduleName = "simple-git";
  const simpleGitModule = (await import(moduleName)) as {
    simpleGit: (directory: string) => GitClient;
  };

  return simpleGitModule.simpleGit(baseDir);
}
