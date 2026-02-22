import { AddToolCommand } from './add-tool.command';
import { AddToolModel } from './add-tool.model';

export class AddToolService {
  public async execute(command: AddToolCommand): Promise<AddToolModel> {
    // Validate required fields and normalize optional args before persistence.
    const name = command.name.trim();
    const executableCommand = command.command.trim();
    const args = command.args
      ?.map((arg) => arg.trim())
      .filter((arg) => arg.length > 0);

    if (!name) {
      throw new Error('Tool name is required.');
    }

    if (!executableCommand) {
      throw new Error('Tool command is required.');
    }

    return {
      name,
      command: executableCommand,
      args: args && args.length > 0 ? args : undefined,
    } satisfies AddToolModel;
  }
}
