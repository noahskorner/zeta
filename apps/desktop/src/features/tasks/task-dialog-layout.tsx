import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';

export type TaskDialogLayoutProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  trigger?: ReactNode;
  children: ReactNode;
};

export function TaskDialogLayout({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  children,
}: TaskDialogLayoutProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent
        showCloseButton={false}
        className={[
          // Fill available window body space without center-transform clipping.
          'inset-x-4',
          'bottom-4',
          'top-10',
          'translate-x-0',
          'translate-y-0',
          // Almost full screen.
          'max-w-none',
          'w-auto',
          'h-auto',
          'min-h-0',
          'flex',
          'flex-col',
          'p-0',
          'gap-0',
          'sm:rounded-lg',
          'overflow-hidden',
        ].join(' ')}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
}
