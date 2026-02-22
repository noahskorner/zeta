export type TaskLaneId = "backlog" | "ready" | "in-progress" | "review" | "done";

export type TaskLane = {
  id: TaskLaneId;
  title: string;
  description: string;
};

export type TaskCard = {
  id: string;
  taskName: string;
  title: string;
  description: string;
  createdAt: string;
  laneId: TaskLaneId;
};
