import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { Repository } from '../repository';
import { ToolEntity } from './tool.entity';
import { ToolArg } from './tool-arg';

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
        const hasValidArgs = tool?.args === undefined || isToolArgList(tool.args);

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

function isToolArgList(value: unknown): value is ToolArg[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(isToolArg);
}

function isToolArg(value: unknown): value is ToolArg {
  if (!value || typeof value !== 'object' || !('t' in value)) {
    return false;
  }

  const arg = value as Partial<ToolArg>;
  if (arg.t === 'literal' || arg.t === 'template') {
    return typeof arg.v === 'string';
  }

  if (arg.t === 'flag') {
    return typeof arg.name === 'string';
  }

  if (arg.t === 'param') {
    return (
      typeof arg.name === 'string' &&
      !!arg.value &&
      typeof arg.value === 'object' &&
      'type' in arg.value &&
      'value' in arg.value &&
      (arg.value.type === 'literal' || arg.value.type === 'template') &&
      typeof arg.value.value === 'string'
    );
  }

  return false;
}
