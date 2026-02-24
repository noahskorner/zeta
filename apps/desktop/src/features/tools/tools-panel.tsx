import { ListToolResponse } from '@zeta/commands';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AddToolDialog } from './add-tool-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

type ToolsPanelProps = {
  onToolCreated: (toolId: string) => void;
};

export function ToolsPanel(props: ToolsPanelProps) {
  const [tools, setTools] = useState<ListToolResponse[]>([]);
  const [disabledToolIds, setDisabledToolIds] = useState<string[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load tools when the panel opens.
  useEffect(() => {
    // Rehydrate disabled tools so users can suppress unavailable entries.
    setDisabledToolIds(readDisabledToolIds());
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

  function toggleToolDisabled(toolId: string): void {
    const nextDisabledToolIds = disabledToolIds.includes(toolId)
      ? disabledToolIds.filter((id) => id !== toolId)
      : [...disabledToolIds, toolId];
    setDisabledToolIds(nextDisabledToolIds);
    window.localStorage.setItem(DISABLED_TOOLS_STORAGE_KEY, JSON.stringify(nextDisabledToolIds));
  }

  async function openInstallInstructions(tool: ListToolResponse): Promise<void> {
    const installUrl = getInstallInstructionsUrl(tool.exec);
    if (!installUrl) {
      toast.error(`No install instructions configured for "${tool.exec}".`);
      return;
    }

    try {
      await window.zetaApi.openExternalUrl(installUrl);
    } catch (error) {
      toast.error('Failed to open install instructions.', { description: getErrorMessage(error) });
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Keep tool creation in the panel and refresh list data once creation succeeds. */}
      <div className="w-full flex items-center justify-between gap-3 rounded-md border p-4">
        <div className="text-sm text-muted-foreground">
          Add a tool to persist its executable configuration in app data.
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
          <CardContent className="text-sm text-muted-foreground">
            No tools have been added yet.
          </CardContent>
        </Card>
      ) : null}
      {!isLoadingTools && !errorMessage && tools.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <Card key={tool.id} className="gap-2">
              <CardHeader>
                <CardTitle className="text-base">{tool.name}</CardTitle>
                <CardDescription>{buildToolDescription(tool)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <div>
                  status:{' '}
                  {disabledToolIds.includes(tool.id)
                    ? 'Disabled'
                    : tool.status === 'ready'
                      ? 'Ready'
                      : 'Needs setup'}
                </div>
                <div>mode: {tool.interactive ? 'Interactive (PTY)' : 'Non-interactive'}</div>
                <div className="font-mono">id: {tool.id}</div>
                <div>created: {formatCreatedAt(tool.createdAt)}</div>
                {tool.status === 'needsSetup' || disabledToolIds.includes(tool.id) ? (
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="underline"
                      onClick={() =>
                        toast.info(
                          `Install "${tool.exec}" and ensure it is available on PATH, then restart Zeta.`,
                        )
                      }
                    >
                      Locate executable...
                    </button>
                    <button
                      type="button"
                      className="underline"
                      onClick={() => void openInstallInstructions(tool)}
                    >
                      Install instructions
                    </button>
                    <button
                      type="button"
                      className="underline"
                      onClick={() => toggleToolDisabled(tool.id)}
                    >
                      {disabledToolIds.includes(tool.id) ? 'Enable tool' : 'Disable tool'}
                    </button>
                  </div>
                ) : null}
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
  return `${tool.exec}${joinedArgs}`;
}

const DISABLED_TOOLS_STORAGE_KEY = 'zeta.tools.disabledToolIds';

const INSTALL_INSTRUCTIONS_URL_BY_EXEC: Record<string, string> = {
  claude: 'https://docs.anthropic.com/en/docs/claude-code',
  codex: 'https://platform.openai.com/docs/codex',
};

function readDisabledToolIds(): string[] {
  const rawValue = window.localStorage.getItem(DISABLED_TOOLS_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function getInstallInstructionsUrl(exec: string): string | null {
  return INSTALL_INSTRUCTIONS_URL_BY_EXEC[exec] ?? null;
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
