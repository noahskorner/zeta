import { ToolArg } from '../tool-arg';

export interface AddToolCommand {
  name: string;
  exec: string;
  args?: ToolArg[];
  interactive: boolean;
}
