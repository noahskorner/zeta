import { useEffect, useMemo, useState } from "react";
import { TaskLane } from "./task-lane";
import type { TaskCard, TaskLane as TaskLaneModel, TaskLaneId } from "./types";

const lanes: TaskLaneModel[] = [
  { id: "backlog", title: "Backlog", description: "Capture and shape upcoming work." },
  { id: "ready", title: "Ready", description: "Defined tasks ready for pickup." },
  { id: "in-progress", title: "In Progress", description: "Actively being implemented." },
  { id: "review", title: "Review", description: "Waiting on code or QA review." },
  { id: "done", title: "Done", description: "Completed and verified." },
];

type TasksBoardProps = {
  tasks: TaskCard[];
  isLoading: boolean;
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
        "in-progress": [],
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
      <div>
        <div className="text-sm text-muted-foreground">
          Tasks load from project metadata and can be organized by lane.
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {lanes.map((lane) => (
          <TaskLane
            key={lane.id}
            lane={lane}
            tasks={cardsByLane[lane.id]}
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
          />
        ))}
      </div>

      {props.isLoading ? <div className="text-sm text-muted-foreground">Loading tasks...</div> : null}
    </div>
  );
}
