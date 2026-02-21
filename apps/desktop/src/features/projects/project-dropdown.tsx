import { FindProjectResponse } from "@zeta/commands";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

type ProjectDropdownProps = {
  projects: FindProjectResponse[];
  selectedProjectId: string | null;
  isLoadingProjects: boolean;
  onSelectProject: (projectId: string) => void;
};

export function ProjectDropdown(props: ProjectDropdownProps) {
  const hasProjects = props.projects.length > 0;
  const selectedValue =
    props.selectedProjectId && hasProjects
      ? props.selectedProjectId
      : hasProjects
        ? props.projects[0].id
        : "";

  return (
    <div className="min-w-[280px] max-w-[480px]">
      {/* Render the active project selector in the app header. */}
      <Select
        value={hasProjects ? selectedValue : undefined}
        disabled={props.isLoadingProjects || !hasProjects}
        onValueChange={props.onSelectProject}
      >
        <SelectTrigger className="h-10 w-full">
          <SelectValue
            placeholder={props.isLoadingProjects ? "Loading projects..." : "No projects available"}
          />
        </SelectTrigger>
        <SelectContent>
          {props.projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
