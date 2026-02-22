import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Form } from '../../components/ui/form';
import { TaskDetail } from './task-detail';
import { TaskDialogLayout } from './task-dialog-layout';

const createTaskSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Task name is required.')
    .refine(
      (value) => isValidTaskName(value),
      'Task name must be a valid git branch/worktree name.',
    ),
  friendlyName: z.string().trim().min(1, 'Friendly name is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
});

type CreateTaskValues = z.infer<typeof createTaskSchema>;

type CreateTaskDialogProps = {
  selectedProjectPath: string | null;
  onTaskCreated: (taskId: string) => void;
  onError: (message: string) => void;
};

export function CreateTaskDialog(props: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);

  // Disable task creation until a project has been selected.
  const hasProject = useMemo(() => Boolean(props.selectedProjectPath), [props.selectedProjectPath]);

  // Keep form state and validation colocated in the dialog.
  const form = useForm<CreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: '',
      friendlyName: '',
      description: '',
    },
  });

  // Submit task creation request through the desktop bridge API.
  async function handleSubmit(values: CreateTaskValues) {
    if (!props.selectedProjectPath) {
      form.setError('root', { message: 'Select a project before creating a task.' });
      return;
    }

    try {
      const taskId = await window.zetaApi.addTask({
        projectPath: props.selectedProjectPath,
        name: values.name,
        friendlyName: values.friendlyName,
        description: values.description,
      });

      setOpen(false);
      form.reset();
      props.onTaskCreated(taskId);
    } catch (error) {
      props.onError(getErrorMessage(error));
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
  const taskNameValue = form.watch('name');
  const descriptionValue = form.watch('description');

  return (
    <TaskDialogLayout
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset();
        }
      }}
      title="Create Task"
      description="Create a task and provision a matching git worktree."
      trigger={
        <Button type="button" disabled={!hasProject}>
          Create Task
        </Button>
      }
    >
      <Form {...form}>
        <form
          className="h-full min-h-0"
          onKeyDown={handleFormKeyDown}
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <TaskDetail
            friendlyName={friendlyNameValue}
            taskName={taskNameValue}
            description={descriptionValue}
            editable
            friendlyNamePlaceholder="Create new task"
            taskNamePlaceholder="feat-add-create-task"
            onFriendlyNameChange={(value) => {
              form.setValue('friendlyName', value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
            onTaskNameChange={(value) => {
              form.setValue('name', value, {
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
                  disabled={form.formState.isSubmitting || !hasProject}
                >
                  {form.formState.isSubmitting ? 'Creating...' : 'Create Task'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            }
            friendlyNameError={form.formState.errors.friendlyName?.message}
            taskNameError={form.formState.errors.name?.message}
            descriptionError={form.formState.errors.description?.message}
            footerContent={
              <>
                {form.formState.errors.root?.message ? (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </div>
                ) : null}

                {!hasProject ? (
                  <div className="rounded-md border p-2 text-sm text-muted-foreground">
                    Select a project before creating a task.
                  </div>
                ) : null}
              </>
            }
          />
        </form>
      </Form>
    </TaskDialogLayout>
  );
}

function isValidTaskName(name: string): boolean {
  if (name.includes('..')) {
    return false;
  }
  if (name.endsWith('/') || name.startsWith('/') || name.startsWith('-')) {
    return false;
  }
  if (name.includes('@{') || name.endsWith('.lock')) {
    return false;
  }

  return /^[A-Za-z0-9._/-]+$/.test(name);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}
