import { Command } from 'commander';
import {
  AddProviderCommand,
  AddProviderFacade,
  AddProviderRepository,
  ListProviderResponse,
  ListProvidersFacade,
  ListProvidersRepository,
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
  // Add provider command
  const providersCommand = command.command('providers').description('Manage LLM providers');
  const addProviderService = new AddProviderService();
  const addProviderRepository = new AddProviderRepository();
  const addProviderFacade = new AddProviderFacade(addProviderService, addProviderRepository);
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
        const createdProvider = await addProviderFacade.execute({
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

  // List providers command
  const listProvidersRepository = new ListProvidersRepository();
  const listProvidersFacade = new ListProvidersFacade(listProvidersRepository);
  providersCommand
    .command('list')
    .description('List saved LLM providers')
    .action(async () => {
      try {
        // Read all persisted providers and print a simple metadata list.
        const { providers } = await listProvidersFacade.execute();
        printProviders(providers);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('Failed to list providers.');
        }

        process.exitCode = 1;
      }
    });
}

function printProviders(providers: ListProviderResponse[]): void {
  if (providers.length === 0) {
    console.log('No providers found.');
    return;
  }

  const sortedProviders = [...providers].sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt),
  );

  sortedProviders.forEach((provider) => {
    console.log(`${provider.provider}`);
    console.log(`  id: ${provider.id}`);
    console.log(`  model: ${provider.defaultModel}`);
    console.log(`  created: ${provider.createdAt}`);
    if (provider.baseUrl) {
      console.log(`  baseUrl: ${provider.baseUrl}`);
    }
    if (provider.organization) {
      console.log(`  organization: ${provider.organization}`);
    }
    if (provider.project) {
      console.log(`  project: ${provider.project}`);
    }
    console.log('');
  });
}
