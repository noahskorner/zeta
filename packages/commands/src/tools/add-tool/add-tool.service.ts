import path from 'node:path';
import { AddToolCommand } from './add-tool.command';
import { AddToolModel } from './add-tool.model';

export class AddToolService {
  public async execute(command: AddToolCommand): Promise<AddToolModel> {
    // Validate required fields and normalize optional args before persistence.
    const name = command.name.trim();
    const exec = command.exec.trim();
    const args = command.args
      ?.map((arg) => arg.trim())
      .filter((arg) => arg.length > 0);

    if (!name) {
      throw new Error('Tool name is required.');
    }

    if (!exec) {
      throw new Error('Tool executable is required.');
    }

    // Keep exec portable by allowing only bare program names.
    if (path.isAbsolute(exec) || exec.includes('/') || exec.includes('\\')) {
      throw new Error('Tool executable must be a bare program name.');
    }

    return {
      name,
      exec,
      args: args && args.length > 0 ? args : undefined,
      interactive: command.interactive,
    } satisfies AddToolModel;
  }
}
