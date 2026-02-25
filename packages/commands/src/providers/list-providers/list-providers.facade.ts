import { ListProvidersQuery } from './list-providers.query';
import { ListProviderResponse, ListProvidersResponse } from './list-providers.response';
import { ListProvidersRepository } from './list-providers.repository';

export class ListProvidersFacade {
  constructor(private _repository: ListProvidersRepository) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(query?: ListProvidersQuery): Promise<ListProvidersResponse> {
    // Load persisted providers.
    const providers = await this._repository.findAllProviders();

    // Return a stable response contract for consumers.
    return {
      providers: providers.map(
        (provider) =>
          ({
            id: provider.id,
            provider: provider.provider,
            defaultModel: provider.defaultModel,
            baseUrl: provider.baseUrl,
            organization: provider.organization,
            project: provider.project,
            createdAt: provider.createdAt,
          }) satisfies ListProviderResponse,
      ),
    } satisfies ListProvidersResponse;
  }
}
