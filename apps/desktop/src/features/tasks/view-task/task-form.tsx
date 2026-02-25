import { KeyboardEvent } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '../../../components/ui/form';
import { getErrorMessage } from '../../../lib/get-error-message';
import { MarkdownEditor } from '../../../components/markdown-editor/markdown-editor';
import { TaskHeader } from './task-header';

const UpdateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
});

type UpdateTaskRequest = z.infer<typeof UpdateTaskSchema>;

type TaskFormProps = {
  taskId: string;
  projectId: string;
  slug: string;
  title: string;
  description: string;
  actions: React.ReactNode;
  onUpdate: () => void;
  onError: (message: string) => void;
};

export function TaskForm(props: TaskFormProps) {
  // Define the form state
  const form = useForm<UpdateTaskRequest>({
    resolver: zodResolver(UpdateTaskSchema),
    defaultValues: {
      title: props.title,
      description: props.description,
    },
  });
  const titleValue = form.watch('title');
  const descriptionValue = form.watch('description');

  // Handle title change
  const handleTitleChange = (title: string) => {
    form.setValue('title', title);
  };

  // Handle description change
  const handleDescriptionChange = (description: string) => {
    form.setValue('description', description);
  };

  // Handle form submission
  const handleSubmit = async (values: UpdateTaskRequest) => {
    if (!props.projectId) {
      form.setError('root', { message: 'Select a project before creating a task.' });
      return;
    }

    try {
      await window.zetaApi.updateTask({
        projectId: props.projectId,
        taskId: props.taskId,
        title: values.title,
        description: values.description,
      });

      form.reset();
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
          <TaskHeader title={titleValue} slug={props.slug} onTitleChange={handleTitleChange} />
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
