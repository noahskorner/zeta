import * as React from 'react';
import { Input } from '../../../components/ui/input';

type TaskHeaderProps = {
  title: string;
  slug: string;
  onTitleChange: (title: string) => void;
  actions?: React.ReactNode;
};

export function TaskHeader({ title, slug, onTitleChange, actions }: TaskHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);

  // Handle title events
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(event.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleTitleFocus = () => {
    setIsEditingTitle(true);
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  return (
    <div className={'flex h-12 items-center gap-2 border-b pl-4 pr-2 py-2 w-full'}>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          {isEditingTitle ? (
            <Input
              id="task-title-header"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              placeholder={'New task'}
              className="h-8 max-w-sm"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onFocus={handleTitleFocus}
              onClick={handleTitleClick}
              className={
                'cursor-text focus:outline-none focus:ring-1 focus:ring-ring rounded-sm px-1 -mx-1'
              }
            >
              {title || 'New task'}
            </button>
          )}
          <span className="text-sm text-muted-foreground">/</span>
          <span className="px-1 -mx-1 text-muted-foreground">{slug || 'task-slug'}</span>
        </div>
      </div>

      {/* Optional additional actions (e.g., close button) */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
