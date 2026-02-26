import { ToolArg } from './tool-arg';

export interface ToolEntity {
  id: string;
  name: string;
  exec: string;
  args?: ToolArg[];
  interactive: boolean;
  createdAt: string;
}
