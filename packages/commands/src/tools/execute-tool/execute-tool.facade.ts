import { ExecuteToolCommand } from './execute-tool.command';
import { ExecuteToolError } from './execute-tool.error';
import { ExecuteToolRepository } from './execute-tool.repository';
import { ExecuteToolResponse } from './execute-tool.response';
import { ToolExecutionEntity } from '../tool-execution.entity';

interface NodePtySpawnOptions {
  cwd?: string;
  env?: Record<string, string>;
  name?: string;
  cols?: number;
  rows?: number;
}

interface NodePtyProcess {
  pid: number;
}

interface NodePtyModule {
  spawn: (file: string, args?: string[], options?: NodePtySpawnOptions) => NodePtyProcess;
}

let cachedNodePtyModule: NodePtyModule | null = null;

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
      const nodePty = await loadNodePtyModule();
      const processHandle = nodePty.spawn(tool.command, args, {
        cwd,
        env: environment,
        name: 'xterm-color',
        cols: 80,
        rows: 24,
      });
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

async function loadNodePtyModule(): Promise<NodePtyModule> {
  if (cachedNodePtyModule) {
    return cachedNodePtyModule;
  }

  const moduleName = 'node-pty';
  const loaded = (await import(moduleName)) as unknown as NodePtyModule;
  if (!loaded || typeof loaded.spawn !== 'function') {
    throw new Error('node-pty module does not expose spawn().');
  }

  cachedNodePtyModule = loaded;
  return loaded;
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
