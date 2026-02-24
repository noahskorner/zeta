import path from 'node:path';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { ToolEntity } from '../tool.entity';
import { ToolExecutionEntity } from '../tool-execution.entity';
import { ToolsRepository } from '../tools.repository';

interface ToolExecutionsFileContent {
  executions: ToolExecutionEntity[];
}

export class ExecuteToolRepository extends ToolsRepository {
  private static readonly TOOL_EXECUTIONS_FILE_PATH = path.join(
    ExecuteToolRepository.STORAGE_PATH,
    'tool-executions.json',
  );

  public async findToolById(toolId: string): Promise<ToolEntity | null> {
    const tools = await this.findAll();
    return tools.find((tool) => tool.id === toolId) ?? null;
  }

  public async createExecution(execution: ToolExecutionEntity): Promise<void> {
    await mkdir(ExecuteToolRepository.STORAGE_PATH, { recursive: true });

    const existingExecutions = await this.findAllExecutions();
    await this.writeAtomically(
      ExecuteToolRepository.TOOL_EXECUTIONS_FILE_PATH,
      JSON.stringify(
        { executions: [...existingExecutions, execution] } satisfies ToolExecutionsFileContent,
        null,
        2,
      ),
    );
  }

  public async updateExecution(
    executionId: string,
    updates: Pick<ToolExecutionEntity, 'status' | 'finishedAt' | 'exitCode'>,
  ): Promise<void> {
    await mkdir(ExecuteToolRepository.STORAGE_PATH, { recursive: true });

    const existingExecutions = await this.findAllExecutions();
    const nextExecutions = existingExecutions.map((execution) =>
      execution.id === executionId ? { ...execution, ...updates } : execution,
    );

    await this.writeAtomically(
      ExecuteToolRepository.TOOL_EXECUTIONS_FILE_PATH,
      JSON.stringify({ executions: nextExecutions } satisfies ToolExecutionsFileContent, null, 2),
    );
  }

  private async findAllExecutions(): Promise<ToolExecutionEntity[]> {
    try {
      const raw = await readFile(ExecuteToolRepository.TOOL_EXECUTIONS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as ToolExecutionsFileContent;
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.executions)) {
        return [];
      }

      return parsed.executions.filter((execution) => {
        const hasValidFinishedAt =
          execution?.finishedAt === undefined || typeof execution.finishedAt === 'string';
        const hasValidExitCode =
          execution?.exitCode === undefined || typeof execution.exitCode === 'number';
        const hasValidStatus =
          execution?.status === 'running' ||
          execution?.status === 'completed' ||
          execution?.status === 'failed';

        return (
          typeof execution?.id === 'string' &&
          typeof execution?.toolId === 'string' &&
          typeof execution?.startedAt === 'string' &&
          hasValidFinishedAt &&
          hasValidExitCode &&
          hasValidStatus
        );
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return [];
      }

      throw error;
    }
  }

  private async writeAtomically(filePath: string, content: string): Promise<void> {
    const directoryPath = path.dirname(filePath);
    const temporaryPath = path.join(
      directoryPath,
      `.tool-executions.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`,
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
