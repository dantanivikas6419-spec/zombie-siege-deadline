import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {fileURLToPath} from 'url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

function standaloneSingleFilePlugin(): Plugin {
  return {
    name: 'standalone-single-file',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const htmlKeys = Object.keys(bundle).filter((key) => key.endsWith('.html'));
      if (htmlKeys.length === 0) return;

      const htmlKey = htmlKeys[0];
      const htmlAsset = bundle[htmlKey];
      if (!htmlAsset || htmlAsset.type !== 'asset') return;

      let html =
        typeof htmlAsset.source === 'string'
          ? htmlAsset.source
          : Buffer.from(htmlAsset.source).toString('utf-8');

      const cssParts: string[] = [];
      const jsParts: string[] = [];

      for (const [key, item] of Object.entries(bundle)) {
        if (item.type === 'asset' && key.endsWith('.css')) {
          const cssText =
            typeof item.source === 'string'
              ? item.source
              : Buffer.from(item.source).toString('utf-8');
          cssParts.push(cssText);
          delete bundle[key];
        } else if (item.type === 'chunk' && key.endsWith('.js')) {
          jsParts.push(item.code);
          delete bundle[key];
        }
      }

      // Remove external module/preload/stylesheet tags emitted for bundled assets
      html = html
        .replace(/<script\b[^>]*type=["']module["'][^>]*\bsrc=["'][^"']+["'][^>]*>\s*<\/script>\s*/gi, '')
        .replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*>\s*/gi, '')
        .replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'][^"']*assets\/[^"']+["'][^>]*>\s*/gi, '');

      if (cssParts.length > 0) {
        const combinedCss = cssParts.join('\n').replace(/<\/style/gi, '<\\/style');
        const styleTag = `    <style>\n${combinedCss}\n    </style>\n`;
        html = html.replace(/<\/head>/i, () => `${styleTag}  </head>`);
      }

      if (jsParts.length > 0) {
        const combinedJs = jsParts.join('\n').replace(/<\/script/gi, '<\\/script');
        const scriptTag = `    <script type="module">\n${combinedJs}\n    </script>\n`;
        html = html.replace(/<\/body>/i, () => `${scriptTag}  </body>`);
      }

      delete bundle[htmlKey];

      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: html,
      });

      // Write standalone single-file index.html to workspace root so Export -> ZIP works directly without npm build
      fs.writeFileSync(path.resolve(rootDir, 'index.html'), html, 'utf-8');
    },
  };
}

export default defineConfig(({command}) => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), standaloneSingleFilePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
      },
    },
    build:
      command === 'build'
        ? {
            cssCodeSplit: false,
            assetsInlineLimit: 100000000,
            rollupOptions: {
              input: path.resolve(rootDir, 'index.source.html'),
              output: {
                codeSplitting: false,
              },
            },
          }
        : undefined,
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
