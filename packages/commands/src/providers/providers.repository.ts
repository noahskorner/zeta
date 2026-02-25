import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { Repository } from '../repository';
import { ProviderEntity, ProviderSecretEntity } from './provider.entity';

interface ProvidersFileContent {
  providers: ProviderEntity[];
}

interface SecretsFileContent {
  credentials: ProviderSecretEntity[];
}

export class ProvidersRepository extends Repository {
  protected static readonly PROVIDERS_FILE_PATH = path.join(
    ProvidersRepository.STORAGE_PATH,
    'providers.json',
  );
  protected static readonly SECRETS_FILE_PATH = path.join(
    ProvidersRepository.STORAGE_PATH,
    'secrets.json',
  );

  public async findAllProviders(): Promise<ProviderEntity[]> {
    try {
      const raw = await readFile(ProvidersRepository.PROVIDERS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as ProvidersFileContent;

      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.providers)) {
        return [];
      }

      return parsed.providers.filter((provider) =>
        typeof provider?.id === 'string' &&
        typeof provider?.provider === 'string' &&
        typeof provider?.defaultModel === 'string' &&
        typeof provider?.createdAt === 'string' &&
        (provider?.baseUrl === undefined || typeof provider.baseUrl === 'string') &&
        (provider?.organization === undefined || typeof provider.organization === 'string') &&
        (provider?.project === undefined || typeof provider.project === 'string'),
      );
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return [];
      }

      throw error;
    }
  }

  public async findAllSecrets(): Promise<ProviderSecretEntity[]> {
    try {
      const raw = await readFile(ProvidersRepository.SECRETS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as SecretsFileContent;

      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.credentials)) {
        return [];
      }

      return parsed.credentials.filter((credential) => {
        const hasValidScheme = credential?.scheme === 'windows-dpapi' || credential?.scheme === 'aes-256-gcm';
        const hasValidAesFields =
          credential?.scheme !== 'aes-256-gcm' ||
          (typeof credential.iv === 'string' &&
            typeof credential.authTag === 'string' &&
            typeof credential.salt === 'string');

        return (
          typeof credential?.providerId === 'string' &&
          typeof credential?.ciphertext === 'string' &&
          typeof credential?.createdAt === 'string' &&
          hasValidScheme &&
          hasValidAesFields
        );
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return [];
      }

      throw error;
    }
  }
}
