import { Globe } from 'lucide-react';
import { VsCodeLogo } from '../../components/vscode-logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { FigmaLogo } from '../../components/figma-logo';

type IntegrationScope = 'task' | 'project' | 'workspace';

type MockIntegration = {
  id: string;
  name: string;
  launcher: 'vscode' | 'figma' | 'browser';
  scope: IntegrationScope;
  openTemplate: string;
};

const mockedIntegrations: MockIntegration[] = [
  {
    id: 'integration-vscode-task',
    name: 'VS Code Task Workspace',
    launcher: 'vscode',
    scope: 'task',
    openTemplate: 'vscode://file/{projectPath}?folder={taskPath}',
  },
  {
    id: 'integration-figma-project',
    name: 'Figma Project Board',
    launcher: 'figma',
    scope: 'project',
    openTemplate: 'https://www.figma.com/file/{figmaFileId}',
  },
  {
    id: 'integration-browser-workspace',
    name: 'Browser Dashboard',
    launcher: 'browser',
    scope: 'workspace',
    openTemplate: 'https://example.local/dashboard?project={projectId}&task={taskId}',
  },
];

export function IntegrationsPanel() {
  return (
    <div className="w-full space-y-4">
      {/* Clarify that launcher configuration is currently UI-only. */}
      <div className="w-full rounded-md border p-4 text-sm text-muted-foreground">
        Configure external launchers (for example VS Code, Figma, and browser deep links).
      </div>

      {/* Render mocked launcher configurations until persistence and execution are implemented. */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockedIntegrations.map((integration) => (
          <Card key={integration.id} className="gap-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LauncherIcon launcher={integration.launcher} />
                <span>{integration.name}</span>
              </CardTitle>
              <CardDescription>{formatLauncherLabel(integration.launcher)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <div>scope: {capitalize(integration.scope)}</div>
              <div className="truncate">template: {integration.openTemplate}</div>
              <div className="font-mono">id: {integration.id}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LauncherIcon({ launcher }: { launcher: MockIntegration['launcher'] }) {
  if (launcher === 'vscode') {
    return (
      <div className="size-5 shrink-0 [&>svg]:size-full">
        <VsCodeLogo />
      </div>
    );
  }

  if (launcher === 'figma') {
    return (
      <div className="size-5 shrink-0 [&>svg]:size-full">
        <FigmaLogo />
      </div>
    );
  }

  return <Globe className="size-4" />;
}

function formatLauncherLabel(launcher: MockIntegration['launcher']): string {
  if (launcher === 'vscode') {
    return 'VS Code launcher';
  }

  if (launcher === 'figma') {
    return 'Figma launcher';
  }

  return 'Browser launcher';
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
