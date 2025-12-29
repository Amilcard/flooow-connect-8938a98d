import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * S1: LCP Image Preload Plugin
 * Injects preload link for the LCP image (aides-financieres.webp)
 * This helps the browser discover the image before React renders
 */
function lcpPreloadPlugin(): Plugin {
  return {
    name: 'lcp-preload',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      // Only in build mode
      if (!ctx.bundle) return html;

      // Find the hashed LCP image in the bundle
      const lcpAsset = Object.keys(ctx.bundle).find(
        key => key.includes('aides-financieres') && key.endsWith('.webp')
      );

      if (!lcpAsset) return html;

      // Inject preload link after opening <head>
      const preloadLink = `<link rel="preload" as="image" href="/${lcpAsset}" fetchpriority="high">`;
      return html.replace('<head>', `<head>\n    ${preloadLink}`);
    }
  };
}

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
    lcpPreloadPlugin(),
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
