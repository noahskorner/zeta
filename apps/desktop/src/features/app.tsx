import { FindProjectResponse } from "@zeta/commands";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { AppSidebar, type SidebarView } from "./app-sidebar";
import { ThemeSelector } from "./theme-selector";
import { ProjectDropdown } from "./projects/project-dropdown";
import { TasksBoard } from "./tasks/tasks-board";

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
  const [selectedProjectPath, setSelectedProjectPath] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [activeView, setActiveView] = useState<SidebarView>("tasks");

  // Load projects when the app opens.
  useEffect(() => {
    void loadProjects();
  }, []);

  async function handleAddProject() {
    setErrorMessage(null);
    setIsAddingProject(true);

    try {
      const newProject = await window.zetaApi.addProject();
      if (!newProject) {
        return;
      }
      await loadProjects();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
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
        sortedProjects.some(
          (project) => project.folderPath === selectedProjectPath,
        )
      ) {
        return;
      }

      setSelectedProjectPath(sortedProjects[0].folderPath);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoadingProjects(false);
    }
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
          {activeView === "tasks" ? <TasksPanel /> : null}
          {activeView === "agents" ? <AgentsPanel /> : null}
          {activeView === "automations" ? <AutomationsPanel /> : null}

          {errorMessage ? (
            <div className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function TasksPanel() {
  return <TasksBoard />;
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
            <Badge
              variant={agent.status === "healthy" ? "secondary" : "destructive"}
            >
              {agent.status}
            </Badge>
            <div className="font-mono text-xs text-muted-foreground">
              {agent.latency}
            </div>
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
        <CardDescription>
          Mocked jobs that keep specs and repo state synchronized.
        </CardDescription>
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

function getViewTitle(view: SidebarView): string {
  if (view === "tasks") {
    return "Tasks";
  }

  if (view === "agents") {
    return "Agents";
  }

  return "Automations";
}

function getViewDescription(view: SidebarView): string {
  if (view === "tasks") {
    return "Markdown-first lifecycle tracking for coding specs.";
  }

  if (view === "agents") {
    return "Abstracted provider runtimes for task execution.";
  }

  return "Cron-like and manual triggers for repository maintenance.";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown error";
}
