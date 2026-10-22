import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wifi,
  Bluetooth,
  Plane,
  Radio,
  Sun,
  Volume2,
  Flashlight,
  Calculator,
  Camera,
  Moon,
  BatteryCharging,
  Music2,
  Lock,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { AppLanguage } from '../../types/phone';
import { t } from '../../utils/i18n';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  brightness: number;
  setBrightness: (val: number) => void;
  volume: number;
  setVolume: (val: number) => void;
  wifiEnabled: boolean;
  setWifiEnabled: (val: boolean) => void;
  bluetoothEnabled: boolean;
  setBluetoothEnabled: (val: boolean) => void;
  airplaneMode: boolean;
  setAirplaneMode: (val: boolean) => void;
  flashlightOn: boolean;
  setFlashlightOn: (val: boolean) => void;
  lowPowerMode: boolean;
  setLowPowerMode: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenApp: (appId: string) => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  currentTrackTitle: string;
  soundEnabled: boolean;
  language: AppLanguage;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({
  isOpen,
  onClose,
  brightness,
  setBrightness,
  volume,
  setVolume,
  wifiEnabled,
  setWifiEnabled,
  bluetoothEnabled,
  setBluetoothEnabled,
  airplaneMode,
  setAirplaneMode,
  flashlightOn,
  setFlashlightOn,
  lowPowerMode,
  setLowPowerMode,
  darkMode,
  setDarkMode,
  onOpenApp,
  isMusicPlaying,
  onToggleMusic,
  currentTrackTitle,
  soundEnabled,
  language,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-2xl p-5 pt-12 flex flex-col justify-between text-white select-none overflow-hidden"
          onClick={onClose}
        >
          {/* Top Grab Handle */}
          <div className="w-10 h-1 bg-white/30 rounded-full mx-auto -mt-4 mb-2 cursor-pointer" />

          {/* Grid Container */}
          <div
            className="flex-1 flex flex-col gap-3.5 max-w-sm mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Row 1: Connectivity & Music Player */}
            <div className="grid grid-cols-2 gap-3">
              {/* 2x2 Network toggles card */}
              <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-3 grid grid-cols-2 gap-2 shadow-xl backdrop-blur-md">
                <button
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    setAirplaneMode(!airplaneMode);
                  }}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${
                    airplaneMode ? 'bg-amber-500 text-white' : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                  }`}
                  title={t('cc_airplane', language)}
                >
                  <Plane className="w-5 h-5" />
                  <span className="text-[10px] mt-1 font-medium">{t('cc_airplane', language)}</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    setWifiEnabled(!wifiEnabled);
                  }}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${
                    wifiEnabled && !airplaneMode ? 'bg-blue-500 text-white' : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                  }`}
                  title="Wi-Fi"
                >
                  <Wifi className="w-5 h-5" />
                  <span className="text-[10px] mt-1 font-medium">Wi-Fi</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    setBluetoothEnabled(!bluetoothEnabled);
                  }}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${
                    bluetoothEnabled ? 'bg-blue-600 text-white' : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                  }`}
                  title={t('cc_bluetooth', language)}
                >
                  <Bluetooth className="w-5 h-5" />
                  <span className="text-[10px] mt-1 font-medium">{t('cc_bluetooth', language)}</span>
                </button>

                <div
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center ${
                    !airplaneMode ? 'bg-emerald-600 text-white' : 'bg-white/10 text-neutral-400'
                  }`}
                  title={t('cc_cellular', language)}
                >
                  <Radio className="w-5 h-5" />
                  <span className="text-[10px] mt-1 font-medium">5G</span>
                </div>
              </div>

              {/* Music Player Mini Widget */}
              <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-3 flex flex-col justify-between shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center">
                    <Music2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-neutral-400">ALI Music</p>
                    <p className="text-xs font-semibold truncate text-white">{currentTrackTitle}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 py-1">
                  <button
                    onClick={() => {
                      soundEffects.click(soundEnabled);
                      onToggleMusic();
                    }}
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                  >
                    {isMusicPlaying ? (
                      <span className="w-3 h-3.5 border-l-2 border-r-2 border-black inline-block" />
                    ) : (
                      <span className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-black ml-0.5" />
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] text-neutral-400">
                  <span>فضای صوتی ۳ بعدی</span>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenApp('music');
                    }}
                    className="text-amber-400 hover:underline"
                  >
                    پخش کامل
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Sliders (Brightness & Volume) */}
            <div className="grid grid-cols-2 gap-3 h-36">
              {/* Brightness Slider */}
              <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-3 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-white/20 transition-all pointer-events-none"
                  style={{ height: `${brightness}%` }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <Sun className="w-5 h-5 text-amber-300" />
                  <span className="text-xs font-mono font-medium">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="relative z-20 w-full accent-amber-400 cursor-pointer opacity-70 hover:opacity-100"
                />
                <span className="relative z-10 text-[11px] text-neutral-300 font-medium">
                  {t('cc_brightness', language)}
                </span>
              </div>

              {/* Volume Slider */}
              <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-3 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-white/20 transition-all pointer-events-none"
                  style={{ height: `${volume}%` }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <Volume2 className="w-5 h-5 text-blue-300" />
                  <span className="text-xs font-mono font-medium">{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="relative z-20 w-full accent-blue-400 cursor-pointer opacity-70 hover:opacity-100"
                />
                <span className="relative z-10 text-[11px] text-neutral-300 font-medium">
                  {t('cc_volume', language)}
                </span>
              </div>
            </div>

            {/* Row 3: Quick Action Toggles */}
            <div className="grid grid-cols-4 gap-3">
              {/* Flashlight */}
              <button
                onClick={() => {
                  soundEffects.flashlight(soundEnabled);
                  setFlashlightOn(!flashlightOn);
                }}
                className={`h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  flashlightOn ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30' : 'bg-neutral-900/80 border border-white/10 text-white'
                }`}
              >
                <Flashlight className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-medium">{t('cc_flashlight', language)}</span>
              </button>

              {/* Calculator */}
              <button
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  onClose();
                  onOpenApp('calculator');
                }}
                className="h-16 rounded-2xl bg-neutral-900/80 border border-white/10 text-white flex flex-col items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Calculator className="w-5 h-5 text-orange-400" />
                <span className="text-[10px] mt-1 font-medium">{t('cc_calc', language)}</span>
              </button>

              {/* Camera */}
              <button
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  onClose();
                  onOpenApp('camera');
                }}
                className="h-16 rounded-2xl bg-neutral-900/80 border border-white/10 text-white flex flex-col items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Camera className="w-5 h-5 text-sky-400" />
                <span className="text-[10px] mt-1 font-medium">{t('cc_cam', language)}</span>
              </button>

              {/* Low Power Mode */}
              <button
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  setLowPowerMode(!lowPowerMode);
                }}
                className={`h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  lowPowerMode ? 'bg-yellow-500 text-black' : 'bg-neutral-900/80 border border-white/10 text-white'
                }`}
              >
                <BatteryCharging className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-medium">{t('cc_low_power', language)}</span>
              </button>
            </div>

            {/* Row 4: Dark mode & Settings */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  setDarkMode(!darkMode);
                }}
                className="h-12 rounded-2xl bg-neutral-900/80 border border-white/10 text-white px-4 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium">{t('cc_dark_mode', language)}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${darkMode ? 'bg-purple-500/20 text-purple-300' : 'text-neutral-400'}`}>
                  {darkMode ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  onClose();
                  onOpenApp('settings');
                }}
                className="h-12 rounded-2xl bg-neutral-900/80 border border-white/10 text-white px-4 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-neutral-300" />
                  <span className="text-xs font-medium">{t('settings', language)}</span>
                </div>
                <span className="text-xs text-neutral-400">iOS 18</span>
              </button>
            </div>
          </div>

          {/* Bottom dismiss indicator */}
          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="text-xs text-neutral-400 hover:text-white flex items-center justify-center gap-1 mx-auto"
            >
              <span>{t('cc_close', language)}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
