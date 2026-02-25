import { useEffect, useMemo, useState } from 'react';
import { CreateTaskDialog } from './create-task-dialog';
import { TasksBoard } from './tasks-board';
import type { TaskCard } from './types';

type TasksPanelProps = {
  selectedProjectId: string | null;
  onTaskCreated: (taskId: string) => void;
  onTaskUpdated: (taskId: string) => void;
  onError: (message: string) => void;
};

export function TasksPanel(props: TasksPanelProps) {
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const hasSelectedProject = useMemo(
    () => Boolean(props.selectedProjectId),
    [props.selectedProjectId],
  );

  useEffect(() => {
    void loadTasks();
  }, [props.selectedProjectId, refreshCount]);

  async function loadTasks() {
    if (!props.selectedProjectId) {
      setTasks([]);
      return;
    }

    setIsLoadingTasks(true);
    try {
      const response = await window.zetaApi.listTasks({ projectId: props.selectedProjectId });
      const sortedTasks = [...response.tasks].sort((first, second) =>
        second.createdAt.localeCompare(first.createdAt),
      );

      setTasks(
        sortedTasks.map((task) => ({
          id: task.id,
          slug: task.slug,
          title: task.title,
          description: task.description,
          createdAt: task.createdAt,
          laneId: 'backlog',
        })),
      );
    } catch (error) {
      props.onError(getErrorMessage(error));
    } finally {
      setIsLoadingTasks(false);
    }
  }

  function handleTaskCreated(taskId: string) {
    props.onTaskCreated(taskId);
    setRefreshCount((currentCount) => currentCount + 1);
  }

  function handleTaskUpdated(taskId: string) {
    props.onTaskUpdated(taskId);
    setRefreshCount((currentCount) => currentCount + 1);
  }

  return (
    <div className="w-full space-y-4">
      {/* Keep task creation near the board and scoped to the selected project. */}
      <div className="flex items-center justify-between gap-3 rounded-md border p-4">
        <div className="text-sm text-muted-foreground">
          Create a task to persist metadata and create a git worktree.
        </div>
        <CreateTaskDialog
          selectedProjectId={props.selectedProjectId}
          onTaskCreated={handleTaskCreated}
          onError={props.onError}
        />
      </div>
      {!hasSelectedProject ? (
        <div className="rounded-md border p-3 text-sm text-muted-foreground">
          Select a project to load tasks.
        </div>
      ) : null}

      <TasksBoard
        tasks={tasks}
        projectId={props.selectedProjectId}
        isLoading={isLoadingTasks}
        onTaskUpdated={handleTaskUpdated}
        onError={props.onError}
      />
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}
