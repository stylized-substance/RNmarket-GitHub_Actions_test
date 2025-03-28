import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
// tsconfigPaths enables path aliases defined in tsconfig.json
export default defineConfig({
  plugins: [react(), tsconfigPaths()]
});
