export interface UpdateTaskCommand {
  projectId: string;
  taskId: string;
  friendlyName?: string;
  description?: string;
}
