import type * as NodePty from 'node-pty';
import { createAsyncQueue } from './create-async-queue';
import { PtyStreamDataMessage, PtyStreamExitMessage, PtyStreamMessage } from './pty-stream-message';
import { PtyStream } from './pty-stream';

export type StartPtyCommand = {
  id: string;
  cmd: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  cols?: number;
  rows?: number;
};

export class PtyService {
  start({ id, cwd, env, cols = 120, rows = 30 }: StartPtyCommand): PtyStream {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pty = require('node-pty') as typeof NodePty;
    const proc = pty.spawn(process.env.COMSPEC ?? 'cmd.exe', ['/d', '/s', '/k', 'codex'], {
      name: 'xterm-256color',
      cwd: cwd ?? process.cwd(),
      env: { ...process.env, ...env },
      cols,
      rows,
    });

    const q = createAsyncQueue<PtyStreamMessage>();

    proc.onData((data) => q.push({ type: 'data', runId: id, data } satisfies PtyStreamDataMessage));

    proc.onExit(({ exitCode, signal }) => {
      q.push({ type: 'exit', runId: id, exitCode, signal } satisfies PtyStreamExitMessage);
      q.close();
    });

    return {
      id,
      write: (data) => proc.write(data),
      resize: (c, r) => proc.resize(c, r),
      kill: () => {
        proc.kill();
        // onExit will close the queue
      },
      messages: q.iterate(),
    };
  }
}
