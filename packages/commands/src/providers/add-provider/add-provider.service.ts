import { AddProviderCommand } from './add-provider.command';
import { AddProviderModel } from './add-provider.model';

const SAFE_ID_PATTERN = /^[a-zA-Z0-9._-]{2,64}$/;
const SAFE_PROVIDER_PATTERN = /^[a-z0-9-]{2,64}$/;

export class AddProviderService {
  public async execute(command: AddProviderCommand): Promise<AddProviderModel> {
    // Normalize user input so repository logic can stay focused on persistence.
    const id = command.id.trim();
    const provider = command.provider.trim().toLowerCase();
    const defaultModel = command.defaultModel.trim();
    const apiKey = command.apiKey.trim();
    const baseUrl = command.baseUrl?.trim();
    const organization = command.organization?.trim();
    const project = command.project?.trim();
    const passphrase = command.passphrase?.trim();

    if (!SAFE_ID_PATTERN.test(id)) {
      throw new Error('Provider id must match [a-zA-Z0-9._-] and be 2-64 characters.');
    }

    if (!SAFE_PROVIDER_PATTERN.test(provider)) {
      throw new Error('Provider name must match [a-z0-9-] and be 2-64 characters.');
    }

    if (!defaultModel || /\s/.test(defaultModel) || defaultModel.length > 200) {
      throw new Error('Default model is required, cannot contain spaces, and must be at most 200 characters.');
    }

    if (apiKey.length < 8 || apiKey.length > 4096 || /[\r\n\t]/.test(apiKey)) {
      throw new Error('API key is invalid.');
    }

    if (baseUrl) {
      try {
        const parsedUrl = new URL(baseUrl);
        if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
          throw new Error('Base URL must use http or https.');
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Base URL must use http or https.') {
          throw error;
        }

        throw new Error('Base URL must be a valid URL.');
      }
    }

    if (organization && organization.length > 200) {
      throw new Error('Organization must be at most 200 characters.');
    }

    if (project && project.length > 200) {
      throw new Error('Project must be at most 200 characters.');
    }

    return {
      id,
      provider,
      defaultModel,
      apiKey,
      baseUrl: baseUrl || undefined,
      organization: organization || undefined,
      project: project || undefined,
      passphrase: passphrase || undefined,
    } satisfies AddProviderModel;
  }
}
