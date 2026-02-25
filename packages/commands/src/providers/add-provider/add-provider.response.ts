export interface AddProviderResponse {
  id: string;
  provider: string;
  defaultModel: string;
  baseUrl?: string;
  organization?: string;
  project?: string;
  createdAt: string;
}
