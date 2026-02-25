import * as React from 'react';
import { Input } from '../../components/ui/input';
import { SidebarTrigger } from '../../components/ui/sidebar';
import { cn } from '../../lib/utils';
import { useEffect } from 'react';

export type TaskDetailHeaderProps = {
  title: string;
  slug: string;
  onTitleChange?: (title: string) => void;
  onSlugChange?: (slug: string) => void;
  titlePlaceholder?: string;
  slugPlaceholder?: string;
  editable?: boolean;
  slugEditable?: boolean;
  titleError?: string;
  slugError?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function TaskDetailHeader({
  title,
  slug,
  onTitleChange,
  onSlugChange,
  titlePlaceholder = 'Task title',
  slugPlaceholder = 'task-worktree-name',
  editable = false,
  slugEditable = false,
  titleError,
  slugError,
  actions,
  className,
}: TaskDetailHeaderProps) {
  const [isTitleEditing, setIsTitleEditing] = React.useState(false);
  const isCreateMode = editable && slugEditable;
  const showEditableTitleInput =
    editable && (isTitleEditing || (isCreateMode && title.trim().length === 0));
  const showEditableSlugInput = isCreateMode && slug.trim().length === 0;

  // Exit title edit mode whenever the title is cleared during create flow.
  useEffect(() => {
    if (isCreateMode && title.trim().length === 0) {
      setIsTitleEditing(false);
    }
  }, [isCreateMode, title]);

  return (
    <div className={cn('flex h-12 items-center gap-2 border-b pl-4 pr-2 py-2 w-full', className)}>
      <div className="min-w-0 flex-1">
        {/* Keep task identity in the header with create and update edit behavior. */}
        <div className="flex min-w-0 items-center gap-2">
          {showEditableTitleInput ? (
            <Input
              id="task-title-header"
              value={title}
              onChange={(event) => onTitleChange?.(event.target.value)}
              onBlur={() => setIsTitleEditing(false)}
              placeholder={titlePlaceholder}
              className="h-8 max-w-sm"
              autoFocus
            />
          ) : !editable ? (
            <span className="truncate text-left text-sm">{title || titlePlaceholder}</span>
          ) : (
            <button
              type="button"
              onFocus={() => {
                if (editable) {
                  setIsTitleEditing(true);
                }
              }}
              onClick={() => {
                if (editable) {
                  setIsTitleEditing(true);
                }
              }}
              className={cn(
                'truncate text-left text-sm',
                editable
                  ? 'cursor-text focus:outline-none focus:ring-1 focus:ring-ring rounded-sm px-1 -mx-1'
                  : '',
              )}
            >
              {title || titlePlaceholder}
            </button>
          )}
          <span className="text-sm text-muted-foreground">/</span>
          {showEditableSlugInput ? (
            <Input
              id="slug-header"
              value={slug}
              onChange={(event) => onSlugChange?.(event.target.value)}
              placeholder={slugPlaceholder}
              className="h-8 max-w-sm"
            />
          ) : (
            <span className="truncate text-sm text-muted-foreground">
              {slug || slugPlaceholder}
            </span>
          )}
        </div>
        {titleError ? <div className="mt-1 text-xs text-destructive">{titleError}</div> : null}
        {slugError ? <div className="mt-1 text-xs text-destructive">{slugError}</div> : null}
      </div>

      {/* SidebarTrigger all the way on the right */}
      <SidebarTrigger className="ml-1" />

      {/* Optional additional actions (e.g., close button) */}
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
