import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      ignored: ['**/playwright-report/**', '**/test-results/**', '**/node_modules/**']
    }
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@radix-ui/react-accordion', '@radix-ui/react-select', '@radix-ui/react-checkbox', '@radix-ui/react-radio-group', '@radix-ui/react-switch', '@radix-ui/react-popover'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['recharts'],
          'query-vendor': ['@tanstack/react-query'],
          'date-vendor': ['date-fns'],
          'lottie-vendor': ['lottie-web', 'lottie-react'],
          'icons-vendor': ['lucide-react'],
        }
      }
    }
  }
}));
