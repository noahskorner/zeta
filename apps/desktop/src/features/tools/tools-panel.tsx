import { ListToolResponse } from '@zeta/commands';
import { useEffect, useState } from 'react';
import { AddToolDialog } from './add-tool-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

type ToolsPanelProps = {
  onToolCreated: (toolId: string) => void;
};

export function ToolsPanel(props: ToolsPanelProps) {
  const [tools, setTools] = useState<ListToolResponse[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load tools when the panel opens.
  useEffect(() => {
    void loadTools();
  }, []);

  // Refresh the list after creation and notify the parent for shared toast behavior.
  function handleToolCreated(toolId: string): void {
    props.onToolCreated(toolId);
    void loadTools();
  }

  async function loadTools(): Promise<void> {
    setIsLoadingTools(true);
    setErrorMessage(null);

    try {
      const response = await window.zetaApi.listTools();
      const sortedTools = [...response.tools].sort((first, second) =>
        second.createdAt.localeCompare(first.createdAt),
      );
      setTools(sortedTools);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoadingTools(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Keep tool creation in the panel and refresh list data once creation succeeds. */}
      <div className="flex items-center justify-between gap-3 rounded-md border p-4">
        <div className="text-sm text-muted-foreground">
          Add a tool to persist its runnable command in app data.
        </div>
        <AddToolDialog onToolCreated={handleToolCreated} />
      </div>

      {/* Surface loading and errors before rendering the list. */}
      {isLoadingTools ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">Loading tools...</CardContent>
        </Card>
      ) : null}
      {errorMessage ? (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-sm text-destructive">
            Failed to load tools: {errorMessage}
          </CardContent>
        </Card>
      ) : null}

      {/* Render persisted tools as cards with core metadata. */}
      {!isLoadingTools && !errorMessage && tools.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No tools have been added yet.
          </CardContent>
        </Card>
      ) : null}
      {!isLoadingTools && !errorMessage && tools.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <Card key={tool.id}>
              <CardHeader>
                <CardTitle className="text-base">{tool.name}</CardTitle>
                <CardDescription>{buildToolDescription(tool)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <div className="font-mono">id: {tool.id}</div>
                <div>created: {formatCreatedAt(tool.createdAt)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function buildToolDescription(tool: ListToolResponse): string {
  const joinedArgs = tool.args && tool.args.length > 0 ? ` ${tool.args.join(' ')}` : '';
  return `${tool.command}${joinedArgs}`;
}

function formatCreatedAt(createdAt: string): string {
  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return createdAt;
  }

  return parsedDate.toLocaleString();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}
