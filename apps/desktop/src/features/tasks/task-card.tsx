import { useRef, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { TaskDialog } from './task-dialog';
import type { TaskCard as TaskCardModel } from './types';

type TaskCardProps = {
  task: TaskCardModel;
  projectId: string | null;
  isDragging: boolean;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onTaskUpdated: (taskId: string) => void;
  onError: (message: string) => void;
};

export function TaskCard(props: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const wasDraggedRef = useRef(false);

  return (
    <>
      <Card
        draggable
        role="button"
        tabIndex={0}
        className={[
          'cursor-grab border bg-card py-3 shadow-sm active:cursor-grabbing',
          props.isDragging ? 'opacity-40' : '',
        ].join(' ')}
        onClick={() => {
          if (wasDraggedRef.current) {
            return;
          }
          setIsExpanded(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsExpanded(true);
          }
        }}
        onDragStart={(event) => {
          wasDraggedRef.current = true;
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/task-card-id', props.task.id);
          props.onDragStart(props.task.id);
        }}
        onDragEnd={() => {
          props.onDragEnd();
          setTimeout(() => {
            wasDraggedRef.current = false;
          }, 0);
        }}
      >
        <CardContent className="space-y-2 px-3">
          <div className="text-sm font-medium">{props.task.title}</div>
        </CardContent>
      </Card>

      <TaskDialog
        projectId={props.projectId}
        taskId={props.task.id}
        taskName={props.task.taskName}
        title={props.task.title}
        description={props.task.description}
        createdAt={props.task.createdAt}
        open={isExpanded}
        onOpenChange={setIsExpanded}
        onTaskUpdated={props.onTaskUpdated}
        onError={props.onError}
      />
    </>
  );
}
