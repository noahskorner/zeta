import "./index.css";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./components/theme-provider";
import App from "./features/app";

const root = createRoot(document.body);
root.render(
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
    storageKey="zeta-theme"
  >
    <App />
  </ThemeProvider>,
);
