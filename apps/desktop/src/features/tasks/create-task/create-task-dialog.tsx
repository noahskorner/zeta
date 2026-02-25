import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { CreateTaskForm } from './create-task-form';
import { Button } from '../../../components/ui/button';
import { X } from 'lucide-react';

type CreateTaskDialogProps = {
  selectedProjectId: string;
  onTaskCreated: (taskId: string) => void;
  onError: (message: string) => void;
};

export function CreateTaskDialog(props: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);

  const handleCloseClicked = () => {
    setOpen(false);
  };

  const handleTaskCreated = (taskId: string) => {
    setOpen(false);
    props.onTaskCreated(taskId);
  };

  const handleError = (message: string) => {
    props.onError(message);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Task</Button>
      </DialogTrigger>

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
          <DialogTitle>Add new task</DialogTitle>
          <DialogDescription>Add a new task to the selected project.</DialogDescription>
        </DialogHeader>

        <CreateTaskForm
          selectedProjectId={props.selectedProjectId}
          onCreate={handleTaskCreated}
          onError={handleError}
          actions={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close"
              onClick={handleCloseClicked}
            >
              <X className="h-4 w-4" />
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
