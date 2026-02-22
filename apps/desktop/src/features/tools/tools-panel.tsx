import { AddToolDialog } from './add-tool-dialog';

type ToolsPanelProps = {
  onToolCreated: (toolId: string) => void;
};

export function ToolsPanel(props: ToolsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Keep tool creation isolated in this MVP; listing/execution ships later. */}
      <div className="flex items-center justify-between gap-3 rounded-md border p-4">
        <div className="text-sm text-muted-foreground">
          Add a tool to persist its runnable command in app data.
        </div>
        <AddToolDialog onToolCreated={props.onToolCreated} />
      </div>
    </div>
  );
}
