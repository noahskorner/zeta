import { useEffect, useMemo, useState } from 'react';
import { ListTaskLaneResponse, TaskLane } from './task-lane';
import type { ListTaskResponse } from '@zeta/commands';

const lanes: ListTaskLaneResponse[] = [
  { status: 'backlog', title: 'Backlog', description: 'Capture and shape upcoming work.' },
  { status: 'ready', title: 'Ready', description: 'Defined tasks ready for pickup.' },
  { status: 'in-progress', title: 'In Progress', description: 'Actively being implemented.' },
  { status: 'review', title: 'Review', description: 'Waiting on code or QA review.' },
  { status: 'done', title: 'Done', description: 'Completed and verified.' },
];

type TasksBoardProps = {
  projectId: string;
  tasks: ListTaskResponse[];
  isLoading: boolean;
  onTaskUpdated: () => void;
  onError: (message: string) => void;
};

export function TasksBoard(props: TasksBoardProps) {
  const [cards, setCards] = useState<
    Array<ListTaskResponse & { status: ListTaskLaneResponse['status'] }>
  >(props.tasks.map((task) => ({ ...task, status: 'backlog' })));
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dropTargetLaneId, setDropTargetLaneId] = useState<ListTaskLaneResponse['status'] | null>(
    null,
  );

  useEffect(() => {
    setCards(props.tasks.map((task) => ({ ...task, status: 'backlog' })));
  }, [props.tasks]);

  // Build lane buckets once per state change to keep rendering simple.
  const cardsByLane = useMemo(() => {
    return lanes.reduce<Record<ListTaskLaneResponse['status'], ListTaskResponse[]>>(
      (buckets, lane) => {
        buckets[lane.status] = cards.filter((task) => task.status === lane.status);
        return buckets;
      },
      {
        backlog: [],
        ready: [],
        'in-progress': [],
        review: [],
        done: [],
      },
    );
  }, [cards]);

  // Keep drag mutations centralized so lane components stay mostly presentational.
  function moveTaskToLane(taskId: string, laneId: ListTaskLaneResponse['status']) {
    setCards((currentCards) =>
      currentCards.map((card) => {
        if (card.id !== taskId) {
          return card;
        }

        return { ...card, laneId };
      }),
    );
    setDraggingTaskId(null);
    setDropTargetLaneId(null);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-5">
        {lanes.map((lane) => (
          <TaskLane
            key={lane.status}
            lane={lane}
            tasks={cardsByLane[lane.status]}
            projectId={props.projectId}
            draggingTaskId={draggingTaskId}
            isDropTarget={dropTargetLaneId === lane.status}
            onDropTask={moveTaskToLane}
            onDragStart={setDraggingTaskId}
            onDragEnd={() => {
              setDraggingTaskId(null);
              setDropTargetLaneId(null);
            }}
            onDragEnterLane={setDropTargetLaneId}
            onDragLeaveLane={() => setDropTargetLaneId(null)}
            onTaskUpdated={props.onTaskUpdated}
            onError={props.onError}
          />
        ))}
      </div>

      {props.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading tasks...</div>
      ) : null}
    </div>
  );
}
