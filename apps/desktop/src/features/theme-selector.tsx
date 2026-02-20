import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../components/ui/button";

export function ThemeSelector() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkTheme = resolvedTheme === "dark";

  // Toggle between the two explicit app themes.
  function handleToggleTheme() {
    setTheme(isDarkTheme ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={handleToggleTheme}
      aria-label={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}
      title={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}
    >
      {isDarkTheme ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
