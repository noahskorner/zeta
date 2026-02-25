import { useEffect, useMemo, useState } from 'react';
import { TaskLane } from './task-lane';
import type {
  TaskCard,
  TaskLane as TaskLaneModel,
  TaskLaneAssignee,
  TaskLaneId,
} from './types';

const lanes: TaskLaneModel[] = [
  { id: 'backlog', title: 'Backlog', description: 'Capture and shape upcoming work.' },
  { id: 'ready', title: 'Ready', description: 'Defined tasks ready for pickup.' },
  { id: 'in-progress', title: 'In Progress', description: 'Actively being implemented.' },
  { id: 'review', title: 'Review', description: 'Waiting on code or QA review.' },
  { id: 'done', title: 'Done', description: 'Completed and verified.' },
];

// Mock lane ownership/assignment metadata used for UI-only rendering.
const laneAssignees: Record<TaskLaneId, TaskLaneAssignee[]> = {
  backlog: [],
  ready: [
    { id: 'u-1', name: 'Ava Lin', initials: 'AL', colorClassName: 'bg-emerald-600' },
    { id: 'u-2', name: 'Noah Kim', initials: 'NK', colorClassName: 'bg-orange-500' },
  ],
  'in-progress': [
    { id: 'u-3', name: 'Priya Das', initials: 'PD', colorClassName: 'bg-sky-600' },
    { id: 'u-4', name: 'Jules Park', initials: 'JP', colorClassName: 'bg-rose-500' },
    { id: 'u-5', name: 'Ravi Shah', initials: 'RS', colorClassName: 'bg-indigo-600' },
    { id: 'u-6', name: 'Mina Fox', initials: 'MF', colorClassName: 'bg-amber-600' },
    { id: 'u-7', name: 'Kai Moss', initials: 'KM', colorClassName: 'bg-cyan-700' },
  ],
  review: [{ id: 'u-8', name: 'Leo Hart', initials: 'LH', colorClassName: 'bg-violet-600' }],
  done: [],
};

type TasksBoardProps = {
  tasks: TaskCard[];
  projectId: string | null;
  isLoading: boolean;
  onTaskUpdated: (taskId: string) => void;
  onError: (message: string) => void;
};

export function TasksBoard(props: TasksBoardProps) {
  const [cards, setCards] = useState<TaskCard[]>(props.tasks);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dropTargetLaneId, setDropTargetLaneId] = useState<TaskLaneId | null>(null);

  useEffect(() => {
    setCards(props.tasks);
  }, [props.tasks]);

  // Build lane buckets once per state change to keep rendering simple.
  const cardsByLane = useMemo(() => {
    return lanes.reduce<Record<TaskLaneId, TaskCard[]>>(
      (buckets, lane) => {
        buckets[lane.id] = cards.filter((task) => task.laneId === lane.id);
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
  function moveTaskToLane(taskId: string, laneId: TaskLaneId) {
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
            key={lane.id}
            lane={lane}
            tasks={cardsByLane[lane.id]}
            projectId={props.projectId}
            assignees={laneAssignees[lane.id]}
            draggingTaskId={draggingTaskId}
            isDropTarget={dropTargetLaneId === lane.id}
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
