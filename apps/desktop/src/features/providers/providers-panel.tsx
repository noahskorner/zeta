import type { AddProviderResponse, ProviderEntity } from '@zeta/commands';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { AddProviderDialog } from './add-provider-dialog';

type ProvidersPanelProps = {
  onProviderCreated: (provider: AddProviderResponse) => void;
  onError: (message: string) => void;
};

export function ProvidersPanel(props: ProvidersPanelProps) {
  const [providers, setProviders] = useState<ProviderEntity[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load providers when the panel opens.
  useEffect(() => {
    void loadProviders();
  }, []);

  // Refresh provider list and notify parent when a provider is created.
  function handleProviderCreated(provider: AddProviderResponse): void {
    props.onProviderCreated(provider);
    void loadProviders();
  }

  async function loadProviders(): Promise<void> {
    setIsLoadingProviders(true);
    setErrorMessage(null);

    try {
      const response = await window.zetaApi.listProviders();
      const sortedProviders = [...response.providers].sort((first, second) =>
        second.createdAt.localeCompare(first.createdAt),
      );
      setProviders(sortedProviders);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      props.onError(message);
    } finally {
      setIsLoadingProviders(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Keep provider creation in the panel and refresh list data once creation succeeds. */}
      <div className="w-full flex items-center justify-between gap-3 rounded-md border p-4">
        <div className="text-sm text-muted-foreground">
          Add a model provider and securely persist its credentials.
        </div>
        <AddProviderDialog onProviderCreated={handleProviderCreated} onError={props.onError} />
      </div>

      {/* Surface loading and errors before rendering the list. */}
      {isLoadingProviders ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">Loading providers...</CardContent>
        </Card>
      ) : null}
      {errorMessage ? (
        <Card className="border-destructive/50">
          <CardContent className="text-sm text-destructive">
            Failed to load providers: {errorMessage}
          </CardContent>
        </Card>
      ) : null}

      {/* Render persisted providers with key runtime metadata. */}
      {!isLoadingProviders && !errorMessage && providers.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            No providers have been added yet.
          </CardContent>
        </Card>
      ) : null}
      {!isLoadingProviders && !errorMessage && providers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.id} className="gap-2">
              <CardHeader>
                <CardTitle className="text-base">{provider.provider}</CardTitle>
                <CardDescription>{provider.defaultModel}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <div className="font-mono">id: {provider.id}</div>
                <div>created: {formatCreatedAt(provider.createdAt)}</div>
                {provider.baseUrl ? (
                  <div className="truncate">base url: {provider.baseUrl}</div>
                ) : null}
                {provider.organization ? <div>organization: {provider.organization}</div> : null}
                {provider.project ? <div>project: {provider.project}</div> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function formatCreatedAt(createdAt: string): string {
  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return createdAt;
  }

  return parsedDate.toLocaleString();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}
