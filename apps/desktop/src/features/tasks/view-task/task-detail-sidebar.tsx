import type { ListToolResponse } from '@zeta/commands';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Separator } from '../../../components/ui/separator';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '../../../components/ui/sidebar';
import { TerminalSize } from '../execute-tool';
import { ToolTerminalPanel } from '../tool-terminal-panel';

type TaskDetailSidebarProps = {
  actions?: React.ReactNode;
  taskId?: string;
  slug: string;
  title: string;
  description: string;
  createdAt?: string;
};

type TaskFieldKey = 'slug' | 'title' | 'description' | 'taskId' | 'createdAt';

type TaskFieldOption = {
  key: TaskFieldKey;
  label: string;
};

const TASK_FIELD_OPTIONS: TaskFieldOption[] = [
  { key: 'taskId', label: 'Task ID' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'slug', label: 'Slug' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
];

export function TaskDetailSidebar(props: TaskDetailSidebarProps) {
  const [toolExecutionId, setToolExecutionId] = useState<string | null>(null);
  const terminalSizeRef = useRef<TerminalSize>({ cols: 120, rows: 30 });
  const [tools, setTools] = useState<ListToolResponse[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<string>('');
  const [slotMappings, setSlotMappings] = useState<Record<number, TaskFieldKey | null>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  // Avoid render loops by updating terminal dimensions only when they actually change.
  const handleTerminalResize = useCallback((size: TerminalSize): void => {
    terminalSizeRef.current = size;
  }, []);

  useEffect(() => {
    void loadTools();
  }, []);

  const selectedTool = useMemo(
    () => tools.find((tool) => tool.id === selectedToolId) ?? null,
    [selectedToolId, tools],
  );

  const argumentSlots = selectedTool?.args ?? [];
  const hasTaskContext = Boolean(props.taskId || props.slug || props.title || props.description);

  async function loadTools(): Promise<void> {
    setIsLoadingTools(true);

    try {
      const response = await window.zetaApi.listTools();
      const disabledToolIds = readDisabledToolIds();
      const sortedTools = [...response.tools]
        .filter((tool) => !disabledToolIds.includes(tool.id))
        .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
      setTools(sortedTools);

      if (sortedTools.length > 0) {
        setSelectedToolId(sortedTools[0].id);
      }
    } catch (error) {
      toast.error('Failed to load tools.', { description: getErrorMessage(error) });
    } finally {
      setIsLoadingTools(false);
    }
  }

  function handleToolChange(nextToolId: string): void {
    setSelectedToolId(nextToolId);
    setSlotMappings({});
  }

  function updateSlotMapping(slotIndex: number, fieldName: TaskFieldKey | null): void {
    setSlotMappings((currentValue) => ({
      ...currentValue,
      [slotIndex]: fieldName,
    }));
  }

  async function handleExecuteTool(): Promise<void> {
    if (!selectedTool) {
      toast.error('Select a tool before executing.');
      return;
    }

    setIsExecuting(true);

    try {
      // const argv = argumentSlots
      //   .map((_, index) => {
      //     const fieldName = slotMappings[index];
      //     if (!fieldName) {
      //       return null;
      //     }

      //     const value = getTaskFieldValue(props, fieldName);
      //     if (value === undefined || value === null) {
      //       return null;
      //     }

      //     return String(value);
      //   })
      //   .filter((value): value is string => value !== null);

      const { toolExecutionId: executionId } = await window.zetaApi.executeTool({
        toolId: selectedTool.id,
        argv: [],
        cols: terminalSizeRef.current.cols,
        rows: terminalSizeRef.current.rows,
      });
      setToolExecutionId(executionId);
    } catch (error) {
      toast.error('Failed to start tool.', { description: getErrorMessage(error) });
    } finally {
      setIsExecuting(false);
    }
  }

  return (
    <Sidebar side="right" collapsible="offcanvas" className="h-full">
      <SidebarHeader className="border-b h-12 flex items-center justify-center">
        <div className="w-full flex items-center justify-end">
          {props.actions && <div className="flex items-center gap-2">{props.actions}</div>}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Tool</div>
            <Select
              value={selectedToolId}
              disabled={isLoadingTools || tools.length === 0}
              onValueChange={handleToolChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingTools
                      ? 'Loading tools...'
                      : tools.length === 0
                        ? 'No tools available'
                        : 'Select a tool'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tools.map((tool) => (
                  <SelectItem key={tool.id} value={tool.id}>
                    {tool.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTool ? (
              <div className="text-xs text-muted-foreground">
                {selectedTool.exec}
                {selectedTool.args && selectedTool.args.length > 0
                  ? ` ${selectedTool.args.join(' ')}`
                  : ''}
                {selectedTool.status === 'needsSetup' ? ' (Needs setup)' : ''}
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">Argument Mapping</div>
            {argumentSlots.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                This tool has no registered argument slots.
              </div>
            ) : null}
            {argumentSlots.map((slot, index) => {
              const selectedField = slotMappings[index] ?? null;

              return (
                <div key={`${slot}-${index}`} className="space-y-1">
                  <div className="font-mono text-xs text-muted-foreground">{slot}</div>
                  <Select
                    value={selectedField ?? 'none'}
                    disabled={!hasTaskContext}
                    onValueChange={(value) =>
                      updateSlotMapping(index, value === 'none' ? null : (value as TaskFieldKey))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Map to task field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No mapping</SelectItem>
                      {TASK_FIELD_OPTIONS.map((fieldOption) => (
                        <SelectItem key={fieldOption.key} value={fieldOption.key}>
                          {fieldOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </div>
        <ToolTerminalPanel
          toolExecutionId={toolExecutionId}
          onTerminalResize={handleTerminalResize}
        />
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <Button
          className="w-full"
          disabled={
            !selectedTool || isExecuting || !hasTaskContext || selectedTool.status !== 'ready'
          }
          onClick={() => void handleExecuteTool()}
        >
          {isExecuting ? 'Starting...' : 'Execute tool'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

const DISABLED_TOOLS_STORAGE_KEY = 'zeta.tools.disabledToolIds';

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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}

// function getTaskFieldValue(
//   props: TaskDetailSidebarProps,
//   fieldName: TaskFieldKey,
// ): string | undefined {
//   if (fieldName === 'title') {
//     return props.title;
//   }

//   if (fieldName === 'description') {
//     return props.description;
//   }

//   if (fieldName === 'slug') {
//     return props.slug;
//   }

//   if (fieldName === 'taskId') {
//     return props.taskId;
//   }

//   return props.createdAt;
// }
