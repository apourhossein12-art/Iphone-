import React, { useState, useRef } from 'react';
import {
  Search,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Share2,
  Bookmark,
  ShieldCheck,
  ExternalLink,
  Globe,
  Compass,
  Plus,
  X,
  Layers,
  BookOpen,
  Code2,
  History,
  Lock,
  ChevronDown,
  Sparkles,
  Check,
} from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface SafariAppProps {
  initialUrl?: string;
  soundEnabled: boolean;
}

interface TabItem {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isPrivate?: boolean;
}

const DEFAULT_BOOKMARKS = [
  { title: 'Google Search', url: 'https://www.google.com/search?igu=1', icon: '🔍' },
  { title: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: '🦆' },
  { title: 'ویکی‌پدیا فارسی', url: 'https://fa.m.wikipedia.org', icon: '📚' },
  { title: 'ماهواره و آب‌وهوای زمین', url: 'https://zoom.earth', icon: '🌍' },
  { title: 'ماشین‌حساب نمودار Desmos', url: 'https://www.desmos.com/calculator', icon: '📈' },
  { title: 'اخبار فناوری و کدنویسی', url: 'https://news.ycombinator.com', icon: '💻' },
  { title: 'گیت‌هاب (GitHub)', url: 'https://github.com', icon: '🐙' },
];

