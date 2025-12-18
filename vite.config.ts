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
          // Core - toujours chargé
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'query-vendor': ['@tanstack/react-query'],
          // UI essentiels uniquement
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-tooltip', '@radix-ui/react-popover'],
          // SUPPRIMÉ du bundle initial (lazy-loaded avec leurs composants):
          // - recharts (103 KiB) → lazy avec CollectiviteDashboard
          // - lottie-web/lottie-react → lazy avec composants qui l'utilisent
          // - date-fns → utilisé partout, gardé dans index
          // - lucide-react → tree-shaked automatiquement
          // - form-vendor → lazy avec pages de formulaire
        }
      }
    }
  }
}));
