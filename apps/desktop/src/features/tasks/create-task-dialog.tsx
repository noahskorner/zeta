import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';

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

    event.preventDefault();
    event.currentTarget.requestSubmit();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" disabled={!hasProject}>
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Create a task and provision a matching git worktree.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onKeyDown={handleFormKeyDown}
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {/* Capture git-safe task and branch/worktree identity. */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="feat-add-create-task" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capture human-readable task summary. */}
            <FormField
              control={form.control}
              name="friendlyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Friendly Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Add ability to create a task" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capture task details used by agents and operators. */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder="Describe the scope and acceptance criteria."
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-32 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting || !hasProject}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
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
