import { Command } from 'commander';
import {
  AddToolCommand,
  AddToolFacade,
  AddToolRepository,
  AddToolService,
  ExecuteToolCommand,
  ExecuteToolFacade,
  ExecuteToolRepository,
  ListToolResponse,
  ListToolsFacade,
  ListToolsRepository,
} from '@zeta/commands';

type AddToolOptions = {
  name: string;
  command: string;
  args?: string;
  arg?: string[];
};

type ExecuteToolOptions = {
  tool: string;
  arg?: string[];
  cwd?: string;
};

export function addTools(command: Command) {
  // Instantiate services.
  const service = new AddToolService();
  const addToolRepository = new AddToolRepository();
  const addToolFacade = new AddToolFacade(service, addToolRepository);
  const listToolsRepository = new ListToolsRepository();
  const listToolsFacade = new ListToolsFacade(listToolsRepository);
  const executeToolRepository = new ExecuteToolRepository();
  const executeToolFacade = new ExecuteToolFacade(executeToolRepository);

  // Add the command.
  const toolsCommand = command.command('tools').description('Manage saved tools');

  toolsCommand
    .command('add')
    .description('Add a runnable tool command')
    .requiredOption('--name <string>', 'Tool name')
    .requiredOption('--command <string>', 'Executable command')
    .option('--args <arg1,arg2>', 'Comma-separated tool args')
    .option('--arg <value>', 'Single tool arg (repeatable)', collectOptionValue, [])
    .action(async (options: AddToolOptions) => {
      try {
        // Normalize args provided via --args or repeated --arg options.
        const parsedArgs = parseArgs(options.args, options.arg);

        const createdTool = await addToolFacade.execute({
          name: options.name,
          command: options.command,
          args: parsedArgs.length > 0 ? parsedArgs : undefined,
        } satisfies AddToolCommand);

        console.log(`Created tool: ${createdTool.id} (${createdTool.name})`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('Failed to add tool.');
        }

        process.exitCode = 1;
      }
    });

  toolsCommand
    .command('list')
    .description('List saved tools')
    .action(async () => {
      try {
        // Read all persisted tools and print a simple table-like list.
        const { tools } = await listToolsFacade.execute();
        printTools(tools);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('Failed to list tools.');
        }

        process.exitCode = 1;
      }
    });

  toolsCommand
    .command('execute')
    .description('Execute a saved tool command')
    .requiredOption('--tool <toolId>', 'Tool id')
    .option('--arg <value>', 'Single argv value to append (repeatable)', collectOptionValue, [])
    .option('--cwd <path>', 'Working directory for tool execution')
    .action(async (options: ExecuteToolOptions) => {
      try {
        const argv = (options.arg ?? []).map((arg) => arg.trim()).filter((arg) => arg.length > 0);
        const receipt = await executeToolFacade.execute({
          toolId: options.tool,
          argv,
          cwd: options.cwd,
        } satisfies ExecuteToolCommand);

        const pidText = typeof receipt.pid === 'number' ? String(receipt.pid) : 'n/a';
        console.log(
          `Started tool ${options.tool} (pid: ${pidText}) at ${receipt.startedAt}`,
        );
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('Failed to execute tool.');
        }

        process.exitCode = 1;
      }
    });
}

function collectOptionValue(value: string, previous: string[]): string[] {
  return [...previous, value];
}

function parseArgs(commaSeparatedArgs: string | undefined, repeatedArgs: string[] | undefined): string[] {
  const argsFromCsv = commaSeparatedArgs
    ? commaSeparatedArgs
        .split(',')
        .map((arg) => arg.trim())
        .filter((arg) => arg.length > 0)
    : [];
  const argsFromRepeatedOptions = (repeatedArgs ?? [])
    .map((arg) => arg.trim())
    .filter((arg) => arg.length > 0);

  return [...argsFromCsv, ...argsFromRepeatedOptions];
}

function printTools(tools: ListToolResponse[]): void {
  if (tools.length === 0) {
    console.log('No tools found.');
    return;
  }

  const sortedTools = [...tools].sort((first, second) => second.createdAt.localeCompare(first.createdAt));

  sortedTools.forEach((tool) => {
    const args = tool.args && tool.args.length > 0 ? ` ${tool.args.join(' ')}` : '';
    console.log(`${tool.name}`);
    console.log(`  id: ${tool.id}`);
    console.log(`  command: ${tool.command}${args}`);
    console.log(`  created: ${tool.createdAt}`);
    console.log('');
  });
}
