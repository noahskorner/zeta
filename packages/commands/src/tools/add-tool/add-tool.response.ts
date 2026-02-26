import { ToolArg } from '../tool-arg';

export interface AddToolResponse {
  id: string;
  name: string;
  exec: string;
  args?: ToolArg[];
  interactive: boolean;
  createdAt: string;
}
