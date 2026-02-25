export interface ProviderEntity {
  id: string;
  provider: string;
  defaultModel: string;
  baseUrl?: string;
  organization?: string;
  project?: string;
  createdAt: string;
}

export interface ProviderSecretEntity {
  providerId: string;
  scheme: 'windows-dpapi' | 'aes-256-gcm';
  ciphertext: string;
  iv?: string;
  authTag?: string;
  salt?: string;
  createdAt: string;
}
