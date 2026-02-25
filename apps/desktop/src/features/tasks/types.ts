export type TaskLaneId = 'backlog' | 'ready' | 'in-progress' | 'review' | 'done';

export type TaskLane = {
  id: TaskLaneId;
  title: string;
  description: string;
};

export type TaskLaneAssignee = {
  id: string;
  name: string;
  initials: string;
  colorClassName: string;
};

export type TaskCard = {
  id: string;
  laneId: TaskLaneId;
  createdAt: string;
  slug: string;
  title: string;
  description: string;
};
