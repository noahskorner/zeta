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
  friendlyName: string;
  taskName: string;
  description: string;
  onFriendlyNameChange?: (friendlyName: string) => void;
  onTaskNameChange?: (taskName: string) => void;
  onDescriptionChange?: (description: string) => void;
  friendlyNamePlaceholder?: string;
  taskNamePlaceholder?: string;
  editable?: boolean;
  friendlyNameError?: string;
  taskNameError?: string;
  descriptionError?: string;
  footerContent?: React.ReactNode;
  actions?: React.ReactNode;
  defaultSidebarOpen?: boolean;
};

export function TaskDetail({
  taskId,
  friendlyName,
  taskName,
  description,
  createdAt,
  onFriendlyNameChange,
  onTaskNameChange,
  onDescriptionChange,
  friendlyNamePlaceholder = 'Create new task',
  taskNamePlaceholder = 'feat-add-create-task',
  editable = false,
  friendlyNameError,
  taskNameError,
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
        friendlyName={friendlyName}
        taskName={taskName}
        description={description}
        onFriendlyNameChange={onFriendlyNameChange}
        onTaskNameChange={onTaskNameChange}
        onDescriptionChange={onDescriptionChange}
        friendlyNamePlaceholder={friendlyNamePlaceholder}
        taskNamePlaceholder={taskNamePlaceholder}
        editable={editable}
        friendlyNameError={friendlyNameError}
        taskNameError={taskNameError}
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
  friendlyName,
  taskName,
  description,
  onFriendlyNameChange,
  onTaskNameChange,
  onDescriptionChange,
  friendlyNamePlaceholder = 'Create new task',
  taskNamePlaceholder = 'feat-add-create-task',
  editable = false,
  friendlyNameError,
  taskNameError,
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
            {/* Keep shared task identity fields consistent across create and detail modes. */}
            <div className="space-y-2">
              <Label htmlFor="task-friendly-name">Name</Label>
              <Input
                id="task-friendly-name"
                value={friendlyName}
                onChange={(event) => onFriendlyNameChange?.(event.target.value)}
                placeholder={friendlyNamePlaceholder}
                disabled={!editable}
              />
              {friendlyNameError ? (
                <div className="text-sm text-destructive">{friendlyNameError}</div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-name">Worktree</Label>
              <Input
                id="task-name"
                value={taskName}
                onChange={(event) => onTaskNameChange?.(event.target.value)}
                placeholder={taskNamePlaceholder}
                disabled={!editable}
              />
              {taskNameError ? (
                <div className="text-sm text-destructive">{taskNameError}</div>
              ) : null}
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
        taskName={taskName}
        friendlyName={friendlyName}
        description={description}
        createdAt={createdAt}
      />
    </div>
  );
}
