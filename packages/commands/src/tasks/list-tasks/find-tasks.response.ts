export interface ListTaskResponse {
  id: string;
  name: string;
  friendlyName: string;
  description: string;
  createdAt: string;
}

export interface ListTasksResponse {
  tasks: ListTaskResponse[];
}
