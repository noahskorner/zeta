import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { SidebarProvider } from '../../../components/ui/sidebar';
import { TaskForm } from './task-form';
import { TaskSidebar } from './task-sidebar';

type TaskDialogProps = {
  children: React.ReactNode;
  projectId: string;
  taskId: string;
  title: string;
  slug: string;
  description: string;
  onUpdate: () => void;
  onError: (message: string) => void;
};

export function TaskDialog(props: TaskDialogProps) {
  const [open, setOpen] = useState(false);

  const handleTaskUpdated = () => {
    props.onUpdate();
  };

  const handleError = (message: string) => {
    props.onError(message);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <SidebarProvider
        className="h-full min-h-0"
        style={
          {
            '--sidebar-width': '40rem',
          } as React.CSSProperties
        }
      >
        <DialogContent
          showCloseButton={false}
          className={[
            // Fill available window body space without center-transform clipping.
            'inset-x-4',
            'bottom-4',
            'top-10',
            'translate-x-0',
            'translate-y-0',
            // Almost full screen.
            'max-w-none',
            'w-auto',
            'h-auto',
            'min-h-0',
            'flex',
            'flex-col',
            'p-0',
            'gap-0',
            'sm:rounded-lg',
            'overflow-hidden',
          ].join(' ')}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{props.title}</DialogTitle>
            <DialogDescription>{props.slug}</DialogDescription>
          </DialogHeader>
          <TaskForm
            taskId={props.taskId}
            projectId={props.projectId}
            actions={undefined}
            slug={props.slug}
            title={props.title}
            description={props.description}
            onUpdate={handleTaskUpdated}
            onError={handleError}
          />
          <TaskSidebar />
        </DialogContent>
      </SidebarProvider>
    </Dialog>
  );
}
