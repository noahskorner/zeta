import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  // Keep toast theme synced with the app theme provider.
  const { theme = "system" } = useTheme();

  return <Sonner theme={theme as ToasterProps["theme"]} {...props} />;
}
