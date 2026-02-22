import { Copy, Minus, Square, X } from 'lucide-react';

type WindowHeaderProps = {
  isWindowMaximized: boolean;
  onMinimizeWindow: () => Promise<void>;
  onToggleMaximizeWindow: () => Promise<void>;
  onCloseWindow: () => Promise<void>;
};

export function WindowHeader({
  isWindowMaximized,
  onMinimizeWindow,
  onToggleMaximizeWindow,
  onCloseWindow,
}: WindowHeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full flex h-8 items-center justify-between border-b bg-background/95 pl-3 backdrop-blur-sm [-webkit-app-region:drag]">
      {/* Keep a subtle brand marker on the left while preserving drag area. */}
      <div className="text-xs font-medium text-muted-foreground">Zeta</div>

      {/* Window chrome actions must opt out of drag mode to be clickable. */}
      <div className="flex h-full [-webkit-app-region:no-drag]">
        <button
          className="flex h-full w-11 items-center justify-center hover:bg-accent"
          aria-label="Minimize window"
          onClick={() => void onMinimizeWindow()}
        >
          <Minus className="size-3.5" />
        </button>
        <button
          className="flex h-full w-11 items-center justify-center hover:bg-accent"
          aria-label={isWindowMaximized ? 'Restore window' : 'Maximize window'}
          onClick={() => void onToggleMaximizeWindow()}
        >
          {isWindowMaximized ? <Copy className="size-3.5" /> : <Square className="size-3.5" />}
        </button>
        <button
          className="flex h-full w-11 items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
          aria-label="Close window"
          onClick={() => void onCloseWindow()}
        >
          <X className="size-3.5" />
        </button>
      </div>
    </header>
  );
}
