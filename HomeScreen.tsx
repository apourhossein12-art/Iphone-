import React from 'react';
import {
  Phone,
  MessageCircle,
  Compass,
  Camera,
  Image,
  ShoppingBag,
  Package,
  FileText,
  Calculator,
  Music2,
  CloudSun,
  Clock,
  Settings,
  Sparkles,
  Search,
  Battery,
  TrendingUp,
  Receipt,
  Kanban,
  BarChart3,
  QrCode,
  Terminal,
  Globe,
  Layers,
  FileCode,
  Calendar,
  MapPin,
  Code2,
} from 'lucide-react';
import { CustomApp, ProductItem, AppLanguage } from '../../types/phone';
import { soundEffects } from '../../utils/soundEffects';
import { t, formatDigits } from '../../utils/i18n';
import { useWeatherSummary } from '../../utils/weather';

interface HomeScreenProps {
  onOpenApp: (appId: string) => void;
  installedApps: CustomApp[];
  products: ProductItem[];
  wallpaperUrl: string;
  onOpenSiri: () => void;
  onOpenControlCenter: () => void;
  soundEnabled: boolean;
  currentTime: Date;
  language: AppLanguage;
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
  ShoppingBag,
  FileCode,
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenApp,
  installedApps,
  products,
  wallpaperUrl,
  onOpenSiri,
  onOpenControlCenter,
  soundEnabled,
  currentTime,
  language,
}) => {
  const weather = useWeatherSummary();
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

  const BUILTIN_APPS = [
    { id: 'phone', nameKey: 'phone', icon: Phone, color: 'bg-emerald-500' },
    { id: 'messages', nameKey: 'messages', icon: MessageCircle, color: 'bg-emerald-500' },
    { id: 'safari', nameKey: 'safari', icon: Compass, color: 'bg-gradient-to-tr from-sky-400 to-blue-600' },
    { id: 'camera', nameKey: 'camera', icon: Camera, color: 'bg-neutral-800' },
    { id: 'photos', nameKey: 'photos', icon: Image, color: 'bg-gradient-to-tr from-amber-400 via-rose-500 to-blue-500' },
    { id: 'appstore', nameKey: 'appstore', icon: ShoppingBag, color: 'bg-blue-600' },
    {
      id: 'googleplay',
      nameKey: 'googleplay',
      icon: FileCode,
      color: 'bg-gradient-to-tr from-emerald-600 to-teal-700',
      badgeText: 'APK',
    },
    {
      id: 'cloud_android',
      nameKey: 'cloud_android',
      icon: Terminal,
      color: 'bg-gradient-to-tr from-cyan-600 to-blue-700',
      badgeText: 'CLOUD',
    },
    {
      id: 'products',
      nameKey: 'products',
      icon: Package,
      color: 'bg-gradient-to-tr from-amber-500 to-orange-600',
      isSpecial: true,
    },
    {
      id: 'calendar',
      nameKey: 'calendar',
      icon: Calendar,
      color: 'bg-gradient-to-tr from-rose-500 to-red-600',
      badgeText: 'TODAY',
    },
    {
      id: 'maps',
      nameKey: 'maps',
      icon: MapPin,
      color: 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600',
      badgeText: 'GPS',
    },
    {
      id: 'terminal',
      nameKey: 'terminal',
      icon: Code2,
      color: 'bg-gradient-to-tr from-purple-600 via-indigo-700 to-slate-900',
      badgeText: 'PY/JS',
    },
    { id: 'notes', nameKey: 'notes', icon: FileText, color: 'bg-amber-400' },
    { id: 'calculator', nameKey: 'calculator', icon: Calculator, color: 'bg-neutral-900' },
    { id: 'music', nameKey: 'music', icon: Music2, color: 'bg-rose-500' },
    { id: 'weather', nameKey: 'weather', icon: CloudSun, color: 'bg-sky-500' },
    { id: 'clock', nameKey: 'clock', icon: Clock, color: 'bg-black' },
    { id: 'settings', nameKey: 'settings', icon: Settings, color: 'bg-neutral-600' },
  ];

  // Custom apps not already listed
  const extraCustomApps = installedApps.filter(
    (app) => !BUILTIN_APPS.some((b) => b.id === app.id)
  );

  const handleAppClick = (appId: string) => {
    soundEffects.click(soundEnabled);
    onOpenApp(appId);
  };

  return (
    <div
      className="h-full flex flex-col justify-between p-4 pt-14 pb-2 select-none relative overflow-hidden text-white"
      style={{
        backgroundImage: wallpaperUrl ? `url(${wallpaperUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Dim for icon readability */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[0.5px] pointer-events-none" />

      {/* Top Widgets Cluster */}
      <div className="relative z-10 space-y-3">
        {/* Row of 2 2x2 Widgets */}
        <div className="grid grid-cols-2 gap-3">
          {/* Weather Widget */}
          <div
            onClick={() => handleAppClick('weather')}
            className="p-3.5 rounded-3xl bg-neutral-900/55 backdrop-blur-xl border border-white/15 cursor-pointer hover:bg-neutral-900/70 transition-all shadow-lg flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-200">
                {weather?.city ?? '—'}
              </span>
              <CloudSun className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-2xl font-light font-mono text-white">
                {weather ? `${formatDigits(Math.round(weather.temp), language === 'fa' ? 'persian' : language === 'ar' ? 'arabic' : 'latin')}°` : '—'}
              </p>
              <p className="text-[10px] text-sky-200 mt-0.5">
                {weather?.text ?? (language === 'fa' ? 'در حال دریافت…' : 'Loading…')}
              </p>
            </div>
          </div>

          {/* Products & Sales Widget */}
          <div
            onClick={() => handleAppClick('products')}
            className="p-3.5 rounded-3xl bg-neutral-900/55 backdrop-blur-xl border border-white/15 cursor-pointer hover:bg-neutral-900/70 transition-all shadow-lg flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-200">
                {t('products', language)}
              </span>
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-bold font-mono text-amber-400">
                {formatDigits(products.length, language === 'fa' ? 'persian' : language === 'ar' ? 'arabic' : 'latin')}{' '}
                {language === 'fa' ? 'کالا' : 'Items'}
              </p>
              <p className="text-[10px] text-emerald-300 mt-0.5">
                {formatDigits(totalStock, language === 'fa' ? 'persian' : language === 'ar' ? 'arabic' : 'latin')}{' '}
                {language === 'fa' ? 'موجودی فعال' : 'In Stock'}
              </p>
            </div>
          </div>
        </div>

        {/* ALI Intelligence Smart Bar Widget */}
        <div
          onClick={onOpenSiri}
          className="p-2.5 px-4 rounded-2xl bg-neutral-900/60 backdrop-blur-xl border border-white/15 flex items-center justify-between cursor-pointer hover:bg-neutral-900/80 transition-colors shadow-md"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center animate-spin"
              style={{ animationDuration: '8s' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-medium text-neutral-200">
              {t('di_assistant', language)}
            </span>
          </div>
          <span className="text-[10px] text-pink-400 font-medium">
            {language === 'fa' ? 'پرسش یا فرمان ↵' : 'Ask AI ↵'}
          </span>
        </div>
      </div>

      {/* Main Apps Grid (4 columns iOS standard) */}
      <div className="relative z-10 flex-1 py-4 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
          {/* Builtin Apps */}
          {BUILTIN_APPS.map((app) => {
            const IconComp = app.icon;
            const appLabel = t(app.nameKey, language);

            return (
              <div
                key={app.id}
                onClick={() => handleAppClick(app.id)}
                className="flex flex-col items-center gap-1 cursor-pointer group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${app.color} flex items-center justify-center text-white shadow-xl relative group-hover:scale-105 active:scale-95 transition-transform duration-200 ${
                    app.isSpecial ? 'ring-2 ring-amber-400/80 shadow-amber-500/20' : ''
                  }`}
                >
                  <IconComp className="w-7 h-7 text-white" />
                  {app.badgeText && (
                    <span className="absolute -top-1.5 -left-1.5 px-1 rounded-full bg-emerald-500 text-black text-[8px] font-black tracking-tight border border-black shadow">
                      {app.badgeText}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-200 font-medium tracking-tight truncate max-w-[64px] drop-shadow">
                  {appLabel}
                </span>
              </div>
            );
          })}

          {/* User-Installed Custom Apps & APKs */}
          {extraCustomApps.map((app) => {
            const IconComponent = ICON_MAP[app.iconName] || Globe;
            const appTitle = language === 'fa' ? app.nameFa || app.name : app.name;

            return (
              <div
                key={app.id}
                onClick={() => handleAppClick(app.id)}
                className="flex flex-col items-center gap-1 cursor-pointer group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-white shadow-xl relative group-hover:scale-105 active:scale-95 transition-transform duration-200 ring-1 ring-white/20`}
                >
                  <IconComponent className="w-7 h-7 text-white" />
                  <span className="absolute -top-1 -left-1 px-1 rounded-full bg-blue-500 text-[8px] font-bold text-white uppercase">
                    {app.id.startsWith('apk_') ? 'APK' : 'APP'}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-200 font-medium tracking-tight truncate max-w-[64px] drop-shadow">
                  {appTitle}
                </span>
              </div>
            );
          })}

          {/* "+ نصب ابزار جدید" shortcut */}
          <div
            onClick={() => handleAppClick('appstore')}
            className="flex flex-col items-center gap-1 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-neutral-900/60 border border-dashed border-white/30 flex items-center justify-center text-neutral-300 group-hover:scale-105 active:scale-95 transition-transform duration-200">
              <span className="text-xl font-bold">+</span>
            </div>
            <span className="text-[11px] text-neutral-300 font-medium tracking-tight truncate max-w-[64px] drop-shadow">
              {language === 'fa' ? 'نصب ابزار' : 'Add Tool'}
            </span>
          </div>
        </div>
      </div>

      {/* Spotlight Search Pill */}
      <div className="relative z-10 flex justify-center pb-2">
        <button
          onClick={onOpenSiri}
          className="px-3 py-1 rounded-full bg-neutral-900/60 backdrop-blur-md border border-white/10 text-neutral-300 text-[11px] flex items-center gap-1.5 hover:bg-neutral-900/80 transition-colors shadow-sm"
        >
          <Search className="w-3 h-3" />
          <span>{t('search', language)}</span>
        </button>
      </div>

      {/* Dock (Bottom 4 pinned apps) */}
      <div className="relative z-10 p-2.5 rounded-[32px] bg-neutral-900/40 backdrop-blur-2xl border border-white/15 shadow-2xl flex items-center justify-around">
        <button
          onClick={() => handleAppClick('phone')}
          className="w-13 h-13 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          title={t('phone', language)}
        >
          <Phone className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={() => handleAppClick('safari')}
          className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          title={t('safari', language)}
        >
          <Compass className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={() => handleAppClick('messages')}
          className="w-13 h-13 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform relative"
          title={t('messages', language)}
        >
          <MessageCircle className="w-6 h-6 text-white" />
          
        </button>

        <button
          onClick={() => handleAppClick('camera')}
          className="w-13 h-13 rounded-2xl bg-neutral-800 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          title={t('camera', language)}
        >
          <Camera className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};
