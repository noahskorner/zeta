import { FindProjectResponse } from "@zeta/commands";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar, type SidebarView } from "./app-sidebar";
import { ThemeSelector } from "./theme-selector";
import { ProjectDropdown } from "./projects/project-dropdown";
import { TasksPanel } from "./tasks/tasks-panel";

const mockedAgentRuntimes = [
  { label: "Codex", status: "healthy", latency: "220ms" },
  { label: "Claude Code", status: "healthy", latency: "260ms" },
  { label: "GitHub Copilot", status: "degraded", latency: "480ms" },
];

const mockedAutomations = [
  "Nightly repo review",
  "Spec sync for PRODUCT.md",
  "Task cleanup and normalization",
];

export default function App() {
  const [projects, setProjects] = useState<FindProjectResponse[]>([]);
  const [selectedProjectPath, setSelectedProjectPath] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [activeView, setActiveView] = useState<SidebarView>("tasks");

  // Load projects when the app opens.
  useEffect(() => {
    void loadProjects();
  }, []);

  async function handleAddProject() {
    setIsAddingProject(true);

    try {
      const newProject = await window.zetaApi.addProject();
      if (!newProject) {
        return;
      }
      toast.success("Project created.", { description: newProject });
      await loadProjects();
    } catch (error) {
      toast.error("Failed to create project.", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsAddingProject(false);
    }
  }

  async function loadProjects(projectPathToSelect?: string) {
    setIsLoadingProjects(true);

    try {
      const { projects } = await window.zetaApi.listProjects();
      const sortedProjects = [...projects].sort((first, second) =>
        second.createdAt.localeCompare(first.createdAt),
      );
      setProjects(sortedProjects);

      if (sortedProjects.length === 0) {
        setSelectedProjectPath(null);
        return;
      }

      if (projectPathToSelect) {
        setSelectedProjectPath(projectPathToSelect);
        return;
      }

      if (
        selectedProjectPath &&
        sortedProjects.some((project) => project.folderPath === selectedProjectPath)
      ) {
        return;
      }

      setSelectedProjectPath(sortedProjects[0].folderPath);
    } catch (error) {
      toast.error("Failed to load projects.", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoadingProjects(false);
    }
  }

  function handleTaskCreated(taskId: string) {
    toast.success("Task created.", { description: taskId });
  }

  function handleTaskError(message: string) {
    toast.error("Failed to create task.", { description: message });
  }

  return (
    <SidebarProvider>
      <AppSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isAddingProject={isAddingProject}
        onAddProject={handleAddProject}
        onRefreshProjects={loadProjects}
      />

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <ProjectDropdown
              projects={projects}
              selectedProjectPath={selectedProjectPath}
              isLoadingProjects={isLoadingProjects}
              onSelectProject={setSelectedProjectPath}
            />
          </div>

          {/* Right side */}
          <ThemeSelector />
        </header>

        <main className="mx-auto w-full p-6">
          {activeView === "tasks" ? (
            <TasksPanel
              selectedProjectPath={selectedProjectPath}
              onTaskCreated={handleTaskCreated}
              onError={handleTaskError}
            />
          ) : null}
          {activeView === "agents" ? <AgentsPanel /> : null}
          {activeView === "automations" ? <AutomationsPanel /> : null}
        </main>
      </SidebarInset>
    </SidebarProvider>
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
            <Badge variant={agent.status === "healthy" ? "secondary" : "destructive"}>
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

  return "Unknown error";
}
