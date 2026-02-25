import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { TaskEntity } from "../task.entity";
import { UpdateTaskModel } from "./update-task.model";
import { UpdateTaskResponse } from "./update-task.response";

export class UpdateTaskRepository {
  public async updateTask(model: UpdateTaskModel): Promise<UpdateTaskResponse> {
    // Ensure project-local metadata storage exists before reading and writing tasks.
    const metadataDirectoryPath = path.join(model.projectPath, ".zeta");
    const tasksFilePath = path.join(metadataDirectoryPath, "tasks.json");
    await mkdir(metadataDirectoryPath, { recursive: true });

    const tasks = await this.findAll(tasksFilePath);
    const taskIndex = tasks.findIndex((task) => task.id === model.taskId);
    if (taskIndex < 0) {
      throw new Error(`Task not found: ${model.taskId}`);
    }

    // Persist the updated metadata while preserving immutable task fields.
    const existingTask = tasks[taskIndex];
    const updatedTask = {
      ...existingTask,
      friendlyName: model.friendlyName ?? existingTask.friendlyName,
      description: model.description ?? existingTask.description,
    } satisfies TaskEntity;

    tasks[taskIndex] = updatedTask;
    await writeFile(tasksFilePath, JSON.stringify(tasks, null, 2), "utf8");

    return {
      id: updatedTask.id,
      name: updatedTask.name,
      friendlyName: updatedTask.friendlyName,
      description: updatedTask.description,
      createdAt: updatedTask.createdAt,
    } satisfies UpdateTaskResponse;
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
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        return [];
      }

      throw error;
    }
  }
}
