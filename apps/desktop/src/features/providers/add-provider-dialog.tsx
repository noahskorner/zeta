import { zodResolver } from '@hookform/resolvers/zod';
import type { AddProviderResponse } from '@zeta/commands';
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

const addProviderSchema = z.object({
  id: z.string().trim().min(2, 'Provider id is required.'),
  provider: z.string().trim().min(2, 'Provider name is required.'),
  defaultModel: z.string().trim().min(1, 'Default model is required.'),
  apiKey: z.string().trim().min(8, 'API key must be at least 8 characters.'),
  baseUrl: z.string().trim().optional(),
  organization: z.string().trim().optional(),
  project: z.string().trim().optional(),
  passphrase: z.string().trim().optional(),
});

type AddProviderValues = z.infer<typeof addProviderSchema>;

type AddProviderDialogProps = {
  onProviderCreated: (provider: AddProviderResponse) => void;
  onError: (message: string) => void;
};

export function AddProviderDialog(props: AddProviderDialogProps) {
  const [open, setOpen] = useState(false);

  // Keep form state and validation colocated in the dialog.
  const form = useForm<AddProviderValues>({
    resolver: zodResolver(addProviderSchema),
    defaultValues: {
      id: '',
      provider: '',
      defaultModel: '',
      apiKey: '',
      baseUrl: '',
      organization: '',
      project: '',
      passphrase: '',
    },
  });

  const isSubmitting = useMemo(() => form.formState.isSubmitting, [form.formState.isSubmitting]);

  // Submit provider creation through the desktop bridge API.
  async function handleSubmit(values: AddProviderValues) {
    try {
      const createdProvider = await window.zetaApi.addProvider({
        id: values.id,
        provider: values.provider,
        defaultModel: values.defaultModel,
        apiKey: values.apiKey,
        baseUrl: values.baseUrl || undefined,
        organization: values.organization || undefined,
        project: values.project || undefined,
        passphrase: values.passphrase || undefined,
      });

      setOpen(false);
      form.reset();
      props.onProviderCreated(createdProvider);
    } catch (error) {
      const message = getErrorMessage(error);
      form.setError('root', { message });
      props.onError(message);
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
        <Button type="button">Add provider</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Provider</DialogTitle>
          <DialogDescription>
            Configure a model provider and persist encrypted credentials.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onKeyDown={handleFormKeyDown}
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {/* Capture provider identity used by provider metadata and secret records. */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider ID</FormLabel>
                    <FormControl>
                      <Input placeholder="openai-primary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Name</FormLabel>
                    <FormControl>
                      <Input placeholder="openai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Capture required runtime defaults used by model selection logic. */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="defaultModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Model</FormLabel>
                    <FormControl>
                      <Input placeholder="gpt-4.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="sk-..." autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Capture optional API and account routing metadata. */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://api.openai.com/v1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="org_..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Capture optional project scoping and AES fallback passphrase. */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="proj_..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passphrase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passphrase (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="off"
                        placeholder="Used if DPAPI is unavailable"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.formState.errors.root?.message ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            ) : null}

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Provider'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}
