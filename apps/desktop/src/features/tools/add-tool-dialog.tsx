import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';

const addToolSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  exec: z.string().trim().min(1, 'Executable is required.'),
  args: z.string().optional(),
  interactive: z.boolean(),
});

type AddToolValues = z.infer<typeof addToolSchema>;

type AddToolDialogProps = {
  onToolCreated: (toolId: string) => void;
};

export function AddToolDialog(props: AddToolDialogProps) {
  const [open, setOpen] = useState(false);

  // Keep form state and validation colocated in the dialog.
  const form = useForm<AddToolValues>({
    resolver: zodResolver(addToolSchema),
    defaultValues: {
      name: '',
      exec: '',
      args: '',
      interactive: true,
    },
  });

  const isSubmitting = useMemo(() => form.formState.isSubmitting, [form.formState.isSubmitting]);

  // Submit tool creation request through the desktop bridge API.
  async function handleSubmit(values: AddToolValues) {
    const parsedArgs = parseArgs(values.args);

    try {
      const createdTool = await window.zetaApi.addTool({
        name: values.name,
        exec: values.exec,
        args: parsedArgs.length > 0 ? parsedArgs : undefined,
        interactive: values.interactive,
      });

      setOpen(false);
      form.reset();
      props.onToolCreated(createdTool.id);
    } catch (error) {
      form.setError('root', { message: getErrorMessage(error) });
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
        <Button type="button">Add tool</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Tool</DialogTitle>
          <DialogDescription>Save a runnable executable to your tool registry.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onKeyDown={handleFormKeyDown}
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {/* Capture the display name used across tool-related workflows. */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Claude" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capture the portable executable name used to launch the tool. */}
            <FormField
              control={form.control}
              name="exec"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Executable</FormLabel>
                  <FormControl>
                    <Input placeholder="claude" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capture optional tool arguments as comma or newline-separated values. */}
            <FormField
              control={form.control}
              name="args"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Args (optional)</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder={'--model,sonnet-4.5\n--verbose'}
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Let users choose PTY interaction vs non-interactive process mode. */}
            <FormField
              control={form.control}
              name="interactive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Interactive</FormLabel>
                    <div className="text-xs text-muted-foreground">
                      Enable terminal interaction (PTY) for this tool.
                    </div>
                  </div>
                  <FormControl>
                    <input
                      checked={field.value}
                      type="checkbox"
                      className="h-4 w-4"
                      onChange={(event) => field.onChange(event.currentTarget.checked)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.formState.errors.root?.message ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            ) : null}

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Tool'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function parseArgs(rawArgs: string | undefined): string[] {
  if (!rawArgs) {
    return [];
  }

  return rawArgs
    .split(/[\n,]/g)
    .map((arg) => arg.trim())
    .filter((arg) => arg.length > 0);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}
