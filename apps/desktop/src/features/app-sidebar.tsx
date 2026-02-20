import {
  Bot,
  GitBranch,
  ListTodo,
  PlayCircle,
  RefreshCw,
  Sparkles,
  Workflow,
} from "lucide-react";
import { type ComponentType } from "react";
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
} from "../components/ui/sidebar";

export type SidebarView = "tasks" | "agents" | "automations";

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
    { view: "tasks", label: "Tasks", icon: ListTodo, badge: "14" },
    { view: "agents", label: "Agents", icon: Bot, badge: "3" },
    {
      view: "automations",
      label: "Automations",
      icon: Workflow,
      badge: "3",
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 rounded-md border p-2">
          {/* Hide branding text when the sidebar is collapsed to icon mode. */}
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="text-sm font-semibold">Zeta</div>
            <div className="truncate text-xs text-muted-foreground">
              Agentic task manager
            </div>
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
                  <span>{props.isAddingProject ? "Adding..." : "Add Project"}</span>
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
      <SidebarRail />
    </Sidebar>
  );
}
