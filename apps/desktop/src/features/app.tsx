import { AddProviderResponse, ListProjectResponse } from '@zeta/commands';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import { AppSidebar, type SidebarView } from './app-sidebar';
import { AppHeader } from './app-header';
import { MarkdownEditorPanel } from './markdown-editor/markdown-editor-panel';
import { ProvidersPanel } from './providers/providers-panel';
import { SchedulesPanel } from './schedules/schedules-panel';
import { TasksPanel } from './tasks/tasks-panel';
import { ToolsPanel } from './tools/tools-panel';
import { WindowHeader } from './window-header';
import { RecipesPanel } from './recipes/recipes-panel';

export default function App() {
  const [projects, setProjects] = useState<ListProjectResponse[]>([]);
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

  function handleTaskUpdated(taskId: string) {
    toast.success('Task updated.', { description: taskId });
  }

  function handleTaskError(message: string) {
    toast.error('Task operation failed.', { description: message });
  }

  function handleToolCreated(toolId: string) {
    toast.success('Tool created.', { description: toolId });
  }

  function handleProviderCreated(provider: AddProviderResponse) {
    toast.success('Provider added.', { description: provider.id });
  }

  function handleProviderError(message: string) {
    toast.error('Provider operation failed.', { description: message });
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

          <SidebarInset className="min-h-0">
            <AppHeader
              projects={projects}
              selectedProjectId={selectedProjectId}
              isLoadingProjects={isLoadingProjects}
              onSelectProject={setSelectedProjectId}
            />

            <main className="mx-auto flex min-h-0 w-full flex-1 overflow-y-auto p-6">
              {activeView === 'tasks' ? (
                <TasksPanel
                  selectedProjectId={selectedProjectId}
                  onTaskCreated={handleTaskCreated}
                  onTaskUpdated={handleTaskUpdated}
                  onError={handleTaskError}
                />
              ) : null}
              {activeView === 'tools' ? <ToolsPanel onToolCreated={handleToolCreated} /> : null}
              {activeView === 'providers' ? (
                <ProvidersPanel
                  onProviderCreated={handleProviderCreated}
                  onError={handleProviderError}
                />
              ) : null}
              {activeView === 'markdownEditor' ? <MarkdownEditorPanel /> : null}
              {activeView === 'recipes' ? <RecipesPanel /> : null}
              {activeView === 'schedules' ? <SchedulesPanel /> : null}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}
