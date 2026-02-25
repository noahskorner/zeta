import { ProjectsRepository } from '../../projects';
import { ListTasksQuery } from './list-tasks.query';
import { ListTaskResponse, ListTasksResponse } from './list-tasks.response';
import { ListTasksRepository } from './list-tasks.repository';

export class ListTasksFacade {
  constructor(
    private _projectsRepository: ProjectsRepository,
    private _repository: ListTasksRepository,
  ) {}

  public async execute(query: ListTasksQuery): Promise<ListTasksResponse> {
    // Validate that the project exists
    const projects = await this._projectsRepository.findAll();
    const project = projects.find((candidate) => candidate.id === query.projectId);
    if (!project) {
      throw new Error(`Project not found: ${query.projectId}`);
    }

    // Find all tasks for the project
    const tasks = await this._repository.findAll(project.folderPath);
    return {
      tasks: tasks.map(
        (task) =>
          ({
            id: task.id,
            slug: task.slug,
            title: task.title,
            description: task.description,
            createdAt: task.createdAt,
          }) satisfies ListTaskResponse,
      ),
    } satisfies ListTasksResponse;
  }
}
