import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '../../../components/ui/sidebar';

type TaskSidebarProps = {
  actions?: React.ReactNode;
};

export function TaskSidebar(props: TaskSidebarProps) {
  return (
    <Sidebar side="right" collapsible="offcanvas" className="h-full">
      <SidebarHeader className="border-b h-12 flex items-center justify-center">
        <div className="w-full flex items-center justify-end">
          {props.actions && <div className="flex items-center gap-2">{props.actions}</div>}
        </div>
      </SidebarHeader>
      <SidebarContent className="p-3">Content</SidebarContent>
      <SidebarFooter className="border-t p-3">Footer</SidebarFooter>
    </Sidebar>
  );
}
