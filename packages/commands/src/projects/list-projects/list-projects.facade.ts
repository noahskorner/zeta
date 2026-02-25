import { ProjectsRepository } from '../projects.repository';
import { ListProjectResponse, ListProjectsResponse } from './list-projects.response';

export class ListProjectsFacade {
  constructor(private _repository: ProjectsRepository) {}

  public async execute(): Promise<ListProjectsResponse> {
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
          }) satisfies ListProjectResponse,
      ),
    } satisfies ListProjectsResponse;
  }
}
