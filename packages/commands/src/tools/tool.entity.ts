export interface ToolEntity {
  id: string;
  name: string;
  exec: string;
  args?: string[];
  interactive: boolean;
  createdAt: string;
}
