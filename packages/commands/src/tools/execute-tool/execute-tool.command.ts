export interface ExecuteToolCommand {
  toolId: string;
  argv: string[];
  cwd?: string;
  env?: Record<string, string>;
  cols?: number;
  rows?: number;
}
