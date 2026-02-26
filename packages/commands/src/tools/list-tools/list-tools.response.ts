import { ToolArg } from '../tool-arg';

export interface ListToolResponse {
  id: string;
  name: string;
  exec: string;
  args?: ToolArg[];
  interactive: boolean;
  status: 'ready' | 'needsSetup';
  resolvedExec?: string;
  createdAt: string;
}

export interface ListToolsResponse {
  tools: ListToolResponse[];
}
