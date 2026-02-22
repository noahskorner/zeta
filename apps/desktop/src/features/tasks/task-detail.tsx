import * as React from 'react';
import { SidebarProvider } from '../../components/ui/sidebar';
import { TaskDetailHeader } from './task-detail-header';
import { TaskDetailSidebar } from './task-detail-sidebar';
import { MarkdownEditor } from '../../components/markdown-editor/markdown-editor';

export type TaskDetailProps = {
  taskId: string;
  description: string;
  actions?: React.ReactNode;
  defaultSidebarOpen?: boolean;
};

export function TaskDetail({ description, actions, defaultSidebarOpen = true }: TaskDetailProps) {
  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <div className="flex h-full w-full overflow-hidden">
        {/* Left side (main content) */}
        <div className="w-full">
          <TaskDetailHeader actions={actions} />

          <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4">
            <div className="mx-auto w-full max-w-4xl space-y-4">
              <MarkdownEditor content={description} onContentChange={() => {}} />
            </div>
          </div>
        </div>

        {/* Right side (sidebar) */}
        <TaskDetailSidebar />
      </div>
    </SidebarProvider>
  );
}
