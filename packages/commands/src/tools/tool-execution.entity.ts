export interface ToolExecutionEntity {
  id: string;
  toolId: string;
  command: string;
  args: string[];
  cwd: string;
  env?: Record<string, string>;
  pid?: number;
  startedAt: string;
}
