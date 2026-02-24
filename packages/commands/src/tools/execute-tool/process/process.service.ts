import { spawn } from 'node:child_process';
import { createAsyncQueue } from '../pty/create-async-queue';
import {
  ToolExecutionStreamDataMessage,
  ToolExecutionStreamExitMessage,
  ToolExecutionStreamMessage,
} from '../tool-execution-stream-message';
import { ToolExecutionStream } from '../tool-execution-stream';
import { normalizeExecCommand } from '../normalize-exec-command';

export type StartProcessCommand = {
  id: string;
  exec: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
};

export class ProcessService {
  start({ id, exec, args, cwd, env }: StartProcessCommand): ToolExecutionStream {
    const normalizedCommand = normalizeExecCommand(exec, args ?? []);

    // Spawn non-interactive tools without a shell for deterministic execution.
    const childProcess = spawn(normalizedCommand.exec, normalizedCommand.args, {
      cwd: cwd ?? process.cwd(),
      env: { ...process.env, ...env },
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const q = createAsyncQueue<ToolExecutionStreamMessage>();

    childProcess.stdout.on('data', (data) =>
      q.push({
        type: 'data',
        runId: id,
        data: String(data),
      } satisfies ToolExecutionStreamDataMessage),
    );
    childProcess.stderr.on('data', (data) =>
      q.push({
        type: 'data',
        runId: id,
        data: String(data),
      } satisfies ToolExecutionStreamDataMessage),
    );

    const onExit = new Promise<ToolExecutionStreamExitMessage>((resolve) => {
      childProcess.on('exit', (exitCode, signal) => {
        const payload = {
          type: 'exit',
          runId: id,
          exitCode: exitCode ?? -1,
          signal: typeof signal === 'number' ? signal : undefined,
        } satisfies ToolExecutionStreamExitMessage;
        q.push(payload);
        q.close();
        resolve(payload);
      });
    });

    return {
      id,
      write: (data) => {
        childProcess.stdin.write(data);
      },
      resize: () => {
        return;
      },
      kill: () => {
        childProcess.kill();
      },
      onExit,
      messages: q.iterate(),
    };
  }
}
