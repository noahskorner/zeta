import { FindProjectResponse } from "@zeta/commands";
import { useEffect, useMemo, useState } from "react";
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

const mockedTaskColumns = [
  { label: "Backlog", value: 7 },
  { label: "Ready", value: 4 },
  { label: "In Progress", value: 2 },
  { label: "Review", value: 1 },
  { label: "Complete", value: 12 },
];

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
  const [projectFiles, setProjectFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [activeView, setActiveView] = useState<SidebarView>("workspace");

  // Resolve the selected project once to avoid repeated lookups while rendering.
  const selectedProject = useMemo(() => {
    if (!selectedProjectPath) {
      return null;
    }

    return (
      projects.find((project) => project.folderPath === selectedProjectPath) ??
      null
    );
  }, [projects, selectedProjectPath]);

  // Load projects when the app opens.
  useEffect(() => {
    void loadProjects();
  }, []);

  // Reset file state when project selection changes.
  useEffect(() => {
    if (!selectedProjectPath) {
      setProjectFiles([]);
      setSelectedFile(null);
      return;
    }
  }, [selectedProjectPath]);

  // Placeholder for file loading effect when file APIs are wired.
  useEffect(() => {
    if (!selectedProjectPath || !selectedFile) {
      return;
    }
  }, [selectedProjectPath, selectedFile]);

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
        projectCount={projects.length}
        isAddingProject={isAddingProject}
        onAddProject={handleAddProject}
        onRefreshProjects={loadProjects}
      />

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background px-4">
          <ThemeSelector />
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div>
            <div className="text-sm font-semibold">{getViewTitle(activeView)}</div>
            <div className="text-xs text-muted-foreground">{getViewDescription(activeView)}</div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-6">
          {activeView === "workspace" ? (
            <WorkspacePanel
              isLoadingProjects={isLoadingProjects}
              projects={projects}
              selectedProjectPath={selectedProjectPath}
              setSelectedProjectPath={setSelectedProjectPath}
              selectedProject={selectedProject}
              projectFiles={projectFiles}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              errorMessage={errorMessage}
            />
          ) : null}

          {activeView === "tasks" ? <TasksPanel /> : null}
          {activeView === "agents" ? <AgentsPanel /> : null}
          {activeView === "automations" ? <AutomationsPanel /> : null}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function WorkspacePanel(props: {
  isLoadingProjects: boolean;
  projects: FindProjectResponse[];
  selectedProjectPath: string | null;
  setSelectedProjectPath: (projectPath: string) => void;
  selectedProject: FindProjectResponse | null;
  projectFiles: string[];
  selectedFile: string | null;
  setSelectedFile: (filePath: string) => void;
  errorMessage: string | null;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="min-h-[640px]">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Saved local project folders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {props.isLoadingProjects ? (
            <EmptyState label="Loading projects..." />
          ) : null}

          {!props.isLoadingProjects && props.projects.length === 0 ? (
            <EmptyState label="No projects yet. Use Add Project in the sidebar." />
          ) : null}

          <div className="max-h-[520px] space-y-2 overflow-auto pr-2">
            {props.projects.map((project) => {
              const isSelected = project.folderPath === props.selectedProjectPath;

              return (
                <button
                  key={project.folderPath}
                  type="button"
                  className={[
                    "w-full rounded-md border p-3 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-secondary/60"
                      : "hover:bg-accent",
                  ].join(" ")}
                  onClick={() => {
                    props.setSelectedProjectPath(project.folderPath);
                  }}
                >
                  <div className="truncate text-sm font-medium">{project.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {project.folderPath}
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline">{formatTimestamp(project.createdAt)}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[640px]">
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>
            {props.selectedProject
              ? `${props.selectedProject.name} (${props.selectedProject.folderPath})`
              : "Select a project to browse files."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!props.selectedProject ? (
            <EmptyState label="No project selected." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
              <div className="space-y-3">
                <div className="text-xs font-medium uppercase text-muted-foreground">
                  Project Files
                </div>
                <Separator />
                <div className="max-h-[500px] overflow-auto pr-2">
                  <div className="space-y-1">
                    {props.projectFiles.map((relativeFilePath) => (
                      <button
                        key={relativeFilePath}
                        type="button"
                        className={[
                          "w-full rounded px-2 py-1.5 text-left font-mono text-xs transition-colors",
                          props.selectedFile === relativeFilePath
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent",
                        ].join(" ")}
                        onClick={() => props.setSelectedFile(relativeFilePath)}
                      >
                        {relativeFilePath}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    File Preview
                  </div>
                  {props.selectedFile ? (
                    <Badge variant="secondary" className="font-mono">
                      {props.selectedFile}
                    </Badge>
                  ) : null}
                </div>
                <Separator />
              </div>
            </div>
          )}

          {props.errorMessage ? (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {props.errorMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function TasksPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {mockedTaskColumns.map((column) => (
        <Card key={column.label}>
          <CardHeader>
            <CardTitle className="text-base">{column.label}</CardTitle>
            <CardDescription>Task count in this status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{column.value}</div>
          </CardContent>
        </Card>
      ))}
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

function EmptyState(props: { label: string }) {
  return <div className="text-sm text-muted-foreground">{props.label}</div>;
}

function getViewTitle(view: SidebarView): string {
  if (view === "workspace") {
    return "Workspace";
  }

  if (view === "tasks") {
    return "Tasks";
  }

  if (view === "agents") {
    return "Agents";
  }

  return "Automations";
}

function getViewDescription(view: SidebarView): string {
  if (view === "workspace") {
    return "Git-native project folders and file previews.";
  }

  if (view === "tasks") {
    return "Markdown-first lifecycle tracking for coding specs.";
  }

  if (view === "agents") {
    return "Abstracted provider runtimes for task execution.";
  }

  return "Cron-like and manual triggers for repository maintenance.";
}

function formatTimestamp(isoTimestamp: string): string {
  const parsedDate = new Date(isoTimestamp);

  if (Number.isNaN(parsedDate.getTime())) {
    return isoTimestamp;
  }

  return parsedDate.toLocaleString();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown error";
}
