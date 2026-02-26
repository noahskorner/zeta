import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, type KeyboardEvent } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
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

const toolArgValueSchema = z.object({
  type: z.enum(['literal', 'template']),
  value: z.string().trim().min(1, 'Value is required.'),
});

const toolArgSchema = z.discriminatedUnion('t', [
  z.object({
    t: z.literal('literal'),
    v: z.string().trim().min(1, 'Literal value is required.'),
  }),
  z.object({
    t: z.literal('template'),
    v: z.string().trim().min(1, 'Template value is required.'),
  }),
  z.object({
    t: z.literal('flag'),
    name: z.string().trim().min(1, 'Flag name is required.'),
  }),
  z.object({
    t: z.literal('param'),
    name: z.string().trim().min(1, 'Param name is required.'),
    value: toolArgValueSchema,
  }),
]);

const addToolSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  exec: z.string().trim().min(1, 'Executable is required.'),
  args: z.array(toolArgSchema),
  interactive: z.boolean(),
});

type AddToolValues = z.infer<typeof addToolSchema>;
type AddToolArg = AddToolValues['args'][number];
type AddToolArgType = AddToolArg['t'];

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
      args: [],
      interactive: true,
    },
  });

  // Keep argument rows synced with react-hook-form.
  const argFields = useFieldArray({
    control: form.control,
    name: 'args',
  });

  const isSubmitting = useMemo(() => form.formState.isSubmitting, [form.formState.isSubmitting]);
  const watchedArgs = form.watch('args');

  // Submit tool creation request through the desktop bridge API.
  async function handleSubmit(values: AddToolValues) {
    try {
      const createdTool = await window.zetaApi.addTool({
        name: values.name,
        exec: values.exec,
        args: values.args.length > 0 ? values.args : undefined,
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

  // Allow users to switch row type while resetting stale fields.
  function changeArgType(index: number, nextType: AddToolArgType): void {
    argFields.update(index, createArgByType(nextType));
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

            {/* Build structured arguments with row-level typing. */}
            <div className="space-y-2 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel>Arguments (optional)</FormLabel>
                  <div className="text-xs text-muted-foreground">
                    Add literals, templates, flags, and params as structured rows.
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => argFields.append(createArgByType('literal'))}
                >
                  Add argument
                </Button>
              </div>

              {argFields.fields.length === 0 ? (
                <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                  No arguments configured.
                </div>
              ) : null}

              {argFields.fields.map((field, index) => {
                const currentArg = watchedArgs[index];
                if (!currentArg) {
                  return null;
                }

                return (
                  <div key={field.id} className="space-y-2 rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm font-medium">Argument {index + 1}</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={currentArg.t}
                          className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                          onChange={(event) => changeArgType(index, event.target.value as AddToolArgType)}
                        >
                          <option value="literal">literal</option>
                          <option value="template">template</option>
                          <option value="flag">flag</option>
                          <option value="param">param</option>
                        </select>
                        <Button type="button" variant="ghost" onClick={() => argFields.remove(index)}>
                          Remove
                        </Button>
                      </div>
                    </div>

                    {currentArg.t === 'literal' || currentArg.t === 'template' ? (
                      <FormField
                        control={form.control}
                        name={`args.${index}.v`}
                        render={({ field: valueField }) => (
                          <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={currentArg.t === 'template' ? '{{prompt}}' : 'exec'}
                                {...valueField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : null}

                    {currentArg.t === 'flag' ? (
                      <FormField
                        control={form.control}
                        name={`args.${index}.name`}
                        render={({ field: nameField }) => (
                          <FormItem>
                            <FormLabel>Flag name</FormLabel>
                            <FormControl>
                              <Input placeholder="--verbose" {...nameField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : null}

                    {currentArg.t === 'param' ? (
                      <div className="grid gap-2 md:grid-cols-[1fr_180px_1fr]">
                        <FormField
                          control={form.control}
                          name={`args.${index}.name`}
                          render={({ field: nameField }) => (
                            <FormItem>
                              <FormLabel>Param name</FormLabel>
                              <FormControl>
                                <Input placeholder="--model" {...nameField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`args.${index}.value.type`}
                          render={({ field: valueTypeField }) => (
                            <FormItem>
                              <FormLabel>Value type</FormLabel>
                              <FormControl>
                                <select
                                  value={valueTypeField.value}
                                  className="border-input bg-background h-10 rounded-md border px-2 text-sm"
                                  onChange={(event) => valueTypeField.onChange(event.target.value)}
                                >
                                  <option value="literal">literal</option>
                                  <option value="template">template</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`args.${index}.value.value`}
                          render={({ field: valueField }) => (
                            <FormItem>
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input placeholder="{{model}}" {...valueField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

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

function createArgByType(type: AddToolArgType): AddToolArg {
  if (type === 'literal') {
    return { t: 'literal', v: '' };
  }

  if (type === 'template') {
    return { t: 'template', v: '' };
  }

  if (type === 'flag') {
    return { t: 'flag', name: '' };
  }

  return {
    t: 'param',
    name: '',
    value: {
      type: 'literal',
      value: '',
    },
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}
