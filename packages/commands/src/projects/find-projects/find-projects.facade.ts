import { ProjectsRepository } from "../projects.repository";
import { FindProjectResponse, FindProjectsResponse } from "./find-projects.response";

export class FindProjectsFacade {
  constructor(private _repository: ProjectsRepository) {}

  public async execute(): Promise<FindProjectsResponse> {
    // Load the projects
    const projects = await this._repository.findAll();

    // Return the response
    return {
      projects: projects.map(
        (project) =>
          ({
            id: project.id,
            createdAt: project.createdAt,
            name: project.name,
            folderPath: project.folderPath,
          }) satisfies FindProjectResponse,
      ),
    } satisfies FindProjectsResponse;
  }
}
