import { stat } from "node:fs/promises";
import path from "node:path";
import { CreateProjectCommand } from "./create-project.command";
import { CreateProjectModel } from "./create-project.model";

export class CreateProjectService {
  public async execute(command: CreateProjectCommand): Promise<CreateProjectModel> {
    const absoluteFolderPath = path.resolve(command.folderPath);
    const folderStats = await stat(absoluteFolderPath);
    if (!folderStats.isDirectory()) {
      throw new Error(`Path is not a directory: ${absoluteFolderPath}`);
    }
    return {
      name: path.basename(absoluteFolderPath),
      folderPath: absoluteFolderPath,
    } satisfies CreateProjectModel;
  }
}
