import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function App() {
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [selectedProjectPath, setSelectedProjectPath] = useState<string | null>(null);
  const [projectFiles, setProjectFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<ProjectFileContent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingFileContent, setIsLoadingFileContent] = useState(false);

  const selectedProject = useMemo(() => {
    if (!selectedProjectPath) {
      return null;
    }

    return projects.find((project) => project.folderPath === selectedProjectPath) ?? null;
  }, [projects, selectedProjectPath]);

  useEffect(() => {
    void loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectPath) {
      setProjectFiles([]);
      setSelectedFile(null);
      setFileContent(null);
      return;
    }

    void loadProjectFiles(selectedProjectPath);
  }, [selectedProjectPath]);

  useEffect(() => {
    if (!selectedProjectPath || !selectedFile) {
      setFileContent(null);
      return;
    }

    void loadProjectFileContent(selectedProjectPath, selectedFile);
  }, [selectedProjectPath, selectedFile]);

  async function handleAddProject() {
    setErrorMessage(null);
    setIsAddingProject(true);

    try {
      const newProject = await window.zetaApi.addProject();

      if (!newProject) {
        return;
      }

      await loadProjects(newProject.folderPath);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsAddingProject(false);
    }
  }

  async function loadProjects(projectPathToSelect?: string) {
    setIsLoadingProjects(true);

    try {
      const savedProjects = await window.zetaApi.listProjects();
      const sortedProjects = [...savedProjects].sort((first, second) =>
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
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoadingProjects(false);
    }
  }

  async function loadProjectFiles(projectPath: string) {
    setIsLoadingFiles(true);
    setErrorMessage(null);

    try {
      const files = await window.zetaApi.listProjectFiles(projectPath);
      setProjectFiles(files);
      setSelectedFile(files[0] ?? null);
    } catch (error) {
      setProjectFiles([]);
      setSelectedFile(null);
      setFileContent(null);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoadingFiles(false);
    }
  }

  async function loadProjectFileContent(
    projectPath: string,
    relativeFilePath: string,
  ) {
    setIsLoadingFileContent(true);
    setErrorMessage(null);

    try {
      const content = await window.zetaApi.readProjectFile(projectPath, relativeFilePath);
      setFileContent(content);
    } catch (error) {
      setFileContent(null);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoadingFileContent(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-lg font-semibold">Zeta Projects</div>
            <div className="text-xs text-muted-foreground">
              Open a local folder and inspect its files.
            </div>
          </div>
          <Button onClick={handleAddProject} disabled={isAddingProject}>
            {isAddingProject ? "Adding..." : "Add Project"}
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[320px_1fr]">
        <Card className="min-h-[640px]">
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Saved local project folders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingProjects ? <EmptyState label="Loading projects..." /> : null}

            {!isLoadingProjects && projects.length === 0 ? (
              <EmptyState label="No projects yet. Click Add Project to start." />
            ) : null}

            <div className="max-h-[520px] space-y-2 overflow-auto pr-2">
              {projects.map((project) => {
                const isSelected = project.folderPath === selectedProjectPath;

                return (
                  <button
                    key={project.folderPath}
                    type="button"
                    className={[
                      "w-full rounded-md border p-3 text-left transition-colors",
                      isSelected ? "border-primary bg-secondary/60" : "hover:bg-accent",
                    ].join(" ")}
                    onClick={() => {
                      setSelectedProjectPath(project.folderPath);
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
              {selectedProject
                ? `${selectedProject.name} (${selectedProject.folderPath})`
                : "Select a project to browse files."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedProject ? (
              <EmptyState label="No project selected." />
            ) : (
              <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
                <div className="space-y-3">
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    Project Files
                  </div>
                  <Separator />
                  {isLoadingFiles ? <EmptyState label="Loading files..." /> : null}
                  {!isLoadingFiles && projectFiles.length === 0 ? (
                    <EmptyState label="No files found in this project." />
                  ) : null}

                  <div className="max-h-[500px] overflow-auto pr-2">
                    <div className="space-y-1">
                      {projectFiles.map((relativeFilePath) => (
                        <button
                          key={relativeFilePath}
                          type="button"
                          className={[
                            "w-full rounded px-2 py-1.5 text-left font-mono text-xs transition-colors",
                            selectedFile === relativeFilePath
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent",
                          ].join(" ")}
                          onClick={() => setSelectedFile(relativeFilePath)}
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
                    {selectedFile ? (
                      <Badge variant="secondary" className="font-mono">
                        {selectedFile}
                      </Badge>
                    ) : null}
                  </div>
                  <Separator />
                  {!selectedFile ? <EmptyState label="Select a file to view content." /> : null}
                  {selectedFile && isLoadingFileContent ? (
                    <EmptyState label="Loading file content..." />
                  ) : null}
                  {selectedFile && fileContent && fileContent.isBinary ? (
                    <EmptyState label="Binary file content is not shown." />
                  ) : null}
                  {selectedFile && fileContent && !fileContent.isBinary ? (
                    <div className="rounded-md border bg-muted/20 p-3">
                      <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5">
                        {fileContent.content}
                      </pre>
                      {fileContent.truncated ? (
                        <div className="mt-3 text-xs text-muted-foreground">
                          File preview truncated at 200KB.
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {errorMessage ? (
              <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function EmptyState(props: { label: string }) {
  return <div className="text-sm text-muted-foreground">{props.label}</div>;
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
