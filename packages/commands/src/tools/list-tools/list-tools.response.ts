export interface ListToolResponse {
  id: string;
  name: string;
  exec: string;
  args?: string[];
  interactive: boolean;
  status: 'ready' | 'needsSetup';
  resolvedExec?: string;
  createdAt: string;
}

export interface ListToolsResponse {
  tools: ListToolResponse[];
}
