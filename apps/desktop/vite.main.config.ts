import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config
export default defineConfig({
  // Resolve workspace package imports to source during local development.
  plugins: [tsconfigPaths()],
});
