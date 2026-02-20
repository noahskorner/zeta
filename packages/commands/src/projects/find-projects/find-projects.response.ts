export interface FindProjectResponse {
  id: string;
  createdAt: string;
  name: string;
  folderPath: string;
}

export interface FindProjectsResponse {
  projects: FindProjectResponse[];
}
