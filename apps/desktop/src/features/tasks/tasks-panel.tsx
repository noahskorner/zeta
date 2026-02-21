import { CreateTaskDialog } from "./create-task-dialog";
import { TasksBoard } from "./tasks-board";

type TasksPanelProps = {
  selectedProjectPath: string | null;
  onTaskCreated: (taskId: string) => void;
  onError: (message: string) => void;
};

export function TasksPanel(props: TasksPanelProps) {
  return (
    <div className="space-y-4">
      {/* Keep task creation near the board and scoped to the selected project. */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Create a task to persist metadata and create a git worktree.
        </div>
        <CreateTaskDialog
          selectedProjectPath={props.selectedProjectPath}
          onTaskCreated={props.onTaskCreated}
          onError={props.onError}
        />
      </div>

      <TasksBoard />
    </div>
  );
}
