import { AddToolCommand } from './add-tool.command';
import { AddToolRepository } from './add-tool.repository';
import { AddToolResponse } from './add-tool.response';
import { AddToolService } from './add-tool.service';

export class AddToolFacade {
  constructor(
    private _service: AddToolService,
    private _repository: AddToolRepository,
  ) {}

  public async execute(command: AddToolCommand): Promise<AddToolResponse> {
    // Normalize and validate input before persisting a new tool.
    const model = await this._service.execute(command);
    return this._repository.createTool(model);
  }
}
