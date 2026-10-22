import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { routeChat, providerStatus } from './server/aiRouter.ts';
import { exec } from 'child_process';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));


// ALI Assistant Chat endpoint
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { prompt, history, language = 'fa', systemContext = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemInstruction = `
You are "ALI Intelligence" (دستیار هوشمند علی), the ultra-advanced AI built into the iPhone 16 Pro Max ("ALI phone").
You respond in a polite, super-fast, intelligent, and helpful tone in the user's language (Persian by default, or English if asked).
You have deep integration with the ALI phone hardware & software:
- You know the device is an iPhone 16 Pro Max with A18 Pro chip, 1TB Titanium storage, iOS 18.2 / ALI OS.
- You can help users manage and install products, launch apps (Phone, Messages, Camera, Photos, Safari, Terminal, Calendar, Maps, Notes, Calculator, Music, Weather, Clock, Settings, Store, Product Manager), calculate finances, draft invoices, write notes, or answer general knowledge questions.
- Current active phone context: ${JSON.stringify(systemContext)}.
- If the user asks you to open an app or execute an action, you can include an action tag in your answer like [ACTION:open_app:camera], [ACTION:open_app:products], [ACTION:open_app:terminal], [ACTION:open_app:calendar], [ACTION:open_app:maps], [ACTION:open_app:notes], [ACTION:open_app:calculator], [ACTION:open_app:music], [ACTION:open_app:settings], [ACTION:open_app:store], [ACTION:open_app:phone], [ACTION:open_app:safari], [ACTION:flashlight:toggle], [ACTION:take_photo].
Keep responses crisp, high quality, and elegant.
`;

    const turns = Array.isArray(history)
      ? history
          .filter((m: any) => m && typeof m.text === 'string')
          .map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', text: m.text }) as const)
      : [];
    const routed = await routeChat(systemInstruction, turns as any, String(prompt));
    const replyText = routed.text || 'پاسخی دریافت نشد.';

    // Extract any action if present
    const actionMatch = replyText.match(/\[ACTION:([^\]]+)\]/);
    const action = actionMatch ? actionMatch[1] : null;
    const cleanReply = replyText.replace(/\[ACTION:[^\]]+\]/g, '').trim();

    return res.json({
      reply: cleanReply,
      action,
      provider: routed.provider,
      model: routed.model,
      ms: routed.ms,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/assistant/chat:', error);
    return res.status(503).json({
      error: 'Failed to communicate with ALI Intelligence',
      details: error.message || 'Unknown error',
    });
  }
});

// Provider health (which free AI is fast / cooling down)
app.get('/api/ai/status', (_req, res) => res.json({ providers: providerStatus() }));

// Check phone status
app.get('/api/status', (req, res) => {
  res.json({
    device: 'ALI phone - iPhone 16 Pro Max',
    chip: 'Apple A18 Pro',
    os: 'ALI OS 18.2',
    status: 'online',
    time: new Date().toISOString(),
  });
});

// Terminal runs real shell commands. Personal use: set ENABLE_TERMINAL=true in production
// and it works exactly as in development. TERMINAL_TOKEN is optional extra protection
// (clients must then send it as the x-terminal-token header).
const terminalAllowed = process.env.NODE_ENV !== 'production' || process.env.ENABLE_TERMINAL === 'true';
app.use('/api/terminal', (req, res, next) => {
  if (!terminalAllowed) return res.status(403).json({ error: 'Terminal is disabled on this server' });
  const token = process.env.TERMINAL_TOKEN;
  if (token && req.header('x-terminal-token') !== token) {
    return res.status(401).json({ error: 'Terminal token required' });
  }
  next();
});

// Setup terminal sandbox directory
const sandboxDir = path.resolve(__dirname, 'terminal_sandbox');
if (!fs.existsSync(sandboxDir)) {
  fs.mkdirSync(sandboxDir, { recursive: true });
}
if (!fs.existsSync(path.join(sandboxDir, 'package.json'))) {
  fs.writeFileSync(path.join(sandboxDir, 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2));
}
if (!fs.existsSync(path.join(sandboxDir, 'hello.py'))) {
  fs.writeFileSync(
    path.join(sandboxDir, 'hello.py'),
    `# Python 3 in ALI Phone Terminal
import sys
import platform
import math

print("🐍 Python 3 on ALI Phone (iPhone 16 Pro Max - A18 Pro)")
print(f"Version: {sys.version.split()[0]}")
print(f"Platform: {platform.system()} {platform.machine()}")
print(f"Calculated Pi: {math.pi:.6f}")

numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squares = [x**2 for x in numbers]
print(f"Squares: {squares}")
`
  );

  fs.writeFileSync(
    path.join(sandboxDir, 'app.js'),
    `// Node.js script on ALI Phone
console.log("🟢 Node.js v" + process.version + " running on ALI Phone A18 Pro");
const os = require('os');
console.log("Arch: " + os.arch() + " | Free Mem: " + Math.round(os.freemem() / 1024 / 1024) + " MB");
const greetings = ["درود بر شما", "Hello World", "مرحبا", "Bonjour"];
console.log("Random greeting: " + greetings[Math.floor(Math.random() * greetings.length)]);
`
  );

  fs.writeFileSync(
    path.join(sandboxDir, 'system_info.sh'),
    `#!/bin/bash
echo "📱 ALI Phone Terminal Shell"
echo "Kernel: $(uname -s -r)"
echo "Date & Time: $(date)"
echo "Directory: $(pwd)"
echo "Available files:"
ls -lh
`
  );
}