export const SafariApp: React.FC<SafariAppProps> = ({
  initialUrl = 'https://duckduckgo.com',
  soundEnabled,
}) => {
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: 'tab-1', title: 'DuckDuckGo Search', url: 'https://duckduckgo.com', favicon: '🦆' },
    { id: 'tab-2', title: 'ویکی‌پدیا دانشنامه آزاد', url: 'https://fa.m.wikipedia.org', favicon: '📚' },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [isTabOverviewOpen, setIsTabOverviewOpen] = useState(false);
  const [isPrivateMode, setIsPrivateMode] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const [urlInput, setUrlInput] = useState(activeTab?.url || initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [isReaderMode, setIsReaderMode] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<Array<{ title: string; url: string; time: string }>>([
    { title: 'DuckDuckGo Search', url: 'https://duckduckgo.com', time: 'امروز ۱۲:۳۰' },
    { title: 'ویکی‌پدیا فارسی', url: 'https://fa.m.wikipedia.org', time: 'امروز ۱۰:۱۵' },
  ]);
  const [notice, setNotice] = useState('');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleNavigate = (targetUrl: string) => {
    soundEffects.click(soundEnabled);
    let formatted = targetUrl.trim();

    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      if (formatted.includes('.') && !formatted.includes(' ')) {
        formatted = `https://${formatted}`;
      } else {
        formatted = `https://duckduckgo.com/?q=${encodeURIComponent(formatted)}`;
      }
    }

    setUrlInput(formatted);
    setIsLoading(true);

    // Update active tab
    const updatedTabs = tabs.map((t) => {
      if (t.id === activeTabId) {
        return {
          ...t,
          url: formatted,
          title: formatted.replace(/^https?:\/\//, '').split('/')[0],
        };
      }
      return t;
    });
    setTabs(updatedTabs);

    if (!isPrivateMode) {
      setHistoryList((prev) => [
        { title: formatted.replace(/^https?:\/\//, '').split('/')[0], url: formatted, time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) },
        ...prev.slice(0, 30),
      ]);
    }

    setTimeout(() => setIsLoading(false), 700);
  };

  const handleReload = () => {
    soundEffects.click(soundEnabled);
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = activeTab.url;
    }
    setTimeout(() => setIsLoading(false), 600);
  };

  const handleCreateNewTab = (customUrl = 'https://duckduckgo.com') => {
    soundEffects.click(soundEnabled);
    const newId = `tab-${Date.now()}`;
    const newTab: TabItem = {
      id: newId,
      title: 'صفحه جدید',
      url: customUrl,
      isPrivate: isPrivateMode,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setUrlInput(customUrl);
    setIsTabOverviewOpen(false);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.click(soundEnabled);
    if (tabs.length === 1) {
      // Keep at least one tab
      handleCreateNewTab();
    }
    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id && filtered.length > 0) {
      setActiveTabId(filtered[0].id);
      setUrlInput(filtered[0].url);
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white select-none">
      {/* Top Address & Navigation Bar (Authentic iOS 18 Safari styling) */}
      <div className={`pt-13 px-4 pb-2 border-b border-neutral-800 space-y-2 transition-colors ${isPrivateMode ? 'bg-neutral-900' : 'bg-neutral-900/90'}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNavigate(urlInput);
          }}
          className="relative flex items-center gap-1.5"
        >
          {/* Reader Mode / AA toggle */}
          <button
            type="button"
            onClick={() => {
              soundEffects.click(soundEnabled);
              setIsReaderMode(!isReaderMode);
              showToast(isReaderMode ? 'حالت مطالعه غیرفعال شد' : 'حالت مطالعه فعال شد');
            }}
            className={`p-1.5 rounded-xl transition-colors ${isReaderMode ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'}`}
            title="نمای مطالعه (Reader Mode)"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* URL Input with Lock Icon */}
          <div className="relative flex-1 flex items-center">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-neutral-400">
              {isPrivateMode ? (
                <Lock className="w-3.5 h-3.5 text-purple-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="جستجو یا وارد کردن آدرس وب..."
              className="w-full bg-neutral-800 border border-neutral-700/80 rounded-2xl pr-8 pl-8 py-2 text-xs text-white placeholder-neutral-500 font-mono text-left focus:outline-none focus:border-blue-500"
              dir="ltr"
            />
            <button
              type="button"
              onClick={handleReload}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>

          {/* Tabs Switcher Button */}
          <button
            type="button"
            onClick={() => {
              soundEffects.click(soundEnabled);
              setIsTabOverviewOpen(!isTabOverviewOpen);
            }}
            className="w-7 h-7 rounded-lg border-2 border-neutral-600 hover:border-white flex items-center justify-center text-xs font-bold text-white shadow-sm"
          >
            {tabs.length}
          </button>
        </form>
      </div>

      {/* Floating Notice Toast */}
      {notice && (
        <div className="mx-4 mt-2 p-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs flex items-center gap-2 animate-fadeIn z-30">
          <Check className="w-3.5 h-3.5 text-blue-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB OVERVIEW GRID (iOS Safari Multitasking Card Switcher)            */}
      {/* ==================================================================== */}
      {isTabOverviewOpen ? (
        <div className="flex-1 bg-neutral-900 p-4 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPrivateMode(!isPrivateMode)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isPrivateMode
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {isPrivateMode ? 'حالت خصوصی (Private)' : 'حالت عادی'}
              </button>
            </div>
            <span className="text-xs text-neutral-400 font-mono">{tabs.length} تب باز</span>
          </div>

          {/* Tab Cards Grid */}
          <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto">
            {tabs.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  setActiveTabId(t.id);
                  setUrlInput(t.url);
                  setIsTabOverviewOpen(false);
                }}
                className={`h-40 rounded-2xl p-2.5 flex flex-col justify-between relative cursor-pointer transition-all border shadow-lg ${
                  activeTabId === t.id
                    ? 'bg-neutral-800 border-blue-500 ring-2 ring-blue-500/50'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white truncate max-w-[100px]">{t.title}</span>
                  <button
                    onClick={(e) => handleCloseTab(t.id, e)}
                    className="p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-rose-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[10px] text-neutral-500 font-mono truncate">{t.url}</div>
                <div className="w-full h-20 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center text-neutral-600 text-xl">
                  {t.favicon || '🌐'}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Controls: New Tab & Done */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
            <button
              onClick={() => handleCreateNewTab()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>تب جدید</span>
            </button>
            <button
              onClick={() => setIsTabOverviewOpen(false)}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold"
            >
              انجام شد
            </button>
          </div>
        </div>
      ) : isReaderMode ? (
        /* ==================================================================== */
        /* READER MODE (Clean Typography Article Reader)                        */
        /* ==================================================================== */
        <div className="flex-1 bg-neutral-950 text-neutral-200 p-6 overflow-y-auto space-y-4 leading-relaxed font-sans text-justify">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-base font-bold text-white leading-snug">{activeTab.title}</h2>
            <p className="text-xs text-neutral-500 font-mono mt-1">{activeTab.url}</p>
          </div>
          <p className="text-xs leading-relaxed text-neutral-300">
            حالت مطالعه سافاری در آیفون ۱۶ پرو مکس تبلیغات و محتوای اضافه را حذف کرده و متن صفحه را با فونت خوانا و زیبا ارائه می‌دهد. شما در حال مشاهده نسخه متنی این صفحه وب هستید.
          </p>
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs space-y-2">
            <h4 className="font-bold text-white">ویژگی‌های چیپ A18 Pro و سیستم سافاری:</h4>
            <p className="text-neutral-400">
              موتور رندرینگ بهینه‌سازی‌شده Apple WebKit با شتاب‌دهنده سخت‌افزاری گرافیکی و حافظه کش اختصاصی، بارگذاری صفحات را تا ۳ برابر سریع‌تر انجام می‌دهد.
            </p>
          </div>
          <button
            onClick={() => setIsReaderMode(false)}
            className="w-full py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
          >
            خروج از حالت مطالعه
          </button>
        </div>
      ) : isInspectorOpen ? (
        /* ==================================================================== */
        /* WEB INSPECTOR / DEVELOPER CONSOLE                                   */
        /* ==================================================================== */
        <div className="flex-1 bg-black p-4 font-mono text-xs overflow-y-auto space-y-3 text-left dir-ltr">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              <span>Safari Web Inspector</span>
            </span>
            <button
              onClick={() => setIsInspectorOpen(false)}
              className="text-neutral-400 hover:text-white"
            >
              بستن
            </button>
          </div>
          <div className="space-y-1 text-[11px] text-neutral-300">
            <p className="text-yellow-400">[DOM Loaded]: {activeTab.url}</p>
            <p className="text-emerald-400">[Status]: 200 OK · Protocol: HTTP/2</p>
            <p className="text-neutral-500">[User-Agent]: Mobile Safari / iPhone 16 Pro Max</p>
            <p className="text-neutral-500">[Viewport]: 390x844 @3x Retina Display</p>
          </div>
          <pre className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-cyan-300 text-[10px] overflow-x-auto">
{`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${activeTab.title}</title>
  <link rel="canonical" href="${activeTab.url}" />
</head>
<body>
  <!-- Web Content rendered via Safari Engine -->
  <div id="app-root">Content stream active.</div>
</body>
</html>`}
          </pre>
        </div>
      ) : (
        /* ==================================================================== */
        /* REAL WEB VIEWPORT (Using Direct / Proxy Viewer)                      */
        /* ==================================================================== */
        <div className="flex-1 relative bg-white overflow-hidden flex flex-col">
          {activeTab.url === 'https://duckduckgo.com' ||
          activeTab.url.includes('wikipedia') ||
          activeTab.url.includes('zoom.earth') ||
          activeTab.url.includes('desmos.com') ||
          activeTab.url.includes('google.com') ? (
            <iframe
              ref={iframeRef}
              src={activeTab.url}
              title="Safari Browser"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            /* Proxy loader or start page */
            <div className="h-full bg-neutral-950 text-white p-5 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
                    <Compass className="w-4 h-4" />
                    <span>صفحه شروع Safari (Start Page)</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">WebKit 605.1</span>
                </div>

                {/* Bookmarks Grid */}
                <div>
                  <h4 className="text-xs font-semibold text-neutral-400 mb-2.5">علاقه‌مندی‌ها و ابزارهای وب</h4>
                  <div className="grid grid-cols-4 gap-2.5 text-center">
                    {DEFAULT_BOOKMARKS.map((b, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleNavigate(b.url)}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors shadow-sm"
                      >
                        <span className="text-2xl">{b.icon}</span>
                        <span className="text-[10px] text-neutral-300 font-medium truncate w-full">{b.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Web Proxy View card */}
                <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>بارگذاری از طریق پروکسی وب سافاری</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">Proxy Ready</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    صفحه <span className="text-blue-400 font-mono">{activeTab.url}</span> بدون محدودیت X-Frame-Options از طریق پروکسی سرور بارگذاری می‌شود.
                  </p>
                  <button
                    onClick={() => {
                      const proxyUrl = `/api/safari/proxy?url=${encodeURIComponent(activeTab.url)}`;
                      if (iframeRef.current) {
                        iframeRef.current.src = proxyUrl;
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    بارگذاری صفحه با پروکسی سرور
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Safari Navigation Bar */}
      <div className="py-2.5 px-6 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-neutral-400 text-xs">
        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            showToast('بازگشت به صفحه قبل');
          }}
          className="p-1 hover:text-white"
          title="عقب"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            showToast('حرکت به صفحه بعد');
          }}
          className="p-1 hover:text-white"
          title="جلو"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            setIsInspectorOpen(!isInspectorOpen);
          }}
          className="p-1 hover:text-cyan-400"
          title="کنسول و بازرس وب (Inspector)"
        >
          <Code2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            showToast('آدرس کپی شد!');
          }}
          className="p-1 hover:text-white"
          title="اشتراک‌گذاری"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            setIsTabOverviewOpen(!isTabOverviewOpen);
          }}
          className="p-1 hover:text-white font-bold font-mono"
          title="مدیریت تب‌ها"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
