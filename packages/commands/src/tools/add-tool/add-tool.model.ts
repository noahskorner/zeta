import { ToolArg } from '../tool-arg';

export interface AddToolModel {
  name: string;
  exec: string;
  args?: ToolArg[];
  interactive: boolean;
}
