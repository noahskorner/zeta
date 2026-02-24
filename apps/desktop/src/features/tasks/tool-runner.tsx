import { ToolExecutionStreamDataMessage, ToolExecutionStreamExitMessage } from '@zeta/commands';
import { useEffect, useRef, useState } from 'react';

export function ToolRunner({ toolExecutionId }: { toolExecutionId: string }) {
  const [output, setOutput] = useState('');
  const [exitCode, setExitCode] = useState<number | null>(null);

  // Batch output to avoid re-render per chunk
  const buffer = useRef<string[]>([]);
  const flushTimer = useRef<number | null>(null);
  const append = (chunk: string) => {
    buffer.current.push(chunk);
    if (flushTimer.current != null) return;
    flushTimer.current = window.setTimeout(() => {
      flushTimer.current = null;
      const joined = buffer.current.join('');
      buffer.current = [];
      setOutput((prev) => prev + joined);
    }, 16);
  };

  useEffect(() => {
    const offOut = window.zetaApi.onToolOutput(
      ({ runId, data }: ToolExecutionStreamDataMessage) => {
        if (runId != toolExecutionId) return;
        append(data);
      },
    );

    const offExit = window.zetaApi.onToolExit(
      ({ runId, exitCode }: ToolExecutionStreamExitMessage) => {
        if (runId != toolExecutionId) return;
        setExitCode(exitCode);
      },
    );

    return () => {
      offOut();
      offExit();
      if (flushTimer.current != null) window.clearTimeout(flushTimer.current);
    };
  }, [toolExecutionId]);

  return (
    <pre className="whitespace-pre-wrap bg-black p-2">
      {output}
      {exitCode != null ? `\n[exited: ${exitCode}]` : ''}
    </pre>
  );
}
