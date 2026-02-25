import { Command } from 'commander';
import {
  AddProviderCommand,
  AddProviderFacade,
  AddProviderRepository,
  AddProviderService,
} from '@zeta/commands';

type AddProviderOptions = {
  id: string;
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  organization?: string;
  project?: string;
  passphrase?: string;
};

export function addProviders(command: Command) {
  // Instantiate services.
  const service = new AddProviderService();
  const repository = new AddProviderRepository();
  const facade = new AddProviderFacade(service, repository);

  // Add the command.
  const providersCommand = command.command('providers').description('Manage LLM providers');

  providersCommand
    .command('add')
    .description('Add an LLM provider config with encrypted credentials')
    .requiredOption('--id <string>', 'Provider id')
    .requiredOption('--provider <string>', 'Provider slug (openai, anthropic, ...)')
    .requiredOption('--model <string>', 'Default model for this provider')
    .requiredOption('--api-key <string>', 'Provider API key')
    .option('--base-url <url>', 'Optional provider base URL')
    .option('--organization <string>', 'Optional provider organization id')
    .option('--project <string>', 'Optional provider project id')
    .option('--passphrase <string>', 'Passphrase for AES fallback encryption')
    .action(async (options: AddProviderOptions) => {
      try {
        const createdProvider = await facade.execute({
          id: options.id,
          provider: options.provider,
          defaultModel: options.model,
          apiKey: options.apiKey,
          baseUrl: options.baseUrl,
          organization: options.organization,
          project: options.project,
          passphrase: options.passphrase,
        } satisfies AddProviderCommand);

        console.log(
          `Created provider: ${createdProvider.id} (${createdProvider.provider}) with default model ${createdProvider.defaultModel}`,
        );
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('Failed to add provider.');
        }

        process.exitCode = 1;
      }
    });
}
