import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config
export default defineConfig({
  // Keep native modules out of the bundle, as they are required at runtime.
  build: {
    rollupOptions: {
      external: ['node-pty', 'node-pty-prebuilt-multiarch'],
    },
  },
  // Resolve workspace package imports to source during local development.
  plugins: [tsconfigPaths()],
});
