import type { TaskLaneAssignee } from './types';

type TaskLaneAssigneesProps = {
  assignees: TaskLaneAssignee[];
  maxVisible?: number;
};

export function TaskLaneAssignees(props: TaskLaneAssigneesProps) {
  if (props.assignees.length === 0) {
    return null;
  }

  // Keep the group compact so it can sit at the lane header's top-right.
  const maxVisible = props.maxVisible ?? 4;
  const visibleAssignees = props.assignees.slice(0, maxVisible);
  const hiddenCount = props.assignees.length - visibleAssignees.length;

  return (
    <div className="flex items-center">
      {visibleAssignees.map((assignee, index) => (
        <div
          key={assignee.id}
          className={[
            'flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-[10px] font-semibold text-white',
            assignee.colorClassName,
            index === 0 ? '' : '-ml-2',
          ].join(' ')}
          title={assignee.name}
          aria-label={assignee.name}
        >
          {assignee.initials}
        </div>
      ))}
      {hiddenCount > 0 ? (
        <div
          className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[11px] font-medium text-muted-foreground"
          aria-label={`${hiddenCount} more assignees`}
          title={`${hiddenCount} more assignees`}
        >
          +{hiddenCount}
        </div>
      ) : null}
    </div>
  );
}
