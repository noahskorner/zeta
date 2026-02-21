import { Card, CardContent } from "../../components/ui/card";
import type { TaskCard as TaskCardModel } from "./types";

type TaskCardProps = {
  task: TaskCardModel;
  isDragging: boolean;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
};

export function TaskCard(props: TaskCardProps) {
  return (
    <Card
      draggable
      className={[
        "cursor-grab border bg-card py-3 shadow-sm active:cursor-grabbing",
        props.isDragging ? "opacity-40" : "",
      ].join(" ")}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/task-card-id", props.task.id);
        props.onDragStart(props.task.id);
      }}
      onDragEnd={props.onDragEnd}
    >
      <CardContent className="space-y-2 px-3 min-h-24">
        <div className="text-sm font-medium">{props.task.title}</div>
      </CardContent>
    </Card>
  );
}
