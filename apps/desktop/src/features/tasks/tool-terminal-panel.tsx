import { Separator } from '../../components/ui/separator';
import { ExecuteTool, TerminalSize } from './execute-tool';

type ToolTerminalPanelProps = {
  toolExecutionId: string | null;
  onTerminalResize: (size: TerminalSize) => void;
};

export function ToolTerminalPanel({ toolExecutionId, onTerminalResize }: ToolTerminalPanelProps) {
  return (
    <>
      <Separator />
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Terminal</div>
        <div className="h-64 w-full overflow-hidden rounded-md border bg-slate-950">
          <ExecuteTool toolExecutionId={toolExecutionId} onTerminalResize={onTerminalResize} />
        </div>
      </div>
    </>
  );
}

