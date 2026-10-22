import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  Trash2,
  FileCode,
  FolderPlus,
  Upload,
  Download,
  Copy,
  Check,
  Cpu,
  Layers,
  Sparkles,
  Save,
  Search,
  Code2,
  HardDrive,
  Clock,
  Server,
  Zap,
} from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface TerminalAppProps {
  soundEnabled: boolean;
}

interface SandboxFile {
  name: string;
  size: number;
  updatedAt: string;
  isDirectory?: boolean;
}

const PYTHON_TEMPLATES = [
  {
    name: 'محاسبات ریاضی و آمار (Math & Stats)',
    fileName: 'math_demo.py',
    code: `# Python 3 - Math & Statistics on ALI Phone (A18 Pro)
import math
import statistics

print("====================================")
print("🚀 Python 3 Data Cruncher on ALI Phone")
print("====================================")

# Mathematical calculations
radius = 7.5
area = math.pi * (radius ** 2)
circumference = 2 * math.pi * radius

print(f"شعاع دایره: {radius} cm")
print(f"مساحت دایره: {area:.4f} cm²")
print(f"محیط دایره: {circumference:.4f} cm")

# Statistics
scores = [18.5, 19.25, 20, 17, 19.75, 16.5, 20, 18.75]
print("\\nنمرات آزمون:")
print(f"میانگین: {statistics.mean(scores):.2f}")
print(f"میانه: {statistics.median(scores):.2f}")
print(f"واریانس: {statistics.variance(scores):.4f}")
print(f"حداکثر نمره: {max(scores)}")
print("✅ اجرای پایتون ۳ با موفقیت به پایان رسید.")
`,
  },
  {
    name: 'تحلیل متن و فرکانس کلمات (Text Analysis)',
    fileName: 'word_freq.py',
    code: `# Text Analysis & Frequency in Python 3
from collections import Counter
import re

text = """
گوشی هوشمند علی‌فون مجهز به چیپ قدرتمند A18 Pro و بدنه تیتانیوم گرید ۵ است.
این گوشی از استریم ابری اندروید، پایتون ۳، نود جی‌اس و تقویم فارسی پشتیبانی می‌کند.
پایتون و نود جی‌اس به صورت بومی روی سیستم اجرا می‌شوند.
"""

words = re.findall(r'\\b\\w+\\b', text)
freq = Counter(words)

print("📊 تحلیل بسامد کلمات فارسی در متن:")
for word, count in freq.most_common(6):
    print(f"  • {word}: {count} بار")

print(f"\\nکل واژگان متن: {len(words)} کلمه")
`,
  },
  {
    name: 'تولید هش و رمزنگاری (Crypto & Hashes)',
    fileName: 'crypto_hashes.py',
    code: `# Cryptographic Hashes in Python
import hashlib
import time

message = "ALI phone Titanium Pro Max 2026"
print(f"پیام ورودی: {message}")

sha256_hash = hashlib.sha256(message.encode()).hexdigest()
md5_hash = hashlib.md5(message.encode()).hexdigest()
sha3_hash = hashlib.sha3_256(message.encode()).hexdigest()

print(f"SHA-256: {sha256_hash}")
print(f"MD5:     {md5_hash}")
print(f"SHA3-256:{sha3_hash}")
print(f"تایم‌استمپ: {time.time()}")
`,
  },
];

const NODE_TEMPLATES = [
  {
    name: 'مشخصات سرور و حافظه (System Stats)',
    fileName: 'system_stats.js',
    code: `// Node.js System Stats on ALI Phone
const os = require('os');

console.log("🟢 Node.js v" + process.version + " Runtime Engine");
console.log("-----------------------------------------");
console.log("Architecture:    " + os.arch());
console.log("Platform:        " + os.platform());
console.log("Total Memory:    " + (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB");
console.log("Free Memory:     " + (os.freemem() / 1024 / 1024).toFixed(2) + " MB");
console.log("CPU Cores:       " + os.cpus().length);
console.log("System Uptime:   " + (os.uptime() / 3600).toFixed(2) + " hours");
console.log("-----------------------------------------");
console.log("✅ Node.js process executed successfully.");
`,
  },
  {
    name: 'تولید توکن و داده‌های JSON (JSON Generator)',
    fileName: 'data_gen.js',
    code: `// JSON Generation & Crypto Token in Node.js
const crypto = require('crypto');

const products = [
  { id: "PROD-101", name: "iPhone 16 Pro Max Desert Titanium", price: 1299 },
  { id: "PROD-102", name: "Apple A18 Pro Bionic Silicon", price: 450 },
  { id: "PROD-103", name: "AirPods Pro 2 USB-C", price: 249 }
];

const payload = {
  token: crypto.randomBytes(16).toString('hex'),
  generatedAt: new Date().toISOString(),
  device: "ALI phone",
  totalItems: products.length,
  items: products
};

console.log("📦 Generated JSON Payload:");
console.log(JSON.stringify(payload, null, 2));
`,
  },
];

