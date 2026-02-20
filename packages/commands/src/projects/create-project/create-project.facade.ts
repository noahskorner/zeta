import { Repository } from "../../repository";
import { CreateProjectCommand } from "./create-project.command";
import { CreateProjectRepository } from "./create-project.repository";
import { CreateProjectService } from "./create-project.service";

export class CreateProjectFacade extends Repository {
  constructor(
    private _service: CreateProjectService,
    private _repository: CreateProjectRepository,
  ) {
    super();
  }

  async execute(command: CreateProjectCommand): Promise<string> {
    // Create the model
    const model = await this._service.execute(command);

    // Check if a project with the same folder path already exists
    const alreadyExists = await this._repository.exists(model.folderPath);
    if (alreadyExists) {
      throw new Error(`Project already exists: ${model.folderPath}`);
    }

    // Persist the project
    const projectId = await this._repository.createProject(model);

    return projectId;
  }
}
