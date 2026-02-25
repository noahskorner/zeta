import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Form } from '../../components/ui/form';
import { TaskDetail } from './task-detail';
import { TaskDialogLayout } from './task-dialog-layout';

const updateTaskSchema = z.object({
  friendlyName: z.string().trim().min(1, 'Friendly name is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
});

type UpdateTaskValues = z.infer<typeof updateTaskSchema>;

export type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
  taskId?: string;
  taskName?: string;
  title?: string;
  description?: string;
  createdAt?: string;
  onTaskUpdated: (taskId: string) => void;
  onError: (message: string) => void;
  trigger?: React.ReactNode;
};

export function TaskDialog({
  open,
  onOpenChange,
  projectId,
  taskId,
  taskName,
  title = 'Task',
  description,
  createdAt,
  onTaskUpdated,
  onError,
  trigger,
}: TaskDialogProps) {
  // Keep task metadata editing and validation scoped to the detail dialog.
  const form = useForm<UpdateTaskValues>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      friendlyName: title || '',
      description: description || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        friendlyName: title || '',
        description: description || '',
      });
    }
  }, [description, form, open, taskName, title]);

  // Submit task metadata updates through the desktop bridge API.
  async function handleSubmit(values: UpdateTaskValues) {
    if (!projectId) {
      form.setError('root', { message: 'Select a project before updating a task.' });
      return;
    }
    if (!taskId) {
      form.setError('root', { message: 'Task id is required to update this task.' });
      return;
    }

    try {
      await window.zetaApi.updateTask({
        projectId,
        taskId,
        friendlyName: values.friendlyName,
        description: values.description,
      });
      onTaskUpdated(taskId);
      onOpenChange(false);
    } catch (error) {
      onError(getErrorMessage(error));
    }
  }

  // Submit on Enter for standard fields while preserving multiline input behavior.
  function handleFormKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    if (event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Let markdown editor Enter handling work without triggering form submit.
    if (event.target instanceof HTMLElement && event.target.closest('.cm-editor')) {
      return;
    }

    event.preventDefault();
    event.currentTarget.requestSubmit();
  }

  const friendlyNameValue = form.watch('friendlyName');
  const descriptionValue = form.watch('description');

  return (
    <TaskDialogLayout
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          form.reset({
            friendlyName: title || '',
            description: description || '',
          });
        }
      }}
      trigger={trigger}
      title={title}
      description={description}
    >
      <Form {...form}>
        <form
          className="h-full min-h-0"
          onKeyDown={handleFormKeyDown}
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <TaskDetail
            taskId={taskId || ''}
            createdAt={createdAt || ''}
            friendlyName={friendlyNameValue}
            taskName={taskName || ''}
            description={descriptionValue}
            editable
            taskNameEditable={false}
            onFriendlyNameChange={(value) => {
              form.setValue('friendlyName', value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
            onDescriptionChange={(value) => {
              form.setValue('description', value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
            actions={
              <>
                <Button
                  type="submit"
                  size="sm"
                  disabled={form.formState.isSubmitting || !projectId || !taskId}
                >
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Task'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Close"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            }
            friendlyNameError={form.formState.errors.friendlyName?.message}
            descriptionError={form.formState.errors.description?.message}
            footerContent={
              form.formState.errors.root?.message ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              ) : null
            }
          />
        </form>
      </Form>
    </TaskDialogLayout>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}
