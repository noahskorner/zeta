import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { TaskCard } from "./task-card";
import type { TaskCard as TaskCardModel, TaskLane as TaskLaneModel } from "./types";

type TaskLaneProps = {
  lane: TaskLaneModel;
  tasks: TaskCardModel[];
  isDropTarget: boolean;
  draggingTaskId: string | null;
  onAddTask: (laneId: TaskLaneModel["id"], title: string) => void;
  onDropTask: (taskId: string, laneId: TaskLaneModel["id"]) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDragEnterLane: (laneId: TaskLaneModel["id"]) => void;
  onDragLeaveLane: () => void;
};

export function TaskLane(props: TaskLaneProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Keep task creation local to each lane to make adding cards quick.
  function handleAddTask() {
    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle) {
      return;
    }

    props.onAddTask(props.lane.id, trimmedTitle);
    setNewTaskTitle("");
  }

  return (
    <Card
      className={[
        "flex min-h-[520px] flex-col bg-muted/20 py-4 transition-colors",
        props.isDropTarget ? "border-primary/60 bg-primary/5" : "",
      ].join(" ")}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDragEnter={() => props.onDragEnterLane(props.lane.id)}
      onDragLeave={props.onDragLeaveLane}
      onDrop={(event) => {
        event.preventDefault();
        const taskId = event.dataTransfer.getData("text/task-card-id");
        if (taskId) {
          props.onDropTask(taskId, props.lane.id);
        }
        props.onDragLeaveLane();
      }}
    >
      <CardHeader className="space-y-1 px-4 pb-4">
        <CardTitle className="text-sm">{props.lane.title}</CardTitle>
        <div className="text-xs text-muted-foreground">{props.lane.description}</div>
      </CardHeader>

      <CardContent className="space-y-3 px-4">
        {/* Use an inline composer so cards can be added directly in target lane. */}
        <div className="flex gap-2">
          <Input
            value={newTaskTitle}
            placeholder="Add a card..."
            onChange={(event) => setNewTaskTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddTask();
              }
            }}
          />
          <Button type="button" size="icon-sm" onClick={handleAddTask}>
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {props.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDragging={props.draggingTaskId === task.id}
              onDragStart={props.onDragStart}
              onDragEnd={props.onDragEnd}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
