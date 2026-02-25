export interface UpdateTaskCommand {
  projectPath: string;
  taskId: string;
  friendlyName?: string;
  description?: string;
}
