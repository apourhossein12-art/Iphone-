import React, { useState } from 'react';
import {
  Download,
  Check,
  Plus,
  Sparkles,
  ExternalLink,
  Layers,
  Globe,
  Package,
  Receipt,
  TrendingUp,
  Kanban,
  BarChart3,
  QrCode,
  Terminal,
  FileText,
  Trash2,
  Play,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { CustomApp } from '../../types/phone';
import { MARKETPLACE_TOOLS } from '../../utils/defaultData';
import { soundEffects } from '../../utils/soundEffects';

interface AppStoreAppProps {
  installedApps: CustomApp[];
  onInstallApp: (app: CustomApp) => void;
  onUninstallApp: (appId: string) => void;
  onLaunchApp: (appId: string) => void;
  soundEnabled: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Package,
  Receipt,
  TrendingUp,
  Kanban,
  BarChart3,
  QrCode,
  Terminal,
  FileText,
  Globe,
  Layers,
};

export const AppStoreApp: React.FC<AppStoreAppProps> = ({
  installedApps,
  onInstallApp,
  onUninstallApp,
  onLaunchApp,
  soundEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'featured' | 'custom' | 'installed'>('featured');
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<CustomApp['type']>('embed_url');
  const [customUrl, setCustomUrl] = useState('https://');
  const [customCategory, setCustomCategory] = useState<CustomApp['category']>('tools');
  const [selectedIcon, setSelectedIcon] = useState('Globe');
  const [selectedColor, setSelectedColor] = useState('from-indigo-600 to-purple-700');
  const [installSuccessMessage, setInstallSuccessMessage] = useState('');

  const COLOR_OPTIONS = [
    { label: 'بنفش', value: 'from-indigo-600 to-purple-700' },
    { label: 'طلایی صحرایی', value: 'from-amber-500 to-orange-600' },
    { label: 'زمردی', value: 'from-emerald-600 to-teal-700' },
    { label: 'اقیانوسی', value: 'from-blue-600 to-cyan-700' },
    { label: 'رزگلد', value: 'from-rose-500 to-pink-700' },
    { label: 'مشکی تیتانیوم', value: 'from-neutral-800 to-neutral-950' },
  ];

  const handleInstallMarketplace = (tool: CustomApp) => {
    soundEffects.click(soundEnabled);
    onInstallApp(tool);
    setInstallSuccessMessage(`برنامه "${tool.nameFa}" با موفقیت بر روی علی‌فون نصب شد!`);
    setTimeout(() => setInstallSuccessMessage(''), 3000);
  };

  const handleCreateCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    soundEffects.click(soundEnabled);
    const newId = `custom_${Date.now()}`;
    const newApp: CustomApp = {
      id: newId,
      name: customName,
      nameFa: customName,
      iconName: selectedIcon,
      color: selectedColor,
      category: customCategory,
      type: customType,
      url: customType === 'embed_url' ? customUrl : undefined,
    };

    onInstallApp(newApp);
    setCustomName('');
    setCustomUrl('https://');
    setInstallSuccessMessage(`ابزار شخصی "${newApp.nameFa}" روی صفحه اصلی نصب شد!`);
    setTimeout(() => setInstallSuccessMessage(''), 3500);
    setActiveTab('installed');
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white select-none">
      {/* Top Header */}
      <div className="pt-14 px-5 pb-3 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">ALI App Market</span>
          <h1 className="text-xl font-bold tracking-tight text-white">نصب ابزارها و برنامه‌ها</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
          ALI
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-2 bg-neutral-900 border-b border-neutral-800 text-xs">
        <button
          onClick={() => setActiveTab('featured')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'featured' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          ابزارهای برگزیده
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'custom' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          + نصب ابزار شخصی
        </button>
        <button
          onClick={() => setActiveTab('installed')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'installed' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          برنامه‌های نصب‌شده ({installedApps.length})
        </button>
      </div>

      {/* Success Notification Bar */}
      {installSuccessMessage && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{installSuccessMessage}</span>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'featured' && (
          <div className="space-y-4">
            {/* Spotlight Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/60 to-purple-900/60 border border-blue-500/20 shadow-xl">
              <div className="flex items-center gap-2 text-blue-300 text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ویژه محصولات شما</span>
              </div>
              <h2 className="text-base font-bold text-white mb-1">اکوسیستم ابزارهای اختصاصی علی فون</h2>
              <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                می‌توانید تمام ابزارها، کاتالوگ محصولات، لینک سایت‌های اختصاصی، و نرم‌افزارهای خود را درون آیفون ۱۶ پرو مکس نصب کنید.
              </p>
              <button
                onClick={() => setActiveTab('custom')}
                className="px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>ساخت ابزار جدید</span>
              </button>
            </div>

            {/* Marketplace List */}
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">ابزارهای آماده نصب</h3>
            <div className="space-y-2.5">
              {MARKETPLACE_TOOLS.map((tool) => {
                const isInstalled = installedApps.some((a) => a.id === tool.id);
                const IconComponent = ICON_MAP[tool.iconName] || Package;

                return (
                  <div
                    key={tool.id}
                    className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${tool.color} flex items-center justify-center shrink-0 shadow-md`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{tool.nameFa}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{tool.name}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isInstalled ? (
                        <button
                          onClick={() => onLaunchApp(tool.id)}
                          className="px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-blue-400 text-xs font-semibold flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-blue-400" />
                          <span>اجرا</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInstallMarketplace(tool)}
                          className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>نصب رایگان</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <form onSubmit={handleCreateCustomApp} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>مشخصات ابزار یا محصول شما</span>
              </h3>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">نام برنامه یا ابزار</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="مثال: فروشگاه اختصاصی علی، سایت انبارداری، ..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">نوع کاربری ابزار</label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as any)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="embed_url">وب‌سایت یا لینک ابزار آنلاین (URL Embed)</option>
                  <option value="product_catalog">کاتالوگ و ویترین محصولات اختصاصی</option>
                  <option value="custom_form">فرم ثبت سفارشات و اطلاعات</option>
                  <option value="markdown_tool">مستندات و دفترچه فرمول‌ها</option>
                  <option value="calculator_tool">ابزار محاسباتی و تبدیل واحد</option>
                </select>
              </div>

              {customType === 'embed_url' && (
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">آدرس اینترنتی وب‌سایت یا ابزار</label>
                  <input
                    type="url"
                    required
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-left"
                    dir="ltr"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    این وب‌سایت مستقیماً در مرورگر محافظت‌شده علی‌فون اجرا خواهد شد.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs text-neutral-400 mb-1">دسته‌بندی</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['products', 'tools', 'finance', 'utilities', 'web'] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCustomCategory(cat)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                        customCategory === cat
                          ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                      }`}
                    >
                      {cat === 'products' ? 'محصولات' : cat === 'tools' ? 'ابزارها' : cat === 'finance' ? 'مالی' : cat === 'utilities' ? 'کاربردی' : 'وب'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">انتخاب آیکون</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {['Globe', 'Package', 'Receipt', 'TrendingUp', 'Kanban', 'BarChart3', 'QrCode', 'Terminal', 'FileText'].map((iconKey) => {
                    const Comp = ICON_MAP[iconKey] || Globe;
                    return (
                      <button
                        type="button"
                        key={iconKey}
                        onClick={() => setSelectedIcon(iconKey)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${
                          selectedIcon === iconKey
                            ? 'bg-white text-black border-white'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Comp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">رنگ پوسته آیکون</label>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      type="button"
                      key={col.value}
                      onClick={() => setSelectedColor(col.value)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                        selectedColor === col.value
                          ? 'border-white text-white font-bold bg-white/10'
                          : 'border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <span className={`inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-tr ${col.value} mr-1.5 align-middle`} />
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>نصب فوری در آیفون ۱۶ پرو مکس (علی‌فون)</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'installed' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
              برنامه‌ها و ابزارهای فعال شما
            </h3>
            {installedApps.map((app) => {
              const IconComp = ICON_MAP[app.iconName] || Package;
              return (
                <div
                  key={app.id}
                  className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${app.color} flex items-center justify-center shrink-0 shadow-md`}>
                      <IconComp className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{app.nameFa || app.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <span className="capitalize">{app.category}</span>
                        <span>·</span>
                        <span>{app.type === 'embed_url' ? 'وب اپلیکیشن' : 'ابزار داخلی'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onLaunchApp(app.id)}
                      className="px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-semibold flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-emerald-400" />
                      <span>اجرا</span>
                    </button>
                    {!app.isPreinstalled && (
                      <button
                        onClick={() => {
                          soundEffects.click(soundEnabled);
                          onUninstallApp(app.id);
                        }}
                        className="p-1.5 rounded-full text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10"
                        title="حذف برنامه"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
