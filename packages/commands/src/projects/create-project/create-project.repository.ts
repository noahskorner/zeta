import { mkdir, writeFile } from "node:fs/promises";
import { CreateProjectModel } from "./create-project.model";
import { ProjectsRepository } from "../projects.repository";
import { ProjectEntity } from "../project.entity";

export class CreateProjectRepository extends ProjectsRepository {
  public async exists(folderPath: string): Promise<boolean> {
    // Load the existing projects
    const projects = await this.findAll();

    // Check if a project with the same folder path already exists
    return projects.some((project) => project.folderPath === folderPath);
  }

  public async createProject(model: CreateProjectModel): Promise<string> {
    // TODO: We could probably move this to a central place, so we don't have to worry about it.
    // Create the initial storage directory if it doesn't exist
    await mkdir(this.STORAGE_PATH, { recursive: true });

    // Load the existing projects
    const projects = await this.findAll();

    // Update the projects list with the new project
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await writeFile(
      this.PROJECTS_FILE_PATH,
      JSON.stringify(
        [
          ...projects,
          {
            ...model,
            id,
            createdAt,
          } satisfies ProjectEntity,
        ],
        null,
        2,
      ),
      "utf8",
    );

    // Return the project id
    return id;
  }
}