// -----------------------------------------------------------------------------
// Terminal & Execution Endpoints (Python 3, Node.js, Shell, Any File)
// -----------------------------------------------------------------------------
app.post('/api/terminal/exec', async (req, res) => {
  try {
    const { command, language, code, fileName } = req.body;
    const startTime = Date.now();

    let cmdToRun = command;

    if (code) {
      const ext = language === 'python' ? '.py' : language === 'node' ? '.js' : '.sh';
      const targetFile = fileName || `temp_run_${Date.now()}${ext}`;
      const filePath = path.join(sandboxDir, targetFile);
      fs.writeFileSync(filePath, code, 'utf8');

      if (language === 'python') {
        cmdToRun = `python3 "${targetFile}"`;
      } else if (language === 'node') {
        cmdToRun = `node "${targetFile}"`;
      } else {
        cmdToRun = `bash "${targetFile}"`;
      }
    }

    if (!cmdToRun) {
      return res.status(400).json({ error: 'Command or code is required' });
    }

    exec(
      cmdToRun,
      {
        cwd: sandboxDir,
        timeout: 20000,
        maxBuffer: 2 * 1024 * 1024,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          NODE_ENV: 'development',
        },
      },
      (error, stdout, stderr) => {
        const executionTimeMs = Date.now() - startTime;
        return res.json({
          command: cmdToRun,
          stdout: stdout || '',
          stderr: stderr || (error ? error.message : ''),
          exitCode: error ? error.code || 1 : 0,
          executionTimeMs,
        });
      }
    );
  } catch (err: any) {
    return res.status(500).json({
      error: 'Execution failed',
      details: err.message,
    });
  }
});

// List files in sandbox
app.get('/api/terminal/files', (req, res) => {
  try {
    if (!fs.existsSync(sandboxDir)) {
      return res.json({ files: [] });
    }
    const fileNames = fs.readdirSync(sandboxDir);
    const files = fileNames.map((name) => {
      const stat = fs.statSync(path.join(sandboxDir, name));
      return {
        name,
        size: stat.size,
        updatedAt: stat.mtime.toISOString(),
        isDirectory: stat.isDirectory(),
      };
    });
    return res.json({ files });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Read file content
app.get('/api/terminal/file', (req, res) => {
  try {
    const { name } = req.query;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'File name is required' });
    }
    const safeName = path.basename(name);
    const filePath = path.join(sandboxDir, safeName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return res.json({ name: safeName, content });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Save or create file in sandbox
app.post('/api/terminal/file', (req, res) => {
  try {
    const { name, content } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'File name is required' });
    }
    const safeName = path.basename(name);
    const filePath = path.join(sandboxDir, safeName);
    fs.writeFileSync(filePath, content || '', 'utf8');
    return res.json({ success: true, name: safeName });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete file
app.delete('/api/terminal/file', (req, res) => {
  try {
    const { name } = req.query;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'File name is required' });
    }
    const safeName = path.basename(name);
    const filePath = path.join(sandboxDir, safeName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return res.json({ success: true, name: safeName });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// Safari Web Proxy & Live Search Endpoint
// -----------------------------------------------------------------------------
app.get('/api/safari/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const parsed = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    if (!/^https?:$/.test(parsed.protocol) || /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.0\.0\.0|\[?::1)/i.test(parsed.hostname)) {
      return res.status(400).send('Blocked address');
    }
    const response = await fetch(parsed.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    const contentType = response.headers.get('content-type') || 'text/html';
    let body = await response.text();

    // Inject base href so relative images/scripts load properly
    if (contentType.includes('text/html')) {
      const baseTag = `<base href="${parsed.origin}/">`;
      body = body.replace(/<head[^>]*>/i, `$&${baseTag}`);
    }

    res.setHeader('Content-Type', contentType);
    // Allow iframe embedding from our dev site
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    return res.send(body);
  } catch (error: any) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head><meta charset="UTF-8"><style>body{background:#000;color:#fff;font-family:sans-serif;padding:24px;text-align:center;}a{color:#38bdf8;}</style></head>
      <body>
        <h3>خطا در بارگذاری صفحه از طریق پروکسی سافاری</h3>
        <p style="color:#aaa;font-size:12px;">${error.message}</p>
        <p><a href="${req.query.url}" target="_blank">باز کردن مستقیم در تب جدید</a></p>
      </body>
      </html>
    `);
  }
});

// Vite Middleware for dev or static serving for prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(
      express.static(path.resolve(__dirname, 'dist'), {
        setHeaders: (res, file) => {
          if (file.endsWith('sw.js') || file.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
          if (file.endsWith('.webmanifest')) res.setHeader('Content-Type', 'application/manifest+json');
          if (/\/assets\//.test(file)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        },
      })
    );
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ALI phone server running at http://0.0.0.0:${port}`);
  });
}

startServer();
