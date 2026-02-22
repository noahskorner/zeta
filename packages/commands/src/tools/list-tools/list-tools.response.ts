export interface ListToolResponse {
  id: string;
  name: string;
  command: string;
  args?: string[];
  createdAt: string;
}

export interface ListToolsResponse {
  tools: ListToolResponse[];
}
