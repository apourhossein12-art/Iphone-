import { useBattery } from '../../utils/device';
import React, { useState } from 'react';
import {
  Smartphone,
  Palette,
  Image,
  Sun,
  Battery,
  Volume2,
  Globe,
  RotateCcw,
  Shield,
  Cpu,
  HardDrive,
  Check,
  ChevronLeft,
  Calendar,
  Hash,
  MapPin,
} from 'lucide-react';
import {
  TitaniumFinish,
  AppLanguage,
  AppRegion,
  CalendarType,
  NumberSystem,
} from '../../types/phone';
import { DEFAULT_WALLPAPERS } from '../../utils/defaultData';
import { soundEffects } from '../../utils/soundEffects';
import { SUPPORTED_LANGUAGES, REGIONS, t, formatDigits } from '../../utils/i18n';

interface SettingsAppProps {
  titaniumFinish: TitaniumFinish;
  onSelectTitaniumFinish: (finish: TitaniumFinish) => void;
  currentWallpaperUrl: string;
  onSelectWallpaper: (url: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  language: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  region: AppRegion;
  onSelectRegion: (reg: AppRegion) => void;
  calendarType: CalendarType;
  onSelectCalendar: (cal: CalendarType) => void;
  numberSystem: NumberSystem;
  onSelectNumberSystem: (num: NumberSystem) => void;
  onResetData: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  titaniumFinish,
  onSelectTitaniumFinish,
  currentWallpaperUrl,
  onSelectWallpaper,
  soundEnabled,
  onToggleSound,
  language,
  onSelectLanguage,
  region,
  onSelectRegion,
  calendarType,
  onSelectCalendar,
  numberSystem,
  onSelectNumberSystem,
  onResetData,
}) => {
  const battery = useBattery();
  const [activeSection, setActiveSection] = useState<
    'main' | 'about' | 'finishes' | 'wallpapers' | 'battery' | 'lang_region'
  >('main');

  const FINISH_LABELS: Record<
    TitaniumFinish,
    { nameFa: string; nameEn: string; colorClass: string; desc: string }
  > = {
    desert: {
      nameFa: 'طلایی صحرایی (Desert Titanium)',
      nameEn: 'Desert Titanium',
      colorClass: 'bg-[#B48860]',
      desc: 'رنگ پرچمدار و چشم‌نواز آیفون ۱۶ پرو مکس با درخشش کهربایی تیتانیوم.',
    },
    black: {
      nameFa: 'مشکی تیتانیوم (Black Titanium)',
      nameEn: 'Black Titanium',
      colorClass: 'bg-[#282725]',
      desc: 'مشکی عمیق با بافت برس‌خورده مات تیتانیوم گرید ۵.',
    },
    natural: {
      nameFa: 'طبیعی تیتانیوم (Natural Titanium)',
      nameEn: 'Natural Titanium',
      colorClass: 'bg-[#98928A]',
      desc: 'رنگ ارجینال متالیک تیتانیوم هوافضا با انعکاس نور خاکستری نقره‌ای.',
    },
    white: {
      nameFa: 'سفید تیتانیوم (White Titanium)',
      nameEn: 'White Titanium',
      colorClass: 'bg-[#E5E5EA]',
      desc: 'سفید مینیمال و پاک با شیشه مات حرارت‌دیده پشت.',
    },
  };

  const isRTL = language === 'fa' || language === 'ar';

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white select-none">
      {/* Top Header */}
      <div className="pt-14 px-5 pb-3 border-b border-neutral-800 flex items-center justify-between">
        {activeSection !== 'main' ? (
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setActiveSection('main');
            }}
            className="flex items-center gap-1 text-xs text-blue-400 font-semibold"
          >
            <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t('set_title', language)}</span>
          </button>
        ) : (
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase">
              Apple iOS 18 Preferences
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white">{t('set_title', language)}</h1>
          </div>
        )}
      </div>

      {/* Main Settings List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeSection === 'main' && (
          <>
            {/* User Profile Card */}
            <div
              onClick={() => {
                soundEffects.click(soundEnabled);
                setActiveSection('about');
              }}
              className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-between cursor-pointer hover:bg-neutral-800/80 transition-colors shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-black font-bold flex items-center justify-center text-lg">
                  ALI
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">ALI Phone</h3>
                  <p className="text-[11px] text-neutral-400">iPhone 16 Pro Max · Apple A18 Pro</p>
                  <p className="text-[10px] text-amber-400 font-medium">{t('set_about', language)}</p>
                </div>
              </div>
              <ChevronLeft className={`w-5 h-5 text-neutral-500 ${isRTL ? '' : 'rotate-180'}`} />
            </div>

            {/* General & Language Section (مثل تنظیمات ایفون) */}
            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden divide-y divide-neutral-800/60 shadow-md">
              {/* Language & Region */}
              <button
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  setActiveSection('lang_region');
                }}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {t('set_lang_region', language)}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName} ·{' '}
                      {REGIONS.find((r) => r.code === region)?.nameEn}
                    </span>
                  </div>
                </div>
                <ChevronLeft className={`w-4 h-4 text-neutral-500 ${isRTL ? '' : 'rotate-180'}`} />
              </button>

              {/* Titanium Finish */}
              <button
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  setActiveSection('finishes');
                }}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {t('set_hardware_color', language)}
                    </span>
                    <span className="text-[10px] text-neutral-400">{FINISH_LABELS[titaniumFinish].nameFa}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full ${FINISH_LABELS[titaniumFinish].colorClass} border border-white/20`}
                  />
                  <ChevronLeft className={`w-4 h-4 text-neutral-500 ${isRTL ? '' : 'rotate-180'}`} />
                </div>
              </button>

              {/* Wallpaper */}
              <button
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  setActiveSection('wallpapers');
                }}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Image className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {t('set_wallpaper', language)}
                    </span>
                    <span className="text-[10px] text-neutral-400">iOS 18 Titanium</span>
                  </div>
                </div>
                <ChevronLeft className={`w-4 h-4 text-neutral-500 ${isRTL ? '' : 'rotate-180'}`} />
              </button>

              {/* Battery Health */}
              <button
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  setActiveSection('battery');
                }}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Battery className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {t('set_battery', language)}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">100% · Peak Performance</span>
                  </div>
                </div>
                <ChevronLeft className={`w-4 h-4 text-neutral-500 ${isRTL ? '' : 'rotate-180'}`} />
              </button>
            </div>

            {/* System Audio & Haptics */}
            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden divide-y divide-neutral-800/60 shadow-md">
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {t('set_sounds', language)}
                    </span>
                    <span className="text-[10px] text-neutral-400">Web Audio API DTMF & Haptics</span>
                  </div>
                </div>
                <button
                  onClick={onToggleSound}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    soundEnabled ? 'bg-emerald-500' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      soundEnabled ? (isRTL ? 'right-6' : 'left-6') : isRTL ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Reset Data Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  if (confirm('آیا مایلید تمام داده‌های محصولات و یادداشت‌ها به حالت پیش‌فرض بازگردانی شوند؟')) {
                    onResetData();
                  }
                }}
                className="w-full py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-rose-400 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('set_reset', language)}</span>
              </button>
            </div>
          </>
        )}

        {/* SECTION: LANGUAGE & REGION (واقعی مثل تنظیمات ایفون) */}
        {activeSection === 'lang_region' && (
          <div className="space-y-4">
            {/* Preferred Languages (زبان‌های برگزیده) */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
                {t('set_preferred_lang', language)}
              </h3>
              <div className="rounded-3xl bg-neutral-900 border border-neutral-800 divide-y divide-neutral-800/80 overflow-hidden">
                {SUPPORTED_LANGUAGES.map((langItem) => {
                  const isSelected = language === langItem.code;
                  return (
                    <div
                      key={langItem.code}
                      onClick={() => {
                        soundEffects.click(soundEnabled);
                        onSelectLanguage(langItem.code);
                      }}
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-neutral-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{langItem.flag}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{langItem.nativeName}</p>
                          <p className="text-[10px] text-neutral-400">{langItem.englishName}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-blue-500 font-bold" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Region Format (منطقه جغرافیایی) */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
                {t('set_region_label', language)}
              </h3>
              <div className="rounded-3xl bg-neutral-900 border border-neutral-800 divide-y divide-neutral-800/80 overflow-hidden">
                {REGIONS.map((reg) => {
                  const isSelected = region === reg.code;
                  return (
                    <div
                      key={reg.code}
                      onClick={() => {
                        soundEffects.click(soundEnabled);
                        onSelectRegion(reg.code);
                      }}
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-neutral-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {language === 'fa' ? reg.nameFa : reg.nameEn}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-mono">{reg.code}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendar Format (تقویم سیستم) */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
                {t('set_calendar_label', language)}
              </h3>
              <div className="rounded-3xl bg-neutral-900 border border-neutral-800 divide-y divide-neutral-800/80 overflow-hidden text-xs">
                {(
                  [
                    { key: 'persian', labelKey: 'set_cal_persian' },
                    { key: 'gregorian', labelKey: 'set_cal_gregorian' },
                    { key: 'islamic', labelKey: 'set_cal_islamic' },
                  ] as const
                ).map((c) => (
                  <div
                    key={c.key}
                    onClick={() => {
                      soundEffects.click(soundEnabled);
                      onSelectCalendar(c.key);
                    }}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-neutral-800/60"
                  >
                    <span className="font-medium text-white">{t(c.labelKey, language)}</span>
                    {calendarType === c.key && <Check className="w-4 h-4 text-blue-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Number System (سیستم ارقام) */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
                {t('set_number_system', language)}
              </h3>
              <div className="rounded-3xl bg-neutral-900 border border-neutral-800 divide-y divide-neutral-800/80 overflow-hidden text-xs">
                {(
                  [
                    { key: 'persian', labelKey: 'set_num_persian' },
                    { key: 'latin', labelKey: 'set_num_latin' },
                    { key: 'arabic', labelKey: 'set_num_arabic' },
                  ] as const
                ).map((n) => (
                  <div
                    key={n.key}
                    onClick={() => {
                      soundEffects.click(soundEnabled);
                      onSelectNumberSystem(n.key);
                    }}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-neutral-800/60"
                  >
                    <span className="font-medium text-white">{t(n.labelKey, language)}</span>
                    {numberSystem === n.key && <Check className="w-4 h-4 text-blue-500" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: About Phone */}
        {activeSection === 'about' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
              مشخصات سخت‌افزاری و نرم‌افزاری
            </h3>
            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 divide-y divide-neutral-800/60 overflow-hidden text-xs">
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-400">{t('set_model_name', language)}</span>
                <span className="font-semibold text-white">ALI phone (iPhone 16 Pro Max)</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-400">{t('set_processor', language)}</span>
                <span className="font-semibold text-amber-400">Apple A18 Pro (3nm TSMC)</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-400">موتور هوش مصنوعی</span>
                <span className="font-semibold text-purple-400">16-Core Neural Engine + Gemini</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-400">{t('set_storage', language)}</span>
                <span className="font-semibold text-white font-mono">1TB Titanium NVMe</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-400">{t('set_display', language)}</span>
                <span className="font-semibold text-white">6.9-inch Super Retina XDR (120Hz)</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-400">{t('set_bezel', language)}</span>
                <span className="font-semibold text-white font-mono">1.15 mm Ultra-Narrow</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-400">دوربین اصلی</span>
                <span className="font-semibold text-white">48MP Fusion + 5x Tetraprism</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-400">پشتیبانی فرمت APK</span>
                <span className="font-semibold text-emerald-400">Google Play Bridge Enabled</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-400">{t('set_os_version', language)}</span>
                <span className="font-semibold text-emerald-400">ALI OS 18.2 Pro</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Titanium Finishes */}
        {activeSection === 'finishes' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
              رنگ‌های رسمی تیتانیوم گرید ۵
            </h3>
            <div className="space-y-2.5">
              {(Object.keys(FINISH_LABELS) as TitaniumFinish[]).map((finishKey) => {
                const info = FINISH_LABELS[finishKey];
                const isSelected = titaniumFinish === finishKey;

                return (
                  <div
                    key={finishKey}
                    onClick={() => {
                      soundEffects.click(soundEnabled);
                      onSelectTitaniumFinish(finishKey);
                    }}
                    className={`p-4 rounded-3xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-neutral-900 border-amber-400 shadow-lg shadow-amber-400/10'
                        : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl ${info.colorClass} border border-white/20 shadow-md shrink-0`}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{info.nameFa}</h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">{info.desc}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-amber-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION: Wallpapers */}
        {activeSection === 'wallpapers' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
              تصاویر زمینه رسمی سری پرو
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {DEFAULT_WALLPAPERS.map((wp) => {
                const isSelected = currentWallpaperUrl === wp.url;
                return (
                  <div
                    key={wp.id}
                    onClick={() => {
                      soundEffects.click(soundEnabled);
                      onSelectWallpaper(wp.url);
                    }}
                    className={`aspect-[9/16] rounded-2xl overflow-hidden border relative cursor-pointer group shadow-lg ${
                      isSelected ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-neutral-800'
                    }`}
                  >
                    {wp.url ? (
                      <img
                        src={wp.url}
                        alt={wp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-b ${wp.gradient}`} />
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-2.5 bg-black/60 backdrop-blur-sm text-center">
                      <p className="text-[11px] font-semibold text-white truncate">{wp.name}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-xs shadow-md">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION: Battery Health */}
        {activeSection === 'battery' && (
          <div className="space-y-3">
            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
                <Battery className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">{t('set_battery', language)}</h3>
              <p className="text-3xl font-bold font-mono text-emerald-400">{battery.supported ? `${Math.round(battery.level * 100)}%${battery.charging ? ' ⚡' : ''}` : '—'}</p>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
                {battery.supported ? (battery.charging ? 'دستگاه در حال شارژ است.' : 'این مقدار از باتری واقعی دستگاه شما خوانده می‌شود.') : 'مرورگر شما اجازه‌ی خواندن باتری را نمی‌دهد (مثلاً Safari در iOS).'}
              </p>
            </div>

            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 divide-y divide-neutral-800/60 overflow-hidden text-xs">
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-400">{t('set_cycle_count', language)}</span>
                <span className="font-mono text-white">14 Cycles</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-400">فناوری بهینه‌سازی شارژ</span>
                <span className="text-emerald-400">محدودیت ۸۰٪ فعال</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-400">توان شارژ سیمی</span>
                <span className="font-mono text-white">USB-C تا ۴۵ وات</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-neutral-400">شارژ بی‌سیم MagSafe</span>
                <span className="font-mono text-white">تا ۲۵ وات</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
