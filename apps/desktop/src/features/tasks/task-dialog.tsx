import { X } from 'lucide-react';
import { TaskDetail } from './task-detail';
import { Button } from '../../components/ui/button';
import {
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Dialog,
} from '../../components/ui/dialog';

export type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
};

export function TaskDialog({
  open,
  onOpenChange,
  taskId,
  title = 'Task',
  description,
  trigger,
}: TaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent
        showCloseButton={false}
        className={[
          // Almost full screen
          'max-w-none',
          'w-[calc(100vw-2rem)]',
          'h-[calc(100vh-2rem)]',
          'p-0',
          'gap-0',
          'sm:rounded-lg',
          'overflow-hidden',
        ].join(' ')}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <TaskDetail
          taskId={taskId || ''}
          description={description || ''}
          actions={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
