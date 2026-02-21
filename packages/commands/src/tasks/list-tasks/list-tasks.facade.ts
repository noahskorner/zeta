import { ProjectsRepository } from '../../projects';
import { ListTasksQuery } from './list-tasks.query';
import { ListTaskResponse, ListTasksResponse } from './find-tasks.response';
import { ListTasksRepository } from './list-tasks.repository';

export class ListTasksFacade {
  constructor(
    private _projectsRepository: ProjectsRepository,
    private _repository: ListTasksRepository,
  ) {}

  public async execute(query: ListTasksQuery): Promise<ListTasksResponse> {
    const projects = await this._projectsRepository.findAll();
    const project = projects.find((candidate) => candidate.id === query.projectId);
    if (!project) {
      throw new Error(`Project not found: ${query.projectId}`);
    }

    const tasks = await this._repository.findAll(project.folderPath);
    return {
      tasks: tasks.map(
        (task) =>
          ({
            id: task.id,
            name: task.name,
            friendlyName: task.friendlyName,
            description: task.description,
            createdAt: task.createdAt,
          }) satisfies ListTaskResponse,
      ),
    } satisfies ListTasksResponse;
  }
}
