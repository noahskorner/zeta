import { spawn } from 'node:child_process';
import { ExecuteToolCommand } from './execute-tool.command';
import { ExecuteToolError } from './execute-tool.error';
import { ExecuteToolRepository } from './execute-tool.repository';
import { ExecuteToolResponse } from './execute-tool.response';
import { ToolExecutionEntity } from '../tool-execution.entity';

export class ExecuteToolFacade {
  constructor(private _repository: ExecuteToolRepository) {}

  public async execute(command: ExecuteToolCommand): Promise<ExecuteToolResponse> {
    const toolId = command.toolId.trim();
    if (!toolId) {
      throw new ExecuteToolError('Tool id is required.', toolId);
    }

    const tool = await this._repository.findToolById(toolId);
    if (!tool) {
      throw new ExecuteToolError(`Tool not found: ${toolId}`, toolId);
    }

    const argv = command.argv.map((arg) => String(arg));
    const args = [...(tool.args ?? []), ...argv];
    const startedAt = new Date().toISOString();
    const cwd = command.cwd ?? process.cwd();
    const environment = buildSpawnEnvironment(command.env);
    const executionId = crypto.randomUUID();

    try {
      // Launch the tool as a detached background process so the desktop app stays responsive.
      const processHandle = spawn(tool.command, args, {
        cwd,
        env: environment,
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      });
      processHandle.unref();
      const pid = typeof processHandle.pid === 'number' ? processHandle.pid : undefined;

      await this._repository.createExecution({
        id: executionId,
        toolId: tool.id,
        command: tool.command,
        args,
        cwd,
        env: command.env,
        pid,
        startedAt,
      } satisfies ToolExecutionEntity);

      return {
        executionId,
        pid,
        startedAt,
      } satisfies ExecuteToolResponse;
    } catch (error) {
      throw new ExecuteToolError(
        `Failed to start tool "${tool.name}" (${tool.id}).`,
        tool.id,
        error,
      );
    }
  }
}

function buildSpawnEnvironment(overrides?: Record<string, string>): Record<string, string> {
  const environment: Record<string, string> = {};

  Object.entries(process.env).forEach(([key, value]) => {
    if (typeof value === 'string') {
      environment[key] = value;
    }
  });

  return {
    ...environment,
    ...(overrides ?? {}),
  };
}
