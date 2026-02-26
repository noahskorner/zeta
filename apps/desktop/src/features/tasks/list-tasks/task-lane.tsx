import type { ListTaskResponse } from '@zeta/commands';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { TaskCard } from './task-card';

export type ListTaskLaneResponse = {
  status: 'backlog' | 'ready' | 'in-progress' | 'review' | 'done';
  title: string;
  description: string;
};

type TaskLaneProps = {
  lane: ListTaskLaneResponse;
  tasks: ListTaskResponse[];
  projectId: string;
  isDropTarget: boolean;
  draggingTaskId: string | null;
  onDropTask: (taskId: string, laneId: ListTaskLaneResponse['status']) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDragEnterLane: (laneId: ListTaskLaneResponse['status']) => void;
  onDragLeaveLane: () => void;
  onTaskUpdated: () => void;
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
      onDragEnter={() => props.onDragEnterLane(props.lane.status)}
      onDragLeave={props.onDragLeaveLane}
      onDrop={(event) => {
        event.preventDefault();
        const taskId = event.dataTransfer.getData('text/task-card-id');
        if (taskId) {
          props.onDropTask(taskId, props.lane.status);
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
              taskId={task.id}
              projectId={props.projectId}
              slug={task.slug}
              title={task.title}
              description={task.description}
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
