import path from "node:path";
import { ProjectEntity } from "./project.entity";
import { readFile } from "node:fs/promises";
import { Repository } from "../repository";

export class ProjectsRepository extends Repository {
  protected readonly PROJECTS_FILE_PATH = path.join(
    this.STORAGE_PATH,
    "projects.json",
  );

  public async findAll(): Promise<ProjectEntity[]> {
    try {
      const raw = await readFile(this.PROJECTS_FILE_PATH, "utf8");
      const parsed = JSON.parse(raw) as ProjectEntity[];

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((project) => {
        return (
          typeof project?.name === "string" &&
          typeof project?.folderPath === "string" &&
          typeof project?.createdAt === "string"
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
}
