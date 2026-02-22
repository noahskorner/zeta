import { FindProjectResponse } from '@zeta/commands';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import { AppSidebar, type SidebarView } from './app-sidebar';
import { AppHeader } from './app-header';
import { MarkdownEditorPanel } from './markdown-editor/markdown-editor-panel';
import { TasksPanel } from './tasks/tasks-panel';
import { WindowHeader } from './window-header';

const mockedAgentRuntimes = [
  { label: 'Codex', status: 'healthy', latency: '220ms' },
  { label: 'Claude Code', status: 'healthy', latency: '260ms' },
  { label: 'GitHub Copilot', status: 'degraded', latency: '480ms' },
];

const mockedAutomations = [
  'Nightly repo review',
  'Spec sync for PRODUCT.md',
  'Task cleanup and normalization',
];

export default function App() {
  const [projects, setProjects] = useState<FindProjectResponse[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [activeView, setActiveView] = useState<SidebarView>('tasks');
  const [isWindowMaximized, setIsWindowMaximized] = useState(false);

  // Load projects when the app opens.
  useEffect(() => {
    void loadProjects();
  }, []);

  // Sync maximize/restore state so the button icon always reflects current window state.
  useEffect(() => {
    const unsubscribe = window.zetaApi.onWindowMaximizeStateChanged(setIsWindowMaximized);
    void window.zetaApi.isWindowMaximized().then(setIsWindowMaximized);
    return unsubscribe;
  }, []);

  async function handleAddProject() {
    setIsAddingProject(true);

    try {
      const newProjectId = await window.zetaApi.addProject();
      if (!newProjectId) {
        return;
      }
      toast.success('Project created.', { description: newProjectId });
      await loadProjects(newProjectId);
    } catch (error) {
      toast.error('Failed to create project.', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsAddingProject(false);
    }
  }

  async function loadProjects(projectIdToSelect?: string) {
    setIsLoadingProjects(true);

    try {
      const { projects } = await window.zetaApi.listProjects();
      const sortedProjects = [...projects].sort((first, second) =>
        second.createdAt.localeCompare(first.createdAt),
      );
      setProjects(sortedProjects);

      if (sortedProjects.length === 0) {
        setSelectedProjectId(null);
        return;
      }

      if (projectIdToSelect) {
        setSelectedProjectId(projectIdToSelect);
        return;
      }

      if (selectedProjectId && sortedProjects.some((project) => project.id === selectedProjectId)) {
        return;
      }

      setSelectedProjectId(sortedProjects[0].id);
    } catch (error) {
      toast.error('Failed to load projects.', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoadingProjects(false);
    }
  }

  function handleTaskCreated(taskId: string) {
    toast.success('Task created.', { description: taskId });
  }

  function handleTaskError(message: string) {
    toast.error('Task operation failed.', { description: message });
  }

  async function handleMinimizeWindow() {
    await window.zetaApi.minimizeWindow();
  }

  async function handleToggleMaximizeWindow() {
    const isMaximized = await window.zetaApi.toggleMaximizeWindow();
    setIsWindowMaximized(isMaximized);
  }

  async function handleCloseWindow() {
    await window.zetaApi.closeWindow();
  }

  const selectedProject = selectedProjectId
    ? (projects.find((project) => project.id === selectedProjectId) ?? null)
    : null;
  const selectedProjectPath = selectedProject?.folderPath ?? null;

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <WindowHeader
        isWindowMaximized={isWindowMaximized}
        onMinimizeWindow={handleMinimizeWindow}
        onToggleMaximizeWindow={handleToggleMaximizeWindow}
        onCloseWindow={handleCloseWindow}
      />
      <div id="window-body-portal" className="relative mt-8 flex min-h-0 flex-1 pt-12">
        <SidebarProvider className="min-h-0 flex-1">
          <AppSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            isAddingProject={isAddingProject}
            onAddProject={handleAddProject}
            onRefreshProjects={loadProjects}
          />

          <SidebarInset>
            <AppHeader
              projects={projects}
              selectedProjectId={selectedProjectId}
              isLoadingProjects={isLoadingProjects}
              onSelectProject={setSelectedProjectId}
            />

            <main className="mx-auto w-full p-6">
              {activeView === 'tasks' ? (
                <TasksPanel
                  selectedProjectId={selectedProjectId}
                  selectedProjectPath={selectedProjectPath}
                  onTaskCreated={handleTaskCreated}
                  onError={handleTaskError}
                />
              ) : null}
              {activeView === 'markdownEditor' ? <MarkdownEditorPanel /> : null}
              {activeView === 'agents' ? <AgentsPanel /> : null}
              {activeView === 'automations' ? <AutomationsPanel /> : null}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}

function AgentsPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {mockedAgentRuntimes.map((agent) => (
        <Card key={agent.label}>
          <CardHeader>
            <CardTitle className="text-base">{agent.label}</CardTitle>
            <CardDescription>Pluggable execution runtime.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge variant={agent.status === 'healthy' ? 'secondary' : 'destructive'}>
              {agent.status}
            </Badge>
            <div className="font-mono text-xs text-muted-foreground">{agent.latency}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AutomationsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Automation Queue</CardTitle>
        <CardDescription>Mocked jobs that keep specs and repo state synchronized.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockedAutomations.map((automationName) => (
          <div
            key={automationName}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <div className="text-sm font-medium">{automationName}</div>
            <Badge variant="outline">Enabled</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}
