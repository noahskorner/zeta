import { AddProviderCommand } from './add-provider.command';
import { AddProviderRepository } from './add-provider.repository';
import { AddProviderResponse } from './add-provider.response';
import { AddProviderService } from './add-provider.service';

export class AddProviderFacade {
  constructor(
    private _service: AddProviderService,
    private _repository: AddProviderRepository,
  ) {}

  public async execute(command: AddProviderCommand): Promise<AddProviderResponse> {
    // Validate and normalize input before writing metadata and encrypted credentials.
    const model = await this._service.execute(command);
    return this._repository.createProvider(model);
  }
}
