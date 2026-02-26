import path from 'node:path';
import { AddToolCommand } from './add-tool.command';
import { AddToolModel } from './add-tool.model';
import { normalizeToolArgs } from '../tool-arg';

export class AddToolService {
  public async execute(command: AddToolCommand): Promise<AddToolModel> {
    // Validate required fields and normalize optional args before persistence.
    const name = command.name.trim();
    const exec = command.exec.trim();
    const args = normalizeToolArgs(command.args);

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
      args,
      interactive: command.interactive,
    } satisfies AddToolModel;
  }
}
