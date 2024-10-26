// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Base public path when served in production
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'), // Alias 'src' to the 'src' directory
    },
  },
  plugins: [
    react(), // Enables React Fast Refresh and JSX support
    visualizer({
      filename: './dist/bundle-analysis.html', // Output file for bundle analysis
      open: false, // Set to true to automatically open the report
      gzipSize: true, // Include gzip size in the report
      brotliSize: true, // Include brotli size in the report
    }),
  ],
  optimizeDeps: {
    exclude: [], // Specify any dependencies to exclude from optimization
    esbuildOptions: {
      loader: {
        '.js': 'jsx', // Ensure JS files are treated as JSX
      },
      // Removed 'exclude' from here as it's not a valid property inside 'esbuildOptions'
    },
  },
});
