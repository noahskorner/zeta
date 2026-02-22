import { X } from 'lucide-react';
import { TaskDetail } from './task-detail';
import { TaskDialogLayout } from './task-dialog-layout';
import { Button } from '../../components/ui/button';

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
    <TaskDialogLayout
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={title}
      description={description}
    >
      <TaskDetail
        friendlyName={title || ''}
        taskName={taskId || ''}
        description={description || ''}
        editable={false}
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
    </TaskDialogLayout>
  );
}
