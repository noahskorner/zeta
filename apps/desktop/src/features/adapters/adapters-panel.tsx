import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

type MockAdapter = {
  id: string;
  name: string;
  tool: string;
  statusDetection: string;
  structuredEvents: string[];
  normalizedIo: string[];
  supportsResume: boolean;
  status: 'Working' | 'Needs input' | 'Done';
  updatedAt: string;
};

const mockedAdapters: MockAdapter[] = [
  {
    id: 'adapter-codex-cli',
    name: 'CodexAdapter',
    tool: 'codex',
    statusDetection: 'needs input | working | done',
    structuredEvents: ['progress', 'step-start', 'step-complete', 'tool-output'],
    normalizedIo: ['stdin prompts', 'stdout/stderr streams', 'exit codes', 'file outputs'],
    supportsResume: true,
    status: 'Working',
    updatedAt: '2026-02-25T13:12:00.000Z',
  },
  {
    id: 'adapter-claude-code',
    name: 'ClaudeCodeAdapter',
    tool: 'claude',
    statusDetection: 'needs input | working | done',
    structuredEvents: ['progress', 'plan-update', 'tool-output', 'final-summary'],
    normalizedIo: ['stdin prompts', 'exit codes', 'session transcripts'],
    supportsResume: true,
    status: 'Needs input',
    updatedAt: '2026-02-25T13:28:00.000Z',
  },
  {
    id: 'adapter-legacy-script',
    name: 'LegacyScriptAdapter',
    tool: 'custom script',
    statusDetection: 'working | done',
    structuredEvents: ['stdout line events'],
    normalizedIo: ['stdout/stderr streams', 'exit codes'],
    supportsResume: false,
    status: 'Done',
    updatedAt: '2026-02-25T11:44:00.000Z',
  },
];

export function AdaptersPanel() {
  return (
    <div className="w-full space-y-4">
      {/* Clarify adapter purpose and keep provider/model scope separate. */}
      <div className="w-full rounded-md border p-4 text-sm text-muted-foreground space-y-1">
        <div>
          Adapters are first-party integration drivers for tool runtimes. They detect state,
          extract structured progress events, normalize IO, and can support resume/reattach.
        </div>
      </div>

      {/* Render mocked adapter runtime capabilities until persistence is wired. */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockedAdapters.map((adapter) => (
          <Card key={adapter.id} className="gap-2">
            <CardHeader>
              <CardTitle className="text-base">{adapter.name}</CardTitle>
              <CardDescription>{adapter.tool}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <div>status: {adapter.status}</div>
              <div>detects: {adapter.statusDetection}</div>
              <div>events: {adapter.structuredEvents.join(', ')}</div>
              <div>io: {adapter.normalizedIo.join(', ')}</div>
              <div>resume: {adapter.supportsResume ? 'Supported' : 'Not supported'}</div>
              <div className="font-mono">id: {adapter.id}</div>
              <div>updated: {formatUpdatedAt(adapter.updatedAt)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function formatUpdatedAt(updatedAt: string): string {
  const parsedDate = new Date(updatedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return updatedAt;
  }

  return parsedDate.toLocaleString();
}
