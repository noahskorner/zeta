import path from 'node:path';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { AddToolModel } from './add-tool.model';
import { AddToolResponse } from './add-tool.response';
import { ToolEntity } from '../tool.entity';
import { ToolsRepository } from '../tools.repository';

interface ToolsFileContent {
  tools: ToolEntity[];
}

export class AddToolRepository extends ToolsRepository {
  public async createTool(model: AddToolModel): Promise<AddToolResponse> {
    // Ensure the app data directory exists before reading or writing tools.
    await mkdir(AddToolRepository.STORAGE_PATH, { recursive: true });

    // Load existing tools and append the new tool record.
    const existingTools = await this.findAll();
    const createdTool: ToolEntity = {
      id: crypto.randomUUID(),
      name: model.name,
      exec: model.exec,
      args: model.args,
      interactive: model.interactive,
      createdAt: new Date().toISOString(),
    };

    await this.writeAtomically(
      AddToolRepository.TOOLS_FILE_PATH,
      JSON.stringify({ tools: [...existingTools, createdTool] } satisfies ToolsFileContent, null, 2),
    );

    return createdTool;
  }

  private async writeAtomically(filePath: string, content: string): Promise<void> {
    const directoryPath = path.dirname(filePath);
    const temporaryPath = path.join(
      directoryPath,
      `.tools.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`,
    );

    await writeFile(temporaryPath, content, 'utf8');

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
        return;
      }

      await rm(temporaryPath, { force: true });
      throw error;
    }
  }
}
