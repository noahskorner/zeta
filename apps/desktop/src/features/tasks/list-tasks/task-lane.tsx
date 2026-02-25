import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { TaskCard } from './task-card';
import type {
  TaskCard as TaskCardModel,
  TaskLane as TaskLaneModel,
  TaskLaneAssignee,
} from '../types';

type TaskLaneProps = {
  lane: TaskLaneModel;
  tasks: TaskCardModel[];
  projectId: string | null;
  assignees: TaskLaneAssignee[];
  isDropTarget: boolean;
  draggingTaskId: string | null;
  onDropTask: (taskId: string, laneId: TaskLaneModel['id']) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDragEnterLane: (laneId: TaskLaneModel['id']) => void;
  onDragLeaveLane: () => void;
  onTaskUpdated: (taskId: string) => void;
  onError: (message: string) => void;
};

export function TaskLane(props: TaskLaneProps) {
  return (
    <Card
      className={[
        'flex min-h-130 flex-col bg-muted/20 py-4 transition-colors',
        props.isDropTarget ? 'border-primary/60 bg-primary/5' : '',
      ].join(' ')}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDragEnter={() => props.onDragEnterLane(props.lane.id)}
      onDragLeave={props.onDragLeaveLane}
      onDrop={(event) => {
        event.preventDefault();
        const taskId = event.dataTransfer.getData('text/task-card-id');
        if (taskId) {
          props.onDropTask(taskId, props.lane.id);
        }
        props.onDragLeaveLane();
      }}
    >
      <CardHeader className="space-y-2 px-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm">{props.lane.title}</CardTitle>
        </div>
        <div className="text-xs text-muted-foreground">{props.lane.description}</div>
      </CardHeader>

      <CardContent className="space-y-3 px-4">
        <div className="space-y-3">
          {props.tasks.length === 0 ? (
            <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
              No tasks in this lane yet.
            </div>
          ) : null}
          {props.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              projectId={props.projectId}
              isDragging={props.draggingTaskId === task.id}
              onDragStart={props.onDragStart}
              onDragEnd={props.onDragEnd}
              onTaskUpdated={props.onTaskUpdated}
              onError={props.onError}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
