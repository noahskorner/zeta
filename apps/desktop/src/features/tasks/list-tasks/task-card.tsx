import { useRef, useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { TaskDialog } from '../view-task/task-dialog';

type TaskCardProps = {
  taskId: string;
  projectId: string;
  slug: string;
  title: string;
  description: string;
  isDragging: boolean;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onTaskUpdated: () => void;
  onError: (message: string) => void;
};

export function TaskCard(props: TaskCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isExpanded, setIsExpanded] = useState(false);
  const wasDraggedRef = useRef(false);

  const handleTaskUpdated = () => {
    props.onTaskUpdated();
  };

  const handleError = (message: string) => {
    props.onError(message);
  };

  return (
    <TaskDialog
      projectId={props.projectId}
      taskId={props.taskId}
      slug={props.slug}
      title={props.title}
      description={props.description}
      onUpdate={handleTaskUpdated}
      onError={handleError}
    >
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
          event.dataTransfer.setData('text/task-card-id', props.taskId);
          props.onDragStart(props.taskId);
        }}
        onDragEnd={() => {
          props.onDragEnd();
          setTimeout(() => {
            wasDraggedRef.current = false;
          }, 0);
        }}
      >
        <CardContent className="space-y-2 px-3">
          <div className="text-sm font-medium">{props.title}</div>
        </CardContent>
      </Card>
    </TaskDialog>
  );
}
