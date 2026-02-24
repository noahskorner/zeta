import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { Repository } from '../repository';
import { ToolEntity } from './tool.entity';

interface ToolsFileContent {
  tools: ToolEntity[];
}

export class ToolsRepository extends Repository {
  protected static readonly TOOLS_FILE_PATH = path.join(ToolsRepository.STORAGE_PATH, 'tools.json');

  public async findAll(): Promise<ToolEntity[]> {
    try {
      const raw = await readFile(ToolsRepository.TOOLS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as ToolsFileContent;

      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.tools)) {
        return [];
      }

      return parsed.tools.filter((tool) => {
        const hasValidArgs =
          tool?.args === undefined ||
          (Array.isArray(tool.args) && tool.args.every((arg) => typeof arg === 'string'));

        return (
          typeof tool?.id === 'string' &&
          typeof tool?.name === 'string' &&
          typeof tool?.exec === 'string' &&
          typeof tool?.interactive === 'boolean' &&
          typeof tool?.createdAt === 'string' &&
          hasValidArgs
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
