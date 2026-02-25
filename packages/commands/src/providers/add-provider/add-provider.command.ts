export interface AddProviderCommand {
  id: string;
  provider: string;
  defaultModel: string;
  apiKey: string;
  baseUrl?: string;
  organization?: string;
  project?: string;
  passphrase?: string;
}
