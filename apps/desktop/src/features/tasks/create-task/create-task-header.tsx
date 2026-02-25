import * as React from 'react';
import { Input } from '../../../components/ui/input';

type CreateTaskHeaderProps = {
  title: string;
  slug: string;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  actions?: React.ReactNode;
};

export function CreateTaskHeader({
  title,
  slug,
  onTitleChange,
  onSlugChange,
  actions,
}: CreateTaskHeaderProps) {
  const [isEditingSlug, setIsEditingSlug] = React.useState(false);
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

  // Handle slug events
  const handleSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSlugChange(event.target.value);
  };

  const handleSlugBlur = () => {
    setIsEditingSlug(false);
  };

  const handleSlugFocus = () => {
    setIsEditingSlug(true);
  };

  const handleSlugClick = () => {
    setIsEditingSlug(true);
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
          {isEditingSlug ? (
            <Input
              id="task-slug-header"
              value={slug}
              onChange={handleSlugChange}
              onBlur={handleSlugBlur}
              placeholder={'task-slug'}
              className="h-8 max-w-sm"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onFocus={handleSlugFocus}
              onClick={handleSlugClick}
              className={
                'cursor-text focus:outline-none focus:ring-1 focus:ring-ring rounded-sm px-1 -mx-1 text-muted-foreground'
              }
            >
              {slug || 'task-slug'}
            </button>
          )}
        </div>
      </div>

      {/* Optional additional actions (e.g., close button) */}
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