export const TerminalApp: React.FC<TerminalAppProps> = ({ soundEnabled }) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'python' | 'node' | 'files'>('terminal');

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<Array<{ id: string; type: 'cmd' | 'out' | 'err' | 'info'; text: string; time?: string }>>([
    { id: '1', type: 'info', text: 'ALI Phone UNIX Terminal [A18 Pro Silicon Environment]' },
    { id: '2', type: 'info', text: 'Pre-installed: Python 3.10.12, Node.js v22.23.3, Bash 5.1' },
    { id: '3', type: 'out', text: 'Type "python3 --version", "node -v", "ls -la", "help", or click templates.' },
  ]);
  const [commandInput, setCommandInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalScrollRef = useRef<HTMLDivElement>(null);

  // Command history buffer for arrow up/down
  const [commandHistoryList, setCommandHistoryList] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Python Studio state
  const [pythonCode, setPythonCode] = useState(PYTHON_TEMPLATES[0].code);
  const [pythonFileName, setPythonFileName] = useState(PYTHON_TEMPLATES[0].fileName);
  const [pythonOutput, setPythonOutput] = useState<string>('');
  const [pythonExecTime, setPythonExecTime] = useState<number | null>(null);

  // Node Studio state
  const [nodeCode, setNodeCode] = useState(NODE_TEMPLATES[0].code);
  const [nodeFileName, setNodeFileName] = useState(NODE_TEMPLATES[0].fileName);
  const [nodeOutput, setNodeOutput] = useState<string>('');
  const [nodeExecTime, setNodeExecTime] = useState<number | null>(null);

  // Files manager state
  const [sandboxFiles, setSandboxFiles] = useState<SandboxFile[]>([]);
  const [selectedFileContent, setSelectedFileContent] = useState<{ name: string; content: string } | null>(null);
  const [newFileNameInput, setNewFileNameInput] = useState('');
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const [statusNotice, setStatusNotice] = useState('');

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  // Load sandbox files
  const loadFiles = async () => {
    try {
      const res = await fetch('/api/terminal/files');
      const data = await res.json();
      if (data.files) {
        setSandboxFiles(data.files);
      }
    } catch {}
  };

  useEffect(() => {
    loadFiles();
  }, [activeTab]);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(''), 3000);
  };

  // Run shell command in terminal
  const handleExecuteCommand = async (cmdToRun?: string) => {
    const raw = (cmdToRun || commandInput).trim();
    if (!raw) return;

    soundEffects.click(soundEnabled);
    const cmdId = Date.now().toString();

    // Clear command
    if (raw.toLowerCase() === 'clear' || raw.toLowerCase() === 'cls') {
      setTerminalHistory([]);
      setCommandInput('');
      return;
    }

    // Help command
    if (raw.toLowerCase() === 'help') {
      setTerminalHistory((prev) => [
        ...prev,
        { id: cmdId, type: 'cmd', text: raw },
        {
          id: cmdId + '_help',
          type: 'info',
          text: `دستورات کاربردی ترمینال علی‌فون:
  python3 <file.py>       - اجرای اسکریپت پایتون
  python3 -c "code"       - اجرای یک خط کد پایتون
  pip install <package>   - نصب پکیج‌های پایتون
  node <file.js>          - اجرای اسکریپت Node.js
  node -e "code"          - اجرای سریع کد جاوااسکریپت
  npm install <package>   - نصب پکیج‌های npm
  ls -lh                  - لیست فایل‌ها و پوشه‌ها
  cat <filename>          - نمایش محتوای فایل
  mkdir <dirname>         - ایجاد پوشه
  rm <filename>           - حذف فایل
  pwd / uname -a / date   - اطلاعات سیستم و زمان
  clear                   - پاکسازی صفحه ترمینال`,
        },
      ]);
      setCommandInput('');
      return;
    }

    setTerminalHistory((prev) => [...prev, { id: cmdId, type: 'cmd', text: raw }]);
    setCommandHistoryList((prev) => [raw, ...prev]);
    setHistoryIndex(-1);
    setCommandInput('');
    setIsExecuting(true);

    try {
      const res = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: raw }),
      });
      const data = await res.json();

      setIsExecuting(false);
      soundEffects.notification(soundEnabled);

      if (data.stdout) {
        setTerminalHistory((prev) => [...prev, { id: cmdId + '_out', type: 'out', text: data.stdout.trimEnd() }]);
      }
      if (data.stderr) {
        setTerminalHistory((prev) => [
          ...prev,
          { id: cmdId + '_err', type: data.exitCode === 0 ? 'info' : 'err', text: data.stderr.trimEnd() },
        ]);
      }
      if (!data.stdout && !data.stderr) {
        setTerminalHistory((prev) => [...prev, { id: cmdId + '_ok', type: 'info', text: `[OK] Exit code: ${data.exitCode} (${data.executionTimeMs}ms)` }]);
      }
      loadFiles();
    } catch (err: any) {
      setIsExecuting(false);
      setTerminalHistory((prev) => [...prev, { id: cmdId + '_neterr', type: 'err', text: `Error: ${err.message}` }]);
    }
  };

  // Run Python Code
  const handleRunPythonCode = async () => {
    soundEffects.click(soundEnabled);
    setIsExecuting(true);
    setPythonOutput('در حال اجرای پایتون ۳ (Python 3.10.12)...');

    try {
      const res = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'python',
          code: pythonCode,
          fileName: pythonFileName || 'script.py',
        }),
      });
      const data = await res.json();
      setIsExecuting(false);
      soundEffects.notification(soundEnabled);
      setPythonExecTime(data.executionTimeMs);

      let result = '';
      if (data.stdout) result += data.stdout;
      if (data.stderr) result += (result ? '\n[STDERR]:\n' : '') + data.stderr;
      if (!result) result = 'کد بدون خروجی اجرا شد (کد خروج ۰).';
      setPythonOutput(result);
      loadFiles();
    } catch (err: any) {
      setIsExecuting(false);
      setPythonOutput(`خطا در ارتباط با مفسر پایتون: ${err.message}`);
    }
  };

  // Run Node.js Code
  const handleRunNodeCode = async () => {
    soundEffects.click(soundEnabled);
    setIsExecuting(true);
    setNodeOutput('در حال اجرای Node.js v22...');

    try {
      const res = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'node',
          code: nodeCode,
          fileName: nodeFileName || 'index.js',
        }),
      });
      const data = await res.json();
      setIsExecuting(false);
      soundEffects.notification(soundEnabled);
      setNodeExecTime(data.executionTimeMs);

      let result = '';
      if (data.stdout) result += data.stdout;
      if (data.stderr) result += (result ? '\n[STDERR]:\n' : '') + data.stderr;
      if (!result) result = 'کد بدون خروجی اجرا شد (کد خروج ۰).';
      setNodeOutput(result);
      loadFiles();
    } catch (err: any) {
      setIsExecuting(false);
      setNodeOutput(`خطا در اجرای Node.js: ${err.message}`);
    }
  };

  // Save / Upload File
  const handleSaveCurrentFile = async (name: string, content: string) => {
    soundEffects.click(soundEnabled);
    try {
      await fetch('/api/terminal/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content }),
      });
      showNotice(`فایل ${name} ذخیره شد.`);
      loadFiles();
    } catch {
      showNotice('خطا در ذخیره فایل');
    }
  };

  // Upload file from computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.click(soundEnabled);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target?.result as string;
      await handleSaveCurrentFile(file.name, content);
      showNotice(`فایل ${file.name} در کانتینر بارگذاری شد.`);
    };
    reader.readAsText(file);
  };

  // Read and view file
  const handleViewFile = async (fileName: string) => {
    soundEffects.click(soundEnabled);
    try {
      const res = await fetch(`/api/terminal/file?name=${encodeURIComponent(fileName)}`);
      const data = await res.json();
      if (data.content !== undefined) {
        setSelectedFileContent({ name: fileName, content: data.content });
      }
    } catch {}
  };

  // Delete file
  const handleDeleteFile = async (fileName: string) => {
    soundEffects.click(soundEnabled);
    try {
      await fetch(`/api/terminal/file?name=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });
      showNotice(`فایل ${fileName} حذف شد.`);
      if (selectedFileContent?.name === fileName) {
        setSelectedFileContent(null);
      }
      loadFiles();
    } catch {}
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white select-none">
      {/* Top Header Bar */}
      <div className="pt-13 px-4 pb-2 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
            <TerminalIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">ترمینال و اجرای کد (Terminal)</h1>
            <p className="text-[10px] text-neutral-400 font-mono">Python 3 · Node.js · Shell Engine</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          A18 Pro KVM
        </span>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1.5 bg-neutral-900 border-b border-neutral-800 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'terminal' ? 'bg-purple-600 text-white font-bold shadow-md' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <TerminalIcon className="w-3.5 h-3.5" />
          <span>خط فرمان (Bash)</span>
        </button>
        <button
          onClick={() => setActiveTab('python')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'python' ? 'bg-emerald-600 text-white font-bold shadow-md' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>پایتون ۳ (Python)</span>
        </button>
        <button
          onClick={() => setActiveTab('node')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'node' ? 'bg-amber-600 text-black font-bold shadow-md' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>نود جی‌اس (Node.js)</span>
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'files' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>مدیر فایل‌ها ({sandboxFiles.length})</span>
        </button>
      </div>

      {/* Notice Banner */}
      {statusNotice && (
        <div className="mx-4 mt-2 p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs flex items-center gap-2">
          <Check className="w-3.5 h-3.5" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================================================================== */}
        {/* TAB 1: BASH / UNIX TERMINAL                                        */}
        {/* ================================================================== */}
        {activeTab === 'terminal' && (
          <div className="space-y-3">
            {/* Quick Command Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[10px] font-mono">
              <button
                onClick={() => handleExecuteCommand('python3 --version')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 shrink-0"
              >
                python3 --version
              </button>
              <button
                onClick={() => handleExecuteCommand('node -v')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 shrink-0"
              >
                node -v
              </button>
              <button
                onClick={() => handleExecuteCommand('ls -lh')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 shrink-0"
              >
                ls -lh
              </button>
              <button
                onClick={() => handleExecuteCommand('python3 hello.py')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shrink-0"
              >
                python3 hello.py
              </button>
              <button
                onClick={() => handleExecuteCommand('node app.js')}
                className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 shrink-0"
              >
                node app.js
              </button>
              <button
                onClick={() => handleExecuteCommand('uname -a')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 shrink-0"
              >
                uname -a
              </button>
              <button
                onClick={() => handleExecuteCommand('help')}
                className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 shrink-0"
              >
                help (راهنما)
              </button>
            </div>

            {/* Terminal Window */}
            <div
              ref={terminalScrollRef}
              className="h-[390px] rounded-2xl bg-black border border-neutral-800 p-3 font-mono text-[11px] overflow-y-auto space-y-1.5 text-left dir-ltr shadow-inner"
            >
              {terminalHistory.map((log) => (
                <div key={log.id} className="leading-relaxed">
                  {log.type === 'cmd' ? (
                    <div className="text-purple-400 font-bold flex items-center gap-1.5">
                      <span className="text-emerald-400">ali@iphone16pro:~$</span>
                      <span>{log.text}</span>
                    </div>
                  ) : log.type === 'err' ? (
                    <div className="text-rose-400 whitespace-pre-wrap">{log.text}</div>
                  ) : log.type === 'info' ? (
                    <div className="text-yellow-400/90 whitespace-pre-wrap text-[10px]">{log.text}</div>
                  ) : (
                    <div className="text-neutral-200 whitespace-pre-wrap">{log.text}</div>
                  )}
                </div>
              ))}
              {isExecuting && (
                <div className="text-purple-400 animate-pulse text-[10px]">
                  [Running command...]
                </div>
              )}
            </div>

            {/* Interactive Shell Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteCommand();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-mono">
                <span className="text-emerald-400 font-bold">$</span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp' && commandHistoryList.length > 0) {
                      const next = Math.min(historyIndex + 1, commandHistoryList.length - 1);
                      setHistoryIndex(next);
                      setCommandInput(commandHistoryList[next]);
                    } else if (e.key === 'ArrowDown' && historyIndex >= 0) {
                      const prev = historyIndex - 1;
                      setHistoryIndex(prev);
                      setCommandInput(prev >= 0 ? commandHistoryList[prev] : '');
                    }
                  }}
                  placeholder="دستور شل یا پایتون را تایپ کنید (مثلاً: python3 -c 'print(5+5)')..."
                  className="w-full bg-transparent text-white placeholder-neutral-500 focus:outline-none font-mono text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={isExecuting}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>اجرا</span>
              </button>
            </form>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: PYTHON 3 STUDIO                                             */}
        {/* ================================================================== */}
        {activeTab === 'python' && (
          <div className="space-y-3">
            {/* Template Selector & Controls */}
            <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400 text-[11px]">قالب‌ها:</span>
                <select
                  onChange={(e) => {
                    const found = PYTHON_TEMPLATES.find((t) => t.fileName === e.target.value);
                    if (found) {
                      setPythonCode(found.code);
                      setPythonFileName(found.fileName);
                    }
                  }}
                  className="bg-neutral-800 border border-neutral-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  {PYTHON_TEMPLATES.map((t) => (
                    <option key={t.fileName} value={t.fileName}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSaveCurrentFile(pythonFileName, pythonCode)}
                  className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 border border-neutral-700"
                  title="ذخیره در فایل‌های کانتینر"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ذخیره فایل</span>
                </button>
                <button
                  onClick={handleRunPythonCode}
                  disabled={isExecuting}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>اجرای پایتون ۳</span>
                </button>
              </div>
            </div>

            {/* Python Code Editor */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-lg flex flex-col">
              <div className="bg-neutral-800/80 px-3 py-1.5 border-b border-neutral-700/60 flex items-center justify-between text-[11px] text-neutral-300">
                <span className="font-mono text-emerald-400 flex items-center gap-1">
                  <span>🐍</span>
                  <input
                    type="text"
                    value={pythonFileName}
                    onChange={(e) => setPythonFileName(e.target.value)}
                    className="bg-transparent text-emerald-400 font-bold focus:outline-none w-28"
                  />
                </span>
                <span className="font-mono text-neutral-400 text-[10px]">Python 3.10 · UTF-8</span>
              </div>
              <textarea
                value={pythonCode}
                onChange={(e) => setPythonCode(e.target.value)}
                rows={11}
                className="w-full bg-black/80 text-emerald-300 font-mono text-[11px] p-3 focus:outline-none resize-none leading-relaxed dir-ltr text-left"
                spellCheck={false}
              />
            </div>

            {/* Python Execution Output Terminal Box */}
            {pythonOutput && (
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-md space-y-1">
                <div className="bg-neutral-800/70 px-3 py-1 flex items-center justify-between text-[10px] text-neutral-400">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>خروجی استاندارد (stdout/stderr)</span>
                  </span>
                  {pythonExecTime !== null && (
                    <span className="font-mono text-emerald-400">{pythonExecTime}ms</span>
                  )}
                </div>
                <pre className="p-3 bg-black text-neutral-200 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap text-left dir-ltr max-h-[180px]">
                  {pythonOutput}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: NODE.JS STUDIO                                              */}
        {/* ================================================================== */}
        {activeTab === 'node' && (
          <div className="space-y-3">
            {/* Template Selector & Controls */}
            <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400 text-[11px]">قالب‌ها:</span>
                <select
                  onChange={(e) => {
                    const found = NODE_TEMPLATES.find((t) => t.fileName === e.target.value);
                    if (found) {
                      setNodeCode(found.code);
                      setNodeFileName(found.fileName);
                    }
                  }}
                  className="bg-neutral-800 border border-neutral-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  {NODE_TEMPLATES.map((t) => (
                    <option key={t.fileName} value={t.fileName}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSaveCurrentFile(nodeFileName, nodeCode)}
                  className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 border border-neutral-700"
                  title="ذخیره فایل"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>ذخیره فایل</span>
                </button>
                <button
                  onClick={handleRunNodeCode}
                  disabled={isExecuting}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>اجرای Node.js</span>
                </button>
              </div>
            </div>

            {/* Node Code Editor */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-lg flex flex-col">
              <div className="bg-neutral-800/80 px-3 py-1.5 border-b border-neutral-700/60 flex items-center justify-between text-[11px] text-neutral-300">
                <span className="font-mono text-amber-400 flex items-center gap-1">
                  <span>🟢</span>
                  <input
                    type="text"
                    value={nodeFileName}
                    onChange={(e) => setNodeFileName(e.target.value)}
                    className="bg-transparent text-amber-400 font-bold focus:outline-none w-28"
                  />
                </span>
                <span className="font-mono text-neutral-400 text-[10px]">Node.js v22 · V8 Engine</span>
              </div>
              <textarea
                value={nodeCode}
                onChange={(e) => setNodeCode(e.target.value)}
                rows={11}
                className="w-full bg-black/80 text-amber-300 font-mono text-[11px] p-3 focus:outline-none resize-none leading-relaxed dir-ltr text-left"
                spellCheck={false}
              />
            </div>

            {/* Node Execution Output Box */}
            {nodeOutput && (
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-md space-y-1">
                <div className="bg-neutral-800/70 px-3 py-1 flex items-center justify-between text-[10px] text-neutral-400">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Check className="w-3 h-3 text-amber-400" />
                    <span>خروجی Node.js</span>
                  </span>
                  {nodeExecTime !== null && (
                    <span className="font-mono text-amber-400">{nodeExecTime}ms</span>
                  )}
                </div>
                <pre className="p-3 bg-black text-neutral-200 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap text-left dir-ltr max-h-[180px]">
                  {nodeOutput}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: FILE MANAGER (Run any file)                                 */}
        {/* ================================================================== */}
        {activeTab === 'files' && (
          <div className="space-y-4">
            {/* File Actions Bar */}
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span>فایل‌های کانتینر ذخیره‌سازی علی‌فون</span>
                </h4>
                <button
                  onClick={() => fileUploadRef.current?.click()}
                  className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>بارگذاری هر نوع فایل</span>
                </button>
              </div>
              <input
                ref={fileUploadRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Create new file row */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newFileNameInput}
                  onChange={(e) => setNewFileNameInput(e.target.value)}
                  placeholder="نام فایل جدید (مثلاً: test.py یا script.js)..."
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
                />
                <button
                  onClick={() => {
                    if (newFileNameInput.trim()) {
                      handleSaveCurrentFile(newFileNameInput.trim(), '# فایل جدید در علی‌فون\n');
                      setNewFileNameInput('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700"
                >
                  ایجاد
                </button>
              </div>
            </div>

            {/* File List */}
            <div className="space-y-2">
              {sandboxFiles.map((f) => (
                <div
                  key={f.name}
                  className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-center justify-between text-xs gap-2"
                >
                  <div
                    onClick={() => handleViewFile(f.name)}
                    className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                  >
                    <span className="p-2 rounded-xl bg-neutral-800 text-base">
                      {f.name.endsWith('.py')
                        ? '🐍'
                        : f.name.endsWith('.js')
                        ? '🟢'
                        : f.name.endsWith('.sh')
                        ? '💻'
                        : f.name.endsWith('.json')
                        ? '📋'
                        : '📄'}
                    </span>
                    <div className="truncate">
                      <p className="font-bold text-white font-mono truncate">{f.name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {(f.size / 1024).toFixed(1)} KB · {f.updatedAt.split('T')[0]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Run Button */}
                    <button
                      onClick={() => {
                        if (f.name.endsWith('.py')) {
                          handleExecuteCommand(`python3 ${f.name}`);
                          setActiveTab('terminal');
                        } else if (f.name.endsWith('.js')) {
                          handleExecuteCommand(`node ${f.name}`);
                          setActiveTab('terminal');
                        } else if (f.name.endsWith('.sh')) {
                          handleExecuteCommand(`bash ${f.name}`);
                          setActiveTab('terminal');
                        } else {
                          handleExecuteCommand(`cat ${f.name}`);
                          setActiveTab('terminal');
                        }
                      }}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 border border-emerald-500/40"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>اجرا</span>
                    </button>

                    <button
                      onClick={() => handleDeleteFile(f.name)}
                      className="p-1.5 rounded-xl bg-neutral-800 hover:bg-rose-900/40 text-neutral-400 hover:text-rose-400"
                      title="حذف فایل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* File Viewer / Editor Modal if selected */}
            {selectedFileContent && (
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold font-mono text-cyan-400">{selectedFileContent.name}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSaveCurrentFile(selectedFileContent.name, selectedFileContent.content)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-[11px] flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>ذخیره</span>
                    </button>
                    <button
                      onClick={() => setSelectedFileContent(null)}
                      className="px-2 py-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-[11px]"
                    >
                      بستن
                    </button>
                  </div>
                </div>
                <textarea
                  value={selectedFileContent.content}
                  onChange={(e) => setSelectedFileContent({ ...selectedFileContent, content: e.target.value })}
                  rows={8}
                  className="w-full bg-black text-neutral-200 font-mono text-[11px] p-2.5 rounded-xl border border-neutral-800 focus:outline-none resize-none dir-ltr text-left"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
