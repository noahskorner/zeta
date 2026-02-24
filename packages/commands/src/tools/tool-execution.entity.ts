export interface ToolExecutionEntity {
  id: string;
  toolId: string;
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'completed' | 'failed';
  exitCode?: number;
}
