export interface ListTaskResponse {
  id: string;
  createdAt: string;
  slug: string;
  title: string;
  description: string;
}

export interface ListTasksResponse {
  tasks: ListTaskResponse[];
}
