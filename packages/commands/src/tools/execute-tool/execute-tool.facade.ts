import { ExecuteToolCommand } from './execute-tool.command';
import { ExecuteToolError } from './execute-tool.error';
import { ExecuteToolRepository } from './execute-tool.repository';
import { ExecuteToolResponse } from './execute-tool.response';
import { resolveToolExecutable } from '../resolve-tool-executable';
import { ProcessService } from './process/process.service';
import { PtyService } from './pty/pty.service';
import { renderToolArgs } from '../tool-arg';

export class ExecuteToolFacade {
  constructor(
    private _ptyService: PtyService,
    private _processService: ProcessService,
    private _repository: ExecuteToolRepository,
  ) {}

  public async execute(command: ExecuteToolCommand): Promise<ExecuteToolResponse> {
    // Validate the tool exists
    const toolId = command.toolId.trim();
    if (!toolId) {
      throw new ExecuteToolError('Tool id is required.', toolId);
    }

    const tool = await this._repository.findToolById(toolId);
    if (!tool) {
      throw new ExecuteToolError(`Tool not found: ${toolId}`, toolId);
    }

    const resolution = await resolveToolExecutable(tool.exec);
    if (resolution.status === 'needsSetup') {
      throw new ExecuteToolError(`Tool "${tool.name}" needs setup on this machine.`, tool.id);
    }

    // Build argv from saved structured args and runtime overrides.
    const args = [...renderToolArgs(tool.args), ...(command.argv ?? [])];
    const toolExecutionId = crypto.randomUUID();
    try {
      const stream = tool.interactive
        ? this._ptyService.start({
            id: toolExecutionId,
            exec: resolution.resolvedExec,
            args,
            cwd: command.cwd,
            env: command.env,
            cols: command.cols,
            rows: command.rows,
          })
        : this._processService.start({
            id: toolExecutionId,
            exec: resolution.resolvedExec,
            args,
            cwd: command.cwd,
            env: command.env,
          });

      // Persist execution lifecycle for status tracking.
      await this._repository.createExecution({
        id: toolExecutionId,
        toolId: tool.id,
        startedAt: new Date().toISOString(),
        status: 'running',
      });

      void stream.onExit
        .then(async (exit) => {
          const isSuccess = exit.exitCode === 0;
          await this._repository.updateExecution(toolExecutionId, {
            status: isSuccess ? 'completed' : 'failed',
            exitCode: exit.exitCode,
            finishedAt: new Date().toISOString(),
          });
        })
        .catch(() => {
          return;
        });

      return {
        toolExecutionId,
        stream,
      };
    } catch (error) {
      throw new ExecuteToolError(
        `Failed to start tool "${tool.name}" (${tool.id}).`,
        tool.id,
        error,
      );
    }
  }
}
