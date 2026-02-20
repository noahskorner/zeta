import { Monitor, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarFooter } from "../components/ui/sidebar";

type ThemePreference = "light" | "dark" | "system";

export function AvatarFooter() {
  return (
    <SidebarFooter>
      <div className="flex items-center gap-2 rounded-md border p-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
          NK
        </div>
        <div className="min-w-0 group-data-[collapsible=icon]:hidden">
          <div className="truncate text-sm font-medium">Noah Korner</div>
          <div className="truncate text-xs text-muted-foreground">Workspace owner</div>
        </div>
        <button
          type="button"
          className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
          aria-label="Open settings"
        >
          <Settings className="size-4" />
        </button>
      </div>

      <ThemeSelector />
    </SidebarFooter>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  // Normalize theme selection for the native select input.
  const selectedTheme: ThemePreference =
    theme === "light" || theme === "dark" ? theme : "system";

  return (
    <div className="rounded-md border p-2 group-data-[collapsible=icon]:hidden">
      <div className="mb-1 text-xs font-medium text-muted-foreground">Theme</div>
      <label className="flex items-center gap-2">
        <ThemeIcon theme={selectedTheme} />
        <select
          value={selectedTheme}
          onChange={(event) => setTheme(event.currentTarget.value)}
          className="h-8 w-full rounded-md border border-sidebar-border bg-sidebar px-2 text-sm"
          aria-label="Select theme"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    </div>
  );
}

function ThemeIcon(props: { theme: ThemePreference }) {
  if (props.theme === "light") {
    return <Sun className="size-4 text-muted-foreground" />;
  }

  if (props.theme === "dark") {
    return <Moon className="size-4 text-muted-foreground" />;
  }

  return <Monitor className="size-4 text-muted-foreground" />;
}
