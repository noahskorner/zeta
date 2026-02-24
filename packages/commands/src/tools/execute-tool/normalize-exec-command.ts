import path from 'node:path';

export type NormalizedExecCommand = {
  exec: string;
  args: string[];
};

export function normalizeExecCommand(exec: string, args: string[] = []): NormalizedExecCommand {
  if (process.platform !== 'win32') {
    return { exec, args };
  }

  const extension = path.extname(exec).toLowerCase();
  const requiresCmdShim = extension === '.cmd' || extension === '.bat';
  if (!requiresCmdShim) {
    return { exec, args };
  }

  // Run Windows batch script entrypoints through cmd.exe to avoid CreateProcess error 193.
  const commandShell = process.env.ComSpec?.trim() || 'cmd.exe';
  return {
    exec: commandShell,
    args: ['/d', '/c', exec, ...args],
  };
}
