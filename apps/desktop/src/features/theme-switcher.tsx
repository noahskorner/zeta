import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

type ThemeValue = 'light' | 'dark' | 'system';

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Only render theme controls after hydration to avoid mismatched state.
  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme: ThemeValue = useMemo(() => {
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      return theme;
    }

    return 'system';
  }, [theme]);

  const themeLabel = getThemeLabel(selectedTheme);

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="w-fit justify-start">
          {themeLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={selectedTheme} onValueChange={(value) => setTheme(value)}>
          <DropdownMenuRadioItem value="light" className="flex items-center gap-2">
            <Sun className="size-4 text-muted-foreground" />
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="flex items-center gap-2">
            <Moon className="size-4 text-muted-foreground" />
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="flex items-center gap-2">
            <Laptop className="size-4 text-muted-foreground" />
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getThemeLabel(theme: ThemeValue): string {
  if (theme === 'light') {
    return 'Light';
  }

  if (theme === 'dark') {
    return 'Dark';
  }

  return 'System';
}
