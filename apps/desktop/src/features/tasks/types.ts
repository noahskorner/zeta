export type TaskLaneId = "backlog" | "ready" | "in-progress" | "review" | "done";

export type TaskLane = {
  id: TaskLaneId;
  title: string;
  description: string;
};

export type TaskCard = {
  id: string;
  title: string;
  laneId: TaskLaneId;
};
