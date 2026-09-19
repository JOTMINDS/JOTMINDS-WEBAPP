import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(process.cwd(), 'src/assets', filename)
      }
    },
  }
}

function openaiDevServer(apiKey?: string) {
  return {
    name: 'openai-dev-server',
    configureServer(server: any) {
      server.middlewares.use('/api/openai', (req: any, res: any, next: any) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          return next();
        }

        let rawBody = '';
        req.on('data', (chunk: any) => { rawBody += chunk; });
        req.on('end', async () => {
          try {
            const resolvedKey = apiKey || process.env.OPENAI_API_KEY;
            let response: Response;

            if (resolvedKey) {
              response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${resolvedKey}`
                },
                body: rawBody
              });
            } else {
              // Fallback to production Cloudflare Pages proxy
              response = await fetch('https://jotminds.pages.dev/api/openai', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: rawBody
              });
            }

            const data = await response.text();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = response.status;
            res.end(data);
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || 'Proxy error' }));
          }
        });
      });
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  let apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    try {
      const devVarsPath = path.resolve(process.cwd(), '.dev.vars');
      if (fs.existsSync(devVarsPath)) {
        const content = fs.readFileSync(devVarsPath, 'utf-8');
        const match = content.match(/OPENAI_API_KEY\s*=\s*["']?([^"'\r\n]+)/);
        if (match) apiKey = match[1].trim();
      }
    } catch {
      // Ignore reading error
    }
  }

  return {
    plugins: [
      figmaAssetResolver(),
      openaiDevServer(apiKey),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), './src/app'),
      },
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
  };
})

