import { ExecuteToolCommand } from './execute-tool.command';
import { ExecuteToolError } from './execute-tool.error';
import { ExecuteToolRepository } from './execute-tool.repository';
import { ExecuteToolResponse } from './execute-tool.response';
import { PtyService } from './pty/pty.service';

export class ExecuteToolFacade {
  constructor(
    private _service: PtyService,
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

    const toolExecutionId = crypto.randomUUID();
    try {
      // Launch the tool as a PTY process
      const stream = await this._service.start({
        id: toolExecutionId,
        cmd: 'codex',
      });

      // TODO: Persist the execution

      return {
        toolExecutionId: toolExecutionId,
        stream: stream,
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
