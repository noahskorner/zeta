import type { FindProjectResponse } from '@zeta/commands';
import { Copy, Minus, Square, X } from 'lucide-react';
import { Separator } from '../components/ui/separator';
import { SidebarTrigger } from '../components/ui/sidebar';
import { ProjectDropdown } from './projects/project-dropdown';

type AppHeaderProps = {
  projects: FindProjectResponse[];
  selectedProjectId: string | null;
  isLoadingProjects: boolean;
  isWindowMaximized: boolean;
  onSelectProject: (projectId: string) => void;
  onMinimizeWindow: () => Promise<void>;
  onToggleMaximizeWindow: () => Promise<void>;
  onCloseWindow: () => Promise<void>;
};

export function AppHeader({
  projects,
  selectedProjectId,
  isLoadingProjects,
  isWindowMaximized,
  onSelectProject,
  onMinimizeWindow,
  onToggleMaximizeWindow,
  onCloseWindow,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-10 items-center justify-between border-b bg-background pl-4 [-webkit-app-region:drag]">
      {/* Left side controls */}
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

      {/* Right side controls */}
      <div className="h-full flex gap-2 items-center [-webkit-app-region:no-drag]">
        <div className="flex h-full">
          <button
            className="h-full hover:bg-accent w-12 flex items-center justify-center"
            aria-label="Minimize window"
            onClick={() => void onMinimizeWindow()}
          >
            <Minus className="size-4" />
          </button>
          <button
            className="h-full hover:bg-accent w-12 flex items-center justify-center"
            aria-label={isWindowMaximized ? 'Restore window' : 'Maximize window'}
            onClick={() => void onToggleMaximizeWindow()}
          >
            {isWindowMaximized ? <Copy className="size-4" /> : <Square className="size-4" />}
          </button>
          <button
            className="h-full hover:bg-destructive w-12 flex items-center justify-center"
            aria-label="Close window"
            onClick={() => void onCloseWindow()}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
