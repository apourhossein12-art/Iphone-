import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flashlight, Camera, Lock, Unlock, Sparkles } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { AppLanguage, CalendarType, NumberSystem } from '../../types/phone';
import { t, formatDigits } from '../../utils/i18n';
import { formatLongDate } from '../../utils/device';

interface LockScreenProps {
  onUnlock: () => void;
  wallpaperUrl: string;
  flashlightOn: boolean;
  setFlashlightOn: (val: boolean) => void;
  onOpenApp: (appId: string) => void;
  soundEnabled: boolean;
  currentTime: Date;
  language: AppLanguage;
  numberSystem: NumberSystem;
  calendarType: CalendarType;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  wallpaperUrl,
  flashlightOn,
  setFlashlightOn,
  onOpenApp,
  soundEnabled,
  currentTime,
  language,
  numberSystem,
  calendarType,
}) => {
  const [isUnlocking, setIsUnlocking] = useState(false);

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');

  // Formatted clock digits
  const displayHours = formatDigits(hours, numberSystem);
  const displayMinutes = formatDigits(minutes, numberSystem);

  // Real date from the selected calendar (Persian / Hijri / Gregorian) and numerals
  const dateString = formatLongDate(currentTime, language, calendarType, numberSystem);

  const handleUnlockClick = () => {
    setIsUnlocking(true);
    soundEffects.unlock(soundEnabled);
    setTimeout(() => {
      onUnlock();
    }, 280);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40, scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-40 flex flex-col justify-between p-6 pt-16 select-none overflow-hidden text-white cursor-pointer"
      onClick={handleUnlockClick}
      style={{
        backgroundImage: wallpaperUrl ? `url(${wallpaperUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px] pointer-events-none" />

      {/* Screen flashlight beam simulation if flashlight is on */}
      {flashlightOn && (
        <div className="absolute inset-0 bg-amber-100/20 backdrop-blur-xs pointer-events-none animate-pulse" />
      )}

      {/* Top Face ID and Date/Clock Zone */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Face ID Icon */}
        <div className="flex items-center gap-1.5 mb-2 opacity-80">
          {isUnlocking ? (
            <Unlock className="w-4 h-4 text-emerald-400 animate-bounce" />
          ) : (
            <Lock className="w-4 h-4 text-white" />
          )}
          <span className="text-[11px] font-medium tracking-wide">{t('lock_face_id', language)}</span>
        </div>

        {/* Localized Date */}
        <p className="text-base text-neutral-200 font-medium tracking-tight mb-1">
          {dateString}
        </p>

        {/* iOS 18 Bold Clock with customized number system */}
        <h1 className="text-7xl font-bold tracking-tighter drop-shadow-lg text-white font-mono leading-none">
          {displayHours}:{displayMinutes}
        </h1>

        {/* Dynamic widget capsule under clock */}
        <div className="mt-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2 text-xs text-neutral-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{t('lock_ai_ready', language)}</span>
        </div>
      </div>

      {/* Middle: Notification Cards */}
      <div className="relative z-10 flex flex-col gap-2.5 max-w-sm mx-auto w-full my-auto">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onUnlock();
            onOpenApp('products');
          }}
          className="p-3.5 rounded-2xl bg-neutral-900/65 backdrop-blur-xl border border-white/15 text-white shadow-xl hover:bg-neutral-900/80 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-neutral-300 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-[10px] font-bold text-black">
                ALI
              </span>
              <span className="font-semibold text-white">{t('lock_notification_title', language)}</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              {language === 'fa' ? 'الآن' : 'Now'}
            </span>
          </div>
          <p className="text-xs text-neutral-200 leading-relaxed">
            {t('lock_notification_desc', language)}
          </p>
        </div>
      </div>

      {/* Bottom: Flashlight & Camera shortcuts + Swipe Up hint */}
      <div className="relative z-10 flex flex-col items-center gap-4 pb-2">
        <div className="w-full flex items-center justify-between px-3">
          {/* Flashlight button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.flashlight(soundEnabled);
              setFlashlightOn(!flashlightOn);
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl transition-all active:scale-90 ${
              flashlightOn
                ? 'bg-white text-black shadow-lg shadow-white/30'
                : 'bg-black/50 border border-white/20 text-white hover:bg-black/70'
            }`}
            title="Flashlight"
          >
            <Flashlight className="w-5 h-5" />
          </button>

          {/* Camera shortcut button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.click(soundEnabled);
              onUnlock();
              onOpenApp('camera');
            }}
            className="w-12 h-12 rounded-full bg-black/50 border border-white/20 text-white hover:bg-black/70 flex items-center justify-center backdrop-blur-xl transition-all active:scale-90"
            title="Camera"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Swipe Up bar */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-[11px] text-neutral-300 font-medium">{t('lock_swipe', language)}</p>
          <div className="w-32 h-1 bg-white/70 rounded-full animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};
