import path from "node:path";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { TaskEntity } from "../task.entity";
import { CreateTaskModel } from "./create-task.model";

export class CreateTaskRepository {
  public async createTask(model: CreateTaskModel): Promise<string> {
    // Ensure project-local metadata and task storage exist before write operations.
    const metadataDirectoryPath = path.join(model.projectPath, ".zeta");
    const tasksFilePath = path.join(metadataDirectoryPath, "tasks.json");
    await mkdir(metadataDirectoryPath, { recursive: true });

    // Ensure a dedicated worktree folder exists and create a new worktree for this task.
    const worktreeRootPath = path.join(model.projectPath, ".worktrees");
    const worktreePath = path.join(worktreeRootPath, model.name);
    await mkdir(worktreeRootPath, { recursive: true });
    await this.assertPathDoesNotExist(worktreePath);

    const git = await createSimpleGit(model.projectPath);
    await git.raw(["worktree", "add", "-b", model.name, worktreePath]);

    // Append the new task to persisted project tasks.
    const tasks = await this.findAll(tasksFilePath);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await writeFile(
      tasksFilePath,
      JSON.stringify(
        [
          ...tasks,
          {
            id,
            name: model.name,
            friendlyName: model.friendlyName,
            description: model.description,
            createdAt,
          } satisfies TaskEntity,
        ],
        null,
        2,
      ),
      "utf8",
    );

    return id;
  }

  private async findAll(tasksFilePath: string): Promise<TaskEntity[]> {
    try {
      const raw = await readFile(tasksFilePath, "utf8");
      const parsed = JSON.parse(raw) as TaskEntity[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((task) => {
        return (
          typeof task?.id === "string" &&
          typeof task?.name === "string" &&
          typeof task?.friendlyName === "string" &&
          typeof task?.description === "string" &&
          typeof task?.createdAt === "string"
        );
      });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return [];
      }

      throw error;
    }
  }

  private async assertPathDoesNotExist(targetPath: string): Promise<void> {
    try {
      await access(targetPath);
      throw new Error(`Worktree path already exists: ${targetPath}`);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return;
      }

      throw error;
    }
  }
}

type GitClient = {
  raw: (commands: string[]) => Promise<string>;
};

async function createSimpleGit(baseDir: string): Promise<GitClient> {
  const moduleName = "simple-git";
  const simpleGitModule = (await import(moduleName)) as {
    simpleGit: (directory: string) => GitClient;
  };

  return simpleGitModule.simpleGit(baseDir);
}
