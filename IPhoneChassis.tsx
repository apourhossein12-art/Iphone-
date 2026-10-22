import React, { useState, useRef } from 'react';
import { TitaniumFinish } from '../../types/phone';
import { soundEffects } from '../../utils/soundEffects';
import { Camera, Flashlight, VolumeX, Sparkles, Sliders, RotateCw, Eye, Smartphone, Zap } from 'lucide-react';

interface IPhoneChassisProps {
  children: React.ReactNode;
  finish: TitaniumFinish;
  onPowerClick: () => void;
  onPowerLongPress: () => void;
  onActionButtonClick: () => void;
  onCameraControlClick: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  soundEnabled: boolean;
  brightness: number;
  flashlightOn: boolean;
}

export const IPhoneChassis: React.FC<IPhoneChassisProps> = ({
  children,
  finish,
  onPowerClick,
  onPowerLongPress,
  onActionButtonClick,
  onCameraControlClick,
  onVolumeUp,
  onVolumeDown,
  soundEnabled,
  brightness,
  flashlightOn,
}) => {
  const [viewAngle, setViewAngle] = useState<'front' | 'back' | 'tilt3d'>('front');
  const [actionButtonActive, setActionButtonActive] = useState(false);
  const [cameraControlHovered, setCameraControlHovered] = useState(false);
  const [cameraZoomLevel, setCameraZoomLevel] = useState<number>(1.0);

  // 3D Perspective Mouse tracking
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const chassisRef = useRef<HTMLDivElement>(null);

  // Titanium Chassis styles based on finish
  const FINISH_CONFIG = {
    desert: {
      outerBorder: 'border-[#B48860]',
      outerBg: 'bg-gradient-to-b from-[#C49B74] via-[#A87B54] to-[#8F643F]',
      backGlass: 'bg-gradient-to-b from-[#DEC3A8] via-[#C9A685] to-[#B08A64]',
      cameraIsland: 'bg-[#B08862]',
      bezelHighlight: 'from-[#DFBCA0]/40 to-[#8F643F]/20',
      shadowColor: 'rgba(180, 136, 96, 0.35)',
      buttonColor: 'bg-[#C49B74]',
      name: 'Desert Titanium (تیتانیوم صحرایی)',
      hex: '#C49B74',
    },
    black: {
      outerBorder: 'border-[#383735]',
      outerBg: 'bg-gradient-to-b from-[#403F3D] via-[#2A2927] to-[#1C1B1A]',
      backGlass: 'bg-gradient-to-b from-[#2E2D2B] via-[#201F1E] to-[#151413]',
      cameraIsland: 'bg-[#222120]',
      bezelHighlight: 'from-white/15 to-transparent',
      shadowColor: 'rgba(0, 0, 0, 0.7)',
      buttonColor: 'bg-[#3A3937]',
      name: 'Black Titanium (تیتانیوم مشکی)',
      hex: '#2A2927',
    },
    natural: {
      outerBorder: 'border-[#98928A]',
      outerBg: 'bg-gradient-to-b from-[#AFA9A1] via-[#948E86] to-[#7D776F]',
      backGlass: 'bg-gradient-to-b from-[#C0BBB4] via-[#A8A29A] to-[#8E8880]',
      cameraIsland: 'bg-[#8F8981]',
      bezelHighlight: 'from-white/30 to-[#6E6860]/20',
      shadowColor: 'rgba(152, 146, 138, 0.35)',
      buttonColor: 'bg-[#98928A]',
      name: 'Natural Titanium (تیتانیوم طبیعی)',
      hex: '#948E86',
    },
    white: {
      outerBorder: 'border-[#D1D1D6]',
      outerBg: 'bg-gradient-to-b from-[#F2F2F7] via-[#E5E5EA] to-[#D1D1D6]',
      backGlass: 'bg-gradient-to-b from-[#FFFFFF] via-[#F5F5F7] to-[#E5E5EA]',
      cameraIsland: 'bg-[#E5E5EA]',
      bezelHighlight: 'from-white/60 to-[#C7C7CC]/30',
      shadowColor: 'rgba(200, 200, 210, 0.35)',
      buttonColor: 'bg-[#E5E5EA]',
      name: 'White Titanium (تیتانیوم سفید)',
      hex: '#E5E5EA',
    },
  };

  const currentCfg = FINISH_CONFIG[finish];

  const handleActionPress = () => {
    setActionButtonActive(true);
    soundEffects.haptic(25);
    onActionButtonClick();
    setTimeout(() => setActionButtonActive(false), 300);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewAngle !== 'tilt3d') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTiltX((-y / rect.height) * 18);
    setTiltY((x / rect.width) * 18);
  };

  const handleMouseLeave = () => {
    setTiltX(0);
    setTiltY(0);
  };

  return (
    <div className="relative select-none flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Hardware Perspective Mode Toolbar */}
      <div className="mb-2 z-30 flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-md text-[11px] shadow-xl">
        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            setViewAngle('front');
          }}
          className={`px-3 py-1 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            viewAngle === 'front'
              ? 'bg-blue-600 text-white font-bold shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>نمای جلو (نمایشگر)</span>
        </button>

        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            setViewAngle('back');
          }}
          className={`px-3 py-1 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            viewAngle === 'back'
              ? 'bg-amber-600 text-white font-bold shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>نمای پشت (دوربین ۳ گانه)</span>
        </button>

        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            setViewAngle('tilt3d');
          }}
          className={`px-3 py-1 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            viewAngle === 'tilt3d'
              ? 'bg-purple-600 text-white font-bold shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>سه‌بعدی و تیتانیوم</span>
        </button>
      </div>

      {/* Main 3D Container */}
      <div
        ref={chassisRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          perspective: 1200,
        }}
        className="transition-transform duration-200"
      >
        {/* Phone Chassis Body */}
        <div
          className={`relative w-[390px] h-[812px] sm:w-[412px] sm:h-[860px] rounded-[56px] p-[10px] ${currentCfg.outerBg} shadow-2xl transition-all duration-500`}
          style={{
            transform:
              viewAngle === 'tilt3d'
                ? `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`
                : 'none',
            boxShadow: `0 25px 60px -15px ${currentCfg.shadowColor}, 0 0 0 1px rgba(255,255,255,0.2) inset`,
          }}
        >
          {/* Micro-blasted Brushed Titanium Specular Ring */}
          <div className="absolute inset-0 rounded-[56px] pointer-events-none border border-white/25 shadow-inner" />

          {/* LEFT HARDWARE BUTTONS */}
          {/* 1. Action Button (دکمه اکشن) */}
          <div className="absolute -left-[9px] top-[125px] flex flex-col items-center">
            <button
              onClick={handleActionPress}
              title="دکمه اکشن اختصاصی (Action Button)"
              className={`w-[6px] h-[34px] rounded-l-md transition-all ${
                actionButtonActive ? 'bg-amber-400 w-[4px]' : `${currentCfg.buttonColor} hover:brightness-125`
              }`}
            />
          </div>

          {/* 2. Volume Up */}
          <div className="absolute -left-[9px] top-[180px]">
            <button
              onClick={() => {
                soundEffects.click(soundEnabled);
                onVolumeUp();
              }}
              title="افزایش صدا"
              className={`w-[6px] h-[52px] rounded-l-md ${currentCfg.buttonColor} hover:brightness-125 active:w-[4px] transition-all`}
            />
          </div>

          {/* 3. Volume Down */}
          <div className="absolute -left-[9px] top-[242px]">
            <button
              onClick={() => {
                soundEffects.click(soundEnabled);
                onVolumeDown();
              }}
              title="کاهش صدا"
              className={`w-[6px] h-[52px] rounded-l-md ${currentCfg.buttonColor} hover:brightness-125 active:w-[4px] transition-all`}
            />
          </div>

          {/* RIGHT HARDWARE BUTTONS */}
          {/* 1. Side / Power Button */}
          <div className="absolute -right-[9px] top-[175px]">
            <button
              onClick={() => {
                soundEffects.click(soundEnabled);
                onPowerClick();
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                onPowerLongPress();
              }}
              title="دکمه پاور (قفل/روشن)"
              className={`w-[6px] h-[78px] rounded-r-md ${currentCfg.buttonColor} hover:brightness-125 active:w-[4px] transition-all`}
            />
          </div>

          {/* 2. New iPhone 16 Pro "Camera Control" Button */}
          <div className="absolute -right-[9px] top-[540px] group">
            <button
              onClick={() => {
                soundEffects.cameraShutter(soundEnabled);
                onCameraControlClick();
              }}
              onMouseEnter={() => setCameraControlHovered(true)}
              onMouseLeave={() => setCameraControlHovered(false)}
              title="دکمه لمسی خازنی کنترل دوربین (Camera Control)"
              className={`w-[6px] h-[64px] rounded-r-md transition-all ${
                cameraControlHovered
                  ? 'bg-amber-400 shadow-lg shadow-amber-400/50'
                  : 'bg-neutral-800 border-l border-neutral-700 hover:brightness-150'
              }`}
            />
            {/* Tooltip on Hover */}
            {cameraControlHovered && (
              <div className="absolute left-8 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl bg-black/95 border border-amber-400 text-[10px] text-amber-300 whitespace-nowrap shadow-2xl z-50 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>Camera Control (کلیک برای باز کردن دوربین)</span>
              </div>
            )}
          </div>

          {/* FRONT VIEW: ULTRA-SLIM 1.15mm DISPLAY */}
          {viewAngle === 'front' || viewAngle === 'tilt3d' ? (
            <div
              className="w-full h-full rounded-[48px] bg-black p-[2.5px] relative overflow-hidden shadow-inner flex flex-col justify-between"
              style={{
                filter: `brightness(${brightness}%)`,
              }}
            >
              {/* Inner OLED Glass screen */}
              <div className="w-full h-full rounded-[46px] overflow-hidden relative bg-black flex flex-col">
                {children}
              </div>
            </div>
          ) : (
            /* BACK VIEW: PHOTOREALISTIC FROSTED GLASS & TRIPLE CAMERA ISLAND */
            <div
              className={`w-full h-full rounded-[48px] ${currentCfg.backGlass} p-6 relative overflow-hidden shadow-inner flex flex-col justify-between`}
            >
              {/* Top Left: Iconic iPhone 16 Pro Triple Camera Island */}
              <div
                className={`w-48 h-48 rounded-[40px] ${currentCfg.cameraIsland} p-3.5 shadow-2xl border border-white/20 relative`}
              >
                {/* 1. Main 48MP Fusion Lens */}
                <div className="absolute top-3.5 left-3.5 w-18 h-18 rounded-full bg-neutral-900 border-2 border-neutral-700 p-1.5 flex items-center justify-center shadow-lg group">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-neutral-950 via-blue-950 to-neutral-900 flex items-center justify-center border border-white/10 relative overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-blue-900/60 border border-blue-400/40"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {/* 2. 48MP Ultra Wide Lens */}
                <div className="absolute bottom-3.5 left-3.5 w-18 h-18 rounded-full bg-neutral-900 border-2 border-neutral-700 p-1.5 flex items-center justify-center shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-neutral-950 via-teal-950 to-neutral-900 flex items-center justify-center border border-white/10 relative overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-teal-900/60 border border-teal-400/40"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {/* 3. 12MP 5x Telephoto Tetraprism Lens */}
                <div className="absolute top-1/2 -translate-y-1/2 right-3.5 w-18 h-18 rounded-full bg-neutral-900 border-2 border-neutral-700 p-1.5 flex items-center justify-center shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-neutral-950 via-purple-950 to-neutral-900 flex items-center justify-center border border-white/10 relative overflow-hidden">
                    <div className="w-6 h-6 rounded-full bg-purple-900/60 border border-purple-400/40"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {/* True Tone Dual LED Flash */}
                <div
                  className={`absolute top-4 right-5 w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                    flashlightOn
                      ? 'bg-amber-300 border-amber-100 shadow-xl shadow-amber-300'
                      : 'bg-amber-100/80 border-amber-300/40'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60"></div>
                </div>

                {/* LiDAR Scanner Sensor */}
                <div className="absolute bottom-4 right-5 w-6 h-6 rounded-full bg-black border border-neutral-700 shadow-inner flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-neutral-900"></div>
                </div>
              </div>

              {/* Center: Laser-Etched Apple Logo */}
              <div className="my-auto mx-auto opacity-70 hover:opacity-90 transition-opacity">
                <svg viewBox="0 0 170 170" width="68" height="68" fill="currentColor" className="text-white drop-shadow-md">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.65-7.79-11.86-14.25-6.3-9.66-11.19-20.73-14.66-33.22-3.48-12.49-5.22-24.36-5.22-35.61 0-14.33 3.58-26.23 10.74-35.7 7.16-9.47 16.27-14.31 27.34-14.53 4.8 0 10.02 1.3 15.66 3.91 5.64 2.61 9.4 3.97 11.28 4.08 1.52-.11 5.48-1.52 11.87-4.22 6.39-2.7 11.66-3.97 15.82-3.8 11.75.54 21.08 4.78 27.99 12.72-10.23 6.2-15.24 14.8-15.02 25.8 0 8.81 3.48 16.42 10.45 22.84 6.96 6.42 15.34 10.12 25.13 11.1-2.18 6.31-4.78 12.74-7.82 19.3zM119.22 33.15c0-7.83 2.83-15.22 8.49-22.17 5.66-6.96 12.63-10.98 20.91-12.08.22 1.09.33 2.07.33 2.94 0 7.83-3.04 15.33-9.14 22.5-6.09 7.18-13.48 11.2-22.17 12.08-.22-1.09-.33-2.18-.33-3.27z"/>
                </svg>
              </div>

              {/* Bottom Specs Info */}
              <div className="text-center text-[10px] text-neutral-800 font-mono space-y-0.5">
                <p className="font-bold text-neutral-900 tracking-wider">iPhone 16 Pro Max · 1TB</p>
                <p className="opacity-80">Designed by Apple in California · Assembled in Titanium</p>
                <p className="text-[9px] text-neutral-700">{currentCfg.name}</p>
              </div>
            </div>
          )}

          {/* Bottom Speaker Grills & USB-C 3.2 Port */}
          <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 flex items-center gap-3">
            {/* Left speaker holes */}
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-neutral-800" />
              <div className="w-1 h-1 rounded-full bg-neutral-800" />
              <div className="w-1 h-1 rounded-full bg-neutral-800" />
            </div>
            {/* USB-C 3.2 High-Speed Port */}
            <div className="w-10 h-2.5 rounded-full bg-neutral-900 border border-neutral-700 shadow-inner flex items-center justify-center">
              <div className="w-6 h-1 rounded-full bg-neutral-700"></div>
            </div>
            {/* Right speaker holes */}
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-neutral-800" />
              <div className="w-1 h-1 rounded-full bg-neutral-800" />
              <div className="w-1 h-1 rounded-full bg-neutral-800" />
            </div>
          </div>

          {/* Antenna Bands */}
          <div className="absolute left-0 top-[80px] w-2.5 h-[3px] bg-neutral-600/50" />
          <div className="absolute right-0 top-[80px] w-2.5 h-[3px] bg-neutral-600/50" />
          <div className="absolute left-0 bottom-[80px] w-2.5 h-[3px] bg-neutral-600/50" />
          <div className="absolute right-0 bottom-[80px] w-2.5 h-[3px] bg-neutral-600/50" />
        </div>
      </div>
    </div>
  );
};
