import {
  Bot,
  Clock3,
  FilePenLine,
  GitBranch,
  Hammer,
  ListTodo,
  PlugZap,
  PlayCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { type ComponentType } from 'react';
import { AvatarFooter } from './avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '../components/ui/sidebar';

export type SidebarView =
  | 'tasks'
  | 'tools'
  | 'adapters'
  | 'providers'
  | 'recipes'
  | 'schedules'
  | 'markdownEditor';

type AppSidebarProps = {
  activeView: SidebarView;
  setActiveView: (view: SidebarView) => void;
  isAddingProject: boolean;
  onAddProject: () => void;
  onRefreshProjects: () => void;
};

export function AppSidebar(props: AppSidebarProps) {
  // Define navigation metadata in one place for consistent sidebar rendering.
  const sidebarItems: Array<{
    view: SidebarView;
    label: string;
    icon: ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    {
      view: 'schedules',
      label: 'Schedules',
      icon: Clock3,
      badge: '3',
    },
    { view: 'tasks', label: 'Tasks', icon: ListTodo, badge: '14' },
    { view: 'tools', label: 'Tools', icon: Hammer },
    { view: 'adapters', label: 'Adapters', icon: GitBranch },
    { view: 'recipes', label: 'Recipes', icon: Bot, badge: '3' },
    { view: 'providers', label: 'Providers', icon: PlugZap },
    { view: 'markdownEditor', label: 'Markdown', icon: FilePenLine },
  ];

  return (
    <Sidebar collapsible="icon" className="h-[calc(100%-2rem)] top-auto">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 rounded-md border p-2">
          {/* Hide branding text when the sidebar is collapsed to icon mode. */}
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="text-sm font-semibold">Zeta</div>
            <div className="truncate text-xs text-muted-foreground">Agentic task manager</div>
          </div>
          <Sparkles className="size-4 text-muted-foreground shrink-0" />
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton
                    isActive={props.activeView === item.view}
                    onClick={() => props.setActiveView(item.view)}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={props.onAddProject}>
                  <GitBranch className="size-4" />
                  <span>{props.isAddingProject ? 'Adding...' : 'Add Project'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={props.onRefreshProjects}>
                  <RefreshCw className="size-4" />
                  <span>Refresh Projects</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <PlayCircle className="size-4" />
                  <span>Start Next Ready Task</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="mx-0" />
      <AvatarFooter />

      <SidebarRail />
    </Sidebar>
  );
}
