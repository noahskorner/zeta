import { Settings } from "lucide-react";
import { SidebarFooter } from "../components/ui/sidebar";

export function AvatarFooter() {
  return (
    <SidebarFooter>
      <div className="flex items-center gap-2 rounded-md border p-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
          NK
        </div>
        <div className="min-w-0 group-data-[collapsible=icon]:hidden">
          <div className="truncate text-sm font-medium">Noah Korner</div>
          <div className="truncate text-xs text-muted-foreground">Workspace owner</div>
        </div>
        <button
          type="button"
          className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
          aria-label="Open settings"
        >
          <Settings className="size-4" />
        </button>
      </div>
    </SidebarFooter>
  );
}
