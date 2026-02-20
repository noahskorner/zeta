import { useMemo, useState } from "react";
import { TaskLane } from "./task-lane";
import type { TaskCard, TaskLane as TaskLaneModel, TaskLaneId } from "./types";

const lanes: TaskLaneModel[] = [
  { id: "backlog", title: "Backlog", description: "Capture and shape upcoming work." },
  { id: "ready", title: "Ready", description: "Defined tasks ready for pickup." },
  { id: "in-progress", title: "In Progress", description: "Actively being implemented." },
  { id: "review", title: "Review", description: "Waiting on code or QA review." },
  { id: "done", title: "Done", description: "Completed and verified." },
];

const initialCards: TaskCard[] = [
  { id: "task-1", title: "Scaffold task feature module", laneId: "backlog" },
  { id: "task-2", title: "Wire board into sidebar tasks view", laneId: "ready" },
  { id: "task-3", title: "Implement drag and drop between lanes", laneId: "in-progress" },
  { id: "task-4", title: "Validate desktop layout behavior", laneId: "review" },
];

export function TasksBoard() {
  const [cards, setCards] = useState<TaskCard[]>(initialCards);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dropTargetLaneId, setDropTargetLaneId] = useState<TaskLaneId | null>(null);

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

  function addTask(laneId: TaskLaneId, title: string) {
    const nextTask: TaskCard = {
      id: createTaskId(),
      title,
      laneId,
    };

    setCards((currentCards) => [nextTask, ...currentCards]);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-muted-foreground">
          Add cards in any lane, then drag them across swimlanes.
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
            onAddTask={addTask}
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
    </div>
  );
}

function createTaskId(): string {
  if ("randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}`;
}
