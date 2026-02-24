import type * as NodePty from 'node-pty';
import { createAsyncQueue } from './create-async-queue';
import {
  ToolExecutionStreamDataMessage,
  ToolExecutionStreamExitMessage,
  ToolExecutionStreamMessage,
} from '../tool-execution-stream-message';
import { ToolExecutionStream } from '../tool-execution-stream';
import { normalizeExecCommand } from '../normalize-exec-command';

export type StartPtyCommand = {
  id: string;
  exec: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  cols?: number;
  rows?: number;
};

export class PtyService {
  start({ id, exec, args, cwd, env, cols = 120, rows = 30 }: StartPtyCommand): ToolExecutionStream {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pty = require('node-pty') as typeof NodePty;
    const normalizedCommand = normalizeExecCommand(exec, args ?? []);

    // Spawn interactive tools directly instead of wrapping with shell commands.
    const proc = pty.spawn(normalizedCommand.exec, normalizedCommand.args, {
      name: 'xterm-256color',
      cwd: cwd ?? process.cwd(),
      env: { ...process.env, ...env },
      cols,
      rows,
    });

    const q = createAsyncQueue<ToolExecutionStreamMessage>();

    proc.onData((data) =>
      q.push({ type: 'data', runId: id, data } satisfies ToolExecutionStreamDataMessage),
    );

    const onExit = new Promise<ToolExecutionStreamExitMessage>((resolve) => {
      proc.onExit(({ exitCode, signal }) => {
        const payload = {
          type: 'exit',
          runId: id,
          exitCode,
          signal,
        } satisfies ToolExecutionStreamExitMessage;
        q.push(payload);
        q.close();
        resolve(payload);
      });
    });

    return {
      id,
      write: (data) => proc.write(data),
      resize: (c, r) => proc.resize(c, r),
      kill: () => {
        proc.kill();
        // onExit will close the queue
      },
      onExit,
      messages: q.iterate(),
    };
  }
}
