import * as React from 'react';
import { SidebarProvider, useSidebar } from '../../components/ui/sidebar';
import { TaskDetailHeader } from './task-detail-header';
import { TaskDetailSidebar } from './task-detail-sidebar';
import { MarkdownEditor } from '../../components/markdown-editor/markdown-editor';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';

export type TaskDetailProps = {
  taskId?: string;
  createdAt?: string;
  slug: string;
  title: string;
  description: string;
  onSlugChange?: (slug: string) => void;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
  titlePlaceholder?: string;
  slugPlaceholder?: string;
  editable?: boolean;
  slugEditable?: boolean;
  slugError?: string;
  titleError?: string;
  descriptionError?: string;
  footerContent?: React.ReactNode;
  actions?: React.ReactNode;
  defaultSidebarOpen?: boolean;
};

export function TaskDetail({
  taskId,
  slug,
  title,
  description,
  createdAt,
  onSlugChange,
  onTitleChange,
  onDescriptionChange,
  titlePlaceholder = 'Task title',
  slugPlaceholder = 'task-worktree-name',
  editable = false,
  slugEditable = false,
  slugError,
  titleError,
  descriptionError,
  footerContent,
  actions,
  defaultSidebarOpen = true,
}: TaskDetailProps) {
  return (
    <SidebarProvider
      defaultOpen={defaultSidebarOpen}
      className="h-full min-h-0"
      style={
        {
          '--sidebar-width': '40rem',
        } as React.CSSProperties
      }
    >
      <TaskDetailLayout
        taskId={taskId}
        createdAt={createdAt}
        title={title}
        slug={slug}
        description={description}
        onTitleChange={onTitleChange}
        onSlugChange={onSlugChange}
        onDescriptionChange={onDescriptionChange}
        titlePlaceholder={titlePlaceholder}
        slugPlaceholder={slugPlaceholder}
        editable={editable}
        slugEditable={slugEditable}
        titleError={titleError}
        slugError={slugError}
        descriptionError={descriptionError}
        footerContent={footerContent}
        actions={actions}
      />
    </SidebarProvider>
  );
}

function TaskDetailLayout({
  taskId,
  createdAt,
  slug,
  title,
  description,
  onSlugChange,
  onTitleChange,
  onDescriptionChange,
  slugPlaceholder = 'task-worktree-name',
  titlePlaceholder = 'Task title',
  editable = false,
  slugEditable = false,
  slugError,
  titleError,
  descriptionError,
  footerContent,
  actions,
}: Omit<TaskDetailProps, 'defaultSidebarOpen'>) {
  const { isMobile, open, openMobile } = useSidebar();
  const isSidebarVisible = isMobile ? openMobile : open;

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left side (main content) */}
      <div className="flex min-h-0 flex-1 flex-col">
        <TaskDetailHeader actions={isSidebarVisible ? undefined : actions} />

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mx-auto w-full max-w-4xl space-y-4">
            {/* Keep shared task identity fields consistent across create and update flows. */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(event) => onSlugChange?.(event.target.value)}
                placeholder={slugPlaceholder}
                disabled={!(slugEditable ?? editable)}
              />
              {slugError ? <div className="text-sm text-destructive">{slugError}</div> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(event) => onTitleChange?.(event.target.value)}
                placeholder={titlePlaceholder}
                disabled={!editable}
              />
              {titleError ? <div className="text-sm text-destructive">{titleError}</div> : null}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Separator className="my-4" />
              {/* Keep description in markdown editor for both create and detail modes. */}
              <MarkdownEditor
                content={description}
                onContentChange={(content) => onDescriptionChange?.(content)}
                editable={editable}
              />
              {descriptionError ? (
                <div className="text-sm text-destructive">{descriptionError}</div>
              ) : null}
            </div>

            {/* Keep validation and status messaging colocated with editor content. */}
            {footerContent}
          </div>
        </div>
      </div>

      {/* Right side (sidebar) */}
      <TaskDetailSidebar
        actions={actions}
        taskId={taskId}
        slug={slug}
        title={title}
        description={description}
        createdAt={createdAt}
      />
    </div>
  );
}
