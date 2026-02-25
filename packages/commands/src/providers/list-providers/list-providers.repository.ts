import { ProviderEntity } from '../provider.entity';
import { ProvidersRepository } from '../providers.repository';

export class ListProvidersRepository extends ProvidersRepository {
  public async findAllProviders(): Promise<ProviderEntity[]> {
    return super.findAllProviders();
  }
}
