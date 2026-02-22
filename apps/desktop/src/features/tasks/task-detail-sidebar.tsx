import * as React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '../../components/ui/sidebar';
import { Separator } from '../../components/ui/separator';
import { Button } from '../../components/ui/button';

export type TaskDetailSidebarProps = {
  actions?: React.ReactNode;
};

export function TaskDetailSidebar({ actions }: TaskDetailSidebarProps) {
  return (
    <Sidebar side="right" collapsible="offcanvas" className="h-full">
      <SidebarHeader className="border-b h-12 flex items-center justify-center">
        <div className="w-full flex items-center justify-end">
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="text-sm">In Progress</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Assignee</div>
            <div className="text-sm">—</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Due</div>
            <div className="text-sm">—</div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Notes</div>
            <div className="text-sm text-muted-foreground">
              Put quick actions, metadata, links, or commands here.
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <Button className="w-full" variant="secondary">
          Secondary action
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
