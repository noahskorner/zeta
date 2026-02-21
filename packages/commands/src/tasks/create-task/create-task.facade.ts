import { CreateTaskCommand } from "./create-task.command";
import { CreateTaskRepository } from "./create-task.repository";
import { CreateTaskService } from "./create-task.service";

export class CreateTaskFacade {
  constructor(
    private _service: CreateTaskService,
    private _repository: CreateTaskRepository,
  ) {}

  public async execute(command: CreateTaskCommand): Promise<string> {
    // Normalize and validate input before creating worktree and persisting metadata.
    const model = await this._service.execute(command);
    return this._repository.createTask(model);
  }
}
