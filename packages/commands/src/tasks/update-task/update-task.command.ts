export interface UpdateTaskCommand {
  projectId: string;
  taskId: string;
  title?: string;
  description?: string;
}
