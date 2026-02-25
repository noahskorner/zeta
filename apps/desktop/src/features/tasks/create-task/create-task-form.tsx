import { KeyboardEvent } from 'react';
import { z } from 'zod';
import { isValidSlug } from '../is-valid-slug';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '../../../components/ui/form';
import { getErrorMessage } from '../../../lib/get-error-message';
import { CreateTaskHeader } from './create-task-header';
import { MarkdownEditor } from '../../../components/markdown-editor/markdown-editor';

const CreateTaskSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required.')
    .refine((value) => isValidSlug(value), 'Slug must be a valid git branch/worktree name.'),
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
});

type CreateTaskRequest = z.infer<typeof CreateTaskSchema>;

type CreateTaskFormProps = {
  selectedProjectId: string;
  actions: React.ReactNode;
  onCreate?: (taskId: string) => void;
  onError?: (message: string) => void;
};

export function CreateTaskForm(props: CreateTaskFormProps) {
  // Define the form state
  const form = useForm<CreateTaskRequest>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      slug: '',
      title: '',
      description: '## Goal\n\n## Requirements\n\n## Acceptance Criteria',
    },
  });
  const slugValue = form.watch('slug');
  const titleValue = form.watch('title');
  const descriptionValue = form.watch('description');

  // Handle title change
  const handleTitleChange = (title: string) => {
    form.setValue('title', title);
  };

  // Handle slug change
  const handleSlugChange = (slug: string) => {
    form.setValue('slug', slug);
  };

  // Handle description change
  const handleDescriptionChange = (description: string) => {
    form.setValue('description', description);
  };

  // Handle form submission
  const handleSubmit = async (values: CreateTaskRequest) => {
    if (!props.selectedProjectId) {
      form.setError('root', { message: 'Select a project before creating a task.' });
      return;
    }

    try {
      const taskId = await window.zetaApi.addTask({
        projectId: props.selectedProjectId,
        slug: values.slug,
        title: values.title,
        description: values.description,
      });

      form.reset();
      props.onCreate?.(taskId);
    } catch (error) {
      props.onError?.(getErrorMessage(error));
    }
  };

  // Submit form on enter
  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
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
  };

  return (
    <Form {...form}>
      <form
        className="h-full min-h-0"
        onKeyDown={handleFormKeyDown}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <CreateTaskHeader
            title={titleValue}
            slug={slugValue}
            onSlugChange={handleSlugChange}
            onTitleChange={handleTitleChange}
            actions={props.actions}
          />

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="mx-auto w-full max-w-4xl space-y-4">
              <div className="space-y-2 p-4">
                <MarkdownEditor
                  content={descriptionValue}
                  onContentChange={handleDescriptionChange}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
