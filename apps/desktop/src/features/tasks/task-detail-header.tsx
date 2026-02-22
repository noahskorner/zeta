import { SidebarTrigger } from '../../components/ui/sidebar';
import { cn } from '../../lib/utils';

export type TaskDetailHeaderProps = {
  title: string;
  actions?: React.ReactNode;
  className?: string;
};

export function TaskDetailHeader({ title, actions: actions, className }: TaskDetailHeaderProps) {
  return (
    <div className={cn('flex h-12 items-center gap-2 border-b px-3 w-full', className)}>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
      </div>

      {/* SidebarTrigger all the way on the right */}
      <SidebarTrigger className="ml-1" />

      {/* Optional additional actions (e.g., close button) */}
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
