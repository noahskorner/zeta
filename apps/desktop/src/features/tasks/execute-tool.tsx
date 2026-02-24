import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { Terminal } from '@xterm/xterm';
import {
  ToolExecutionStreamDataMessage,
  ToolExecutionStreamExitMessage,
} from '@zeta/commands';
import { useEffect, useRef } from 'react';

const DEFAULT_COLS = 120;
const DEFAULT_ROWS = 30;

export type TerminalSize = {
  cols: number;
  rows: number;
};

type ExecuteToolProps = {
  toolExecutionId: string | null;
  onTerminalResize?: (size: TerminalSize) => void;
};

export function ExecuteTool({ toolExecutionId, onTerminalResize }: ExecuteToolProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const lastRunIdRef = useRef<string | null>(null);
  const activeRunIdRef = useRef<string | null>(toolExecutionId);
  const onTerminalResizeRef = useRef(onTerminalResize);
  const lastKnownSizeRef = useRef<TerminalSize>({ cols: DEFAULT_COLS, rows: DEFAULT_ROWS });
  const isSyncingSizeRef = useRef(false);
  const resizeRafRef = useRef<number | null>(null);

  useEffect(() => {
    onTerminalResizeRef.current = onTerminalResize;
  }, [onTerminalResize]);

  useEffect(() => {
    activeRunIdRef.current = toolExecutionId;
  }, [toolExecutionId]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // Initialize xterm once and keep renderer listeners independent from React rerenders.
    const terminal = new Terminal({
      cursorBlink: true,
      convertEol: true,
      cols: DEFAULT_COLS,
      rows: DEFAULT_ROWS,
      fontFamily: '"Cascadia Mono", Consolas, "Courier New", monospace',
      fontSize: 13,
      theme: {
        background: '#020617',
        foreground: '#e2e8f0',
      },
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const inputDisposable = terminal.onData((data: string) => {
      const activeRunId = activeRunIdRef.current;
      if (!activeRunId) {
        return;
      }

      void window.zetaApi.writeToolInput(activeRunId, data);
    });

    // Keep terminal geometry in sync with the container and running tool session.
    const fitAndSync = () => {
      if (isSyncingSizeRef.current) {
        return;
      }

      if (!terminalRef.current || !fitAddonRef.current) {
        return;
      }

      isSyncingSizeRef.current = true;
      try {
        fitAddonRef.current.fit();
      } catch {
        isSyncingSizeRef.current = false;
        return;
      }

      const nextSize = { cols: terminalRef.current.cols, rows: terminalRef.current.rows };
      const lastSize = lastKnownSizeRef.current;
      if (lastSize.cols === nextSize.cols && lastSize.rows === nextSize.rows) {
        isSyncingSizeRef.current = false;
        return;
      }

      lastKnownSizeRef.current = nextSize;
      onTerminalResizeRef.current?.(nextSize);

      if (activeRunIdRef.current) {
        void window.zetaApi.resizeToolTerminal(
          activeRunIdRef.current,
          nextSize.cols,
          nextSize.rows,
        );
      }

      isSyncingSizeRef.current = false;
    };

    const scheduleFit = () => {
      if (resizeRafRef.current != null) {
        return;
      }

      resizeRafRef.current = window.requestAnimationFrame(() => {
        resizeRafRef.current = null;
        fitAndSync();
      });
    };

    const observer = new ResizeObserver(() => {
      scheduleFit();
    });
    observer.observe(containerRef.current);

    window.addEventListener('resize', scheduleFit);
    const fitTimer = window.setTimeout(scheduleFit, 0);

    return () => {
      inputDisposable.dispose();
      observer.disconnect();
      window.removeEventListener('resize', scheduleFit);
      window.clearTimeout(fitTimer);
      if (resizeRafRef.current != null) {
        window.cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
      isSyncingSizeRef.current = false;
      fitAddonRef.current = null;
      terminalRef.current?.dispose();
      terminalRef.current = null;
    };
  }, []);

  useEffect(() => {
    const terminal = terminalRef.current;
    if (!terminal) {
      return;
    }

    // Reset visible output between executions while keeping the same terminal instance.
    if (lastRunIdRef.current !== toolExecutionId) {
      terminal.clear();

      if (!toolExecutionId) {
        terminal.writeln('Run a tool to start an interactive terminal session.');
      }

      lastRunIdRef.current = toolExecutionId;
    }
  }, [toolExecutionId]);

  useEffect(() => {
    const offData = window.zetaApi.onToolOutput(
      ({ runId, data }: ToolExecutionStreamDataMessage): void => {
        if (runId !== activeRunIdRef.current) {
          return;
        }

        terminalRef.current?.write(data);
      },
    );

    const offExit = window.zetaApi.onToolExit(
      ({ runId, exitCode }: ToolExecutionStreamExitMessage): void => {
        if (runId !== activeRunIdRef.current) {
          return;
        }

        terminalRef.current?.writeln(`\r\n[exited: ${exitCode}]`);
      },
    );

    return () => {
      offData();
      offExit();
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full overflow-hidden rounded-md" />;
}
