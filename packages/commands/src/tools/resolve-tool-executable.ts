import path from 'node:path';
import { access, constants } from 'node:fs/promises';

export type ToolResolutionStatus = 'ready' | 'needsSetup';

export type ToolResolutionResult =
  | {
      status: 'ready';
      resolvedExec: string;
    }
  | {
      status: 'needsSetup';
    };

export async function resolveToolExecutable(exec: string): Promise<ToolResolutionResult> {
  const trimmedExec = exec.trim();
  if (!trimmedExec) {
    return { status: 'needsSetup' };
  }

  // Keep tool definitions portable by rejecting non-bare executable names.
  if (path.isAbsolute(trimmedExec) || trimmedExec.includes('/') || trimmedExec.includes('\\')) {
    return { status: 'needsSetup' };
  }

  const pathEntries = (process.env.PATH ?? '')
    .split(path.delimiter)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  const candidates = buildExecutableCandidates(trimmedExec);

  for (const directoryPath of pathEntries) {
    for (const candidate of candidates) {
      const fullPath = path.resolve(directoryPath, candidate);

      try {
        if (process.platform === 'win32') {
          await access(fullPath, constants.F_OK);
        } else {
          await access(fullPath, constants.X_OK);
        }

        return {
          status: 'ready',
          resolvedExec: fullPath,
        };
      } catch {
        continue;
      }
    }
  }

  return { status: 'needsSetup' };
}

function buildExecutableCandidates(exec: string): string[] {
  if (process.platform !== 'win32') {
    return [exec];
  }

  const extension = path.extname(exec);
  const pathExtensions = (process.env.PATHEXT ?? '.COM;.EXE;.BAT;.CMD')
    .split(';')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => value.toLowerCase())
    .filter(
      (value) => value === '.com' || value === '.exe' || value === '.cmd' || value === '.bat',
    );

  if (extension.length > 0) {
    return [exec];
  }

  // Prefer PATHEXT-resolved entries to avoid picking non-executable bare shims first.
  return [...pathExtensions.map((pathExtension) => `${exec}${pathExtension}`), exec];
}
