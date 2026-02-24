export interface AddToolCommand {
  name: string;
  exec: string;
  args?: string[];
  interactive: boolean;
}
