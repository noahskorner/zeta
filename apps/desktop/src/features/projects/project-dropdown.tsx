import { FindProjectResponse } from "@zeta/commands";

type ProjectDropdownProps = {
  projects: FindProjectResponse[];
  selectedProjectPath: string | null;
  isLoadingProjects: boolean;
  onSelectProject: (projectPath: string) => void;
};

export function ProjectDropdown(props: ProjectDropdownProps) {
  const hasProjects = props.projects.length > 0;
  const selectedValue =
    props.selectedProjectPath && hasProjects
      ? props.selectedProjectPath
      : hasProjects
        ? props.projects[0].folderPath
        : "";

  return (
    <div className="ml-auto min-w-[280px] max-w-[480px]">
      {/* Render the active project selector in the app header. */}
      <select
        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
        value={selectedValue}
        disabled={props.isLoadingProjects || !hasProjects}
        onChange={(event) => {
          props.onSelectProject(event.target.value);
        }}
      >
        {!hasProjects ? (
          <option value="">
            {props.isLoadingProjects ? "Loading projects..." : "No projects available"}
          </option>
        ) : null}
        {props.projects.map((project) => (
          <option key={project.folderPath} value={project.folderPath}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
}
