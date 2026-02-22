import type { FindProjectResponse } from '@zeta/commands';
import { Separator } from '../components/ui/separator';
import { SidebarTrigger } from '../components/ui/sidebar';
import { ProjectDropdown } from './projects/project-dropdown';

type AppHeaderProps = {
  projects: FindProjectResponse[];
  selectedProjectId: string | null;
  isLoadingProjects: boolean;
  onSelectProject: (projectId: string) => void;
};

export function AppHeader({
  projects,
  selectedProjectId,
  isLoadingProjects,
  onSelectProject,
}: AppHeaderProps) {
  return (
    <header className="fixed top-8 w-full z-10 flex h-12 items-center border-b bg-background pl-4">
      {/* Header controls */}
      <div className="flex items-center gap-3 [-webkit-app-region:no-drag]">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <ProjectDropdown
          projects={projects}
          selectedProjectId={selectedProjectId}
          isLoadingProjects={isLoadingProjects}
          onSelectProject={onSelectProject}
        />
      </div>
    </header>
  );
}
