export interface AddToolModel {
  name: string;
  exec: string;
  args?: string[];
  interactive: boolean;
}
