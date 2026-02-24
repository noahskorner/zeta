export interface AddToolResponse {
  id: string;
  name: string;
  exec: string;
  args?: string[];
  interactive: boolean;
  createdAt: string;
}
