import { UpdateTaskCommand } from "./update-task.command";
import { UpdateTaskRepository } from "./update-task.repository";
import { UpdateTaskResponse } from "./update-task.response";
import { UpdateTaskService } from "./update-task.service";

export class UpdateTaskFacade {
  constructor(
    private _service: UpdateTaskService,
    private _repository: UpdateTaskRepository,
  ) {}

  public async execute(command: UpdateTaskCommand): Promise<UpdateTaskResponse> {
    // Normalize and validate input before persisting task metadata updates.
    const model = await this._service.execute(command);
    return this._repository.updateTask(model);
  }
}
