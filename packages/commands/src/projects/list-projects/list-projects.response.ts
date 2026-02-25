export interface ListProjectResponse {
  id: string;
  createdAt: string;
  name: string;
  folderPath: string;
}

export interface ListProjectsResponse {
  projects: ListProjectResponse[];
}
