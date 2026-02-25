import path from 'node:path';
import { spawn } from 'node:child_process';
import { chmod, mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { createCipheriv, randomBytes, scryptSync } from 'node:crypto';
import { AddProviderModel } from './add-provider.model';
import { AddProviderResponse } from './add-provider.response';
import { ProviderEntity, ProviderSecretEntity } from '../provider.entity';
import { ProvidersRepository } from '../providers.repository';

interface ProvidersFileContent {
  providers: ProviderEntity[];
}

interface SecretsFileContent {
  credentials: ProviderSecretEntity[];
}

type EncryptedSecret = Omit<ProviderSecretEntity, 'providerId' | 'createdAt'>;

export class AddProviderRepository extends ProvidersRepository {
  public async createProvider(model: AddProviderModel): Promise<AddProviderResponse> {
    // Ensure the storage directory exists before writing provider metadata and credentials.
    await mkdir(AddProviderRepository.STORAGE_PATH, { recursive: true });

    const existingProviders = await this.findAllProviders();
    if (existingProviders.some((provider) => provider.id === model.id)) {
      throw new Error(`Provider id "${model.id}" already exists.`);
    }

    const existingSecrets = await this.findAllSecrets();
    if (existingSecrets.some((credential) => credential.providerId === model.id)) {
      throw new Error(`Secret for provider id "${model.id}" already exists.`);
    }

    // Encrypt sensitive values before persisting them to disk.
    const encryptedSecret = await this.encryptApiKey(model.apiKey, model.passphrase);
    const createdAt = new Date().toISOString();
    const providerEntity: ProviderEntity = {
      id: model.id,
      provider: model.provider,
      defaultModel: model.defaultModel,
      baseUrl: model.baseUrl,
      organization: model.organization,
      project: model.project,
      createdAt,
    };
    const secretEntity: ProviderSecretEntity = {
      providerId: model.id,
      createdAt,
      ...encryptedSecret,
    };

    await this.writeAtomically(
      AddProviderRepository.SECRETS_FILE_PATH,
      JSON.stringify(
        { credentials: [...existingSecrets, secretEntity] } satisfies SecretsFileContent,
        null,
        2,
      ),
      0o600,
    );
    await this.writeAtomically(
      AddProviderRepository.PROVIDERS_FILE_PATH,
      JSON.stringify(
        { providers: [...existingProviders, providerEntity] } satisfies ProvidersFileContent,
        null,
        2,
      ),
      0o644,
    );

    return providerEntity;
  }

  private async encryptApiKey(apiKey: string, passphrase: string | undefined): Promise<EncryptedSecret> {
    // Prefer OS-protected encryption on Windows, then fall back to AES-256-GCM.
    if (process.platform === 'win32') {
      try {
        const encrypted = await this.encryptWithWindowsDpapi(apiKey);
        if (encrypted) {
          return {
            scheme: 'windows-dpapi',
            ciphertext: encrypted,
          };
        }
      } catch {
        // Continue into AES fallback when DPAPI is unavailable.
      }
    }

    const finalPassphrase = passphrase ?? process.env.ZETA_PROVIDERS_PASSPHRASE;
    if (!finalPassphrase) {
      throw new Error(
        'Passphrase required for AES fallback. Provide --passphrase or ZETA_PROVIDERS_PASSPHRASE.',
      );
    }

    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const key = scryptSync(finalPassphrase, salt, 32);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      scheme: 'aes-256-gcm',
      ciphertext: ciphertext.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      salt: salt.toString('base64'),
    };
  }

  private async encryptWithWindowsDpapi(plaintext: string): Promise<string | null> {
    const script =
      "[Console]::InputEncoding=[System.Text.Encoding]::UTF8;" +
      '$plain=[Console]::In.ReadToEnd();' +
      '$bytes=[System.Text.Encoding]::UTF8.GetBytes($plain);' +
      '$protected=[System.Security.Cryptography.ProtectedData]::Protect($bytes,$null,[System.Security.Cryptography.DataProtectionScope]::CurrentUser);' +
      '[Console]::Out.Write([Convert]::ToBase64String($protected));';

    return new Promise((resolve, reject) => {
      const child = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', script], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk: string) => {
        stdout += chunk;
      });
      child.stderr.on('data', (chunk: string) => {
        stderr += chunk;
      });
      child.on('error', () => {
        resolve(null);
      });
      child.on('close', (code) => {
        if (code === 0) {
          const trimmed = stdout.trim();
          resolve(trimmed.length > 0 ? trimmed : null);
          return;
        }

        reject(
          new Error(
            `Failed to encrypt provider secret with Windows DPAPI (${stderr.trim() || 'unknown error'}).`,
          ),
        );
      });

      child.stdin.end(plaintext, 'utf8');
    });
  }

  private async writeAtomically(filePath: string, content: string, mode: number): Promise<void> {
    const directoryPath = path.dirname(filePath);
    const temporaryPath = path.join(
      directoryPath,
      `.provider.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`,
    );

    await writeFile(temporaryPath, content, { encoding: 'utf8', mode });

    try {
      await rename(temporaryPath, filePath);
    } catch (error) {
      const shouldRetryWithReplace =
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error.code === 'EEXIST' || error.code === 'EPERM' || error.code === 'EACCES');
      if (shouldRetryWithReplace) {
        await rm(filePath, { force: true });
        await rename(temporaryPath, filePath);
      } else {
        await rm(temporaryPath, { force: true });
        throw error;
      }
    }

    // Restrict permission on disk for the target file when the OS supports POSIX modes.
    await chmod(filePath, mode).catch(() => undefined);
  }
}
