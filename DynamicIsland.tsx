import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, PhoneCall, Timer, Zap, Sparkles, X, Play, Pause, SkipForward, Flashlight } from 'lucide-react';
import { DynamicIslandState } from '../../types/phone';
import { soundEffects } from '../../utils/soundEffects';

interface DynamicIslandProps {
  state: DynamicIslandState;
  onUpdateState: (newState: Partial<DynamicIslandState>) => void;
  onOpenApp?: (appId: string) => void;
  isMusicPlaying?: boolean;
  onToggleMusic?: () => void;
  currentTrackTitle?: string;
  soundEnabled?: boolean;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  state,
  onUpdateState,
  onOpenApp,
  isMusicPlaying = false,
  onToggleMusic,
  currentTrackTitle = 'ALI Pro Audio Track',
  soundEnabled = true,
}) => {
  const isExpanded = state.expanded;

  const handleIslandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.click(soundEnabled);
    if (state.type !== 'idle') {
      onUpdateState({ expanded: !isExpanded });
    }
  };

  return (
    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-auto">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        onClick={handleIslandClick}
        className={`bg-black text-white cursor-pointer select-none relative overflow-hidden flex items-center justify-between border border-neutral-800/60 shadow-2xl ${
          isExpanded
            ? 'w-[340px] h-[130px] rounded-[36px] p-4'
            : state.type === 'music'
            ? 'w-[200px] h-[34px] rounded-full px-3'
            : state.type === 'call'
            ? 'w-[210px] h-[34px] rounded-full px-3'
            : state.type === 'timer'
            ? 'w-[185px] h-[34px] rounded-full px-3'
            : state.type === 'assistant'
            ? 'w-[210px] h-[34px] rounded-full px-3 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900'
            : 'w-[124px] h-[32px] rounded-full px-2.5'
        }`}
      >
        {/* Hardware TrueDepth Camera & Sensor optics reflection */}
        <div className="absolute top-1/2 left-3 -translate-y-1/2 flex items-center gap-1.5 opacity-40 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700/50 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-950/80" />
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
        </div>

        {/* Content based on state */}
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-full flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {state.type === 'music' && (
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Music2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-400">Now Playing</p>
                      <p className="text-sm font-semibold truncate text-white">{currentTrackTitle}</p>
                      <p className="text-[11px] text-neutral-400">iPhone 16 Pro Max Spatial</p>
                    </div>
                    <button
                      onClick={() => onUpdateState({ expanded: false })}
                      className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-2 pt-1 border-t border-neutral-800/80">
                    <button
                      onClick={() => onOpenApp?.('music')}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      باز کردن موزیک
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={onToggleMusic}
                        className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center active:scale-95 transition-transform"
                      >
                        {isMusicPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {state.type === 'call' && (
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center">
                      <PhoneCall className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-emerald-400 font-medium">تماس در جریان</p>
                      <p className="text-sm font-semibold truncate">{state.title || 'مهندس علی'}</p>
                      <p className="text-[11px] text-neutral-400 font-mono">01:42</p>
                    </div>
                    <button
                      onClick={() => onUpdateState({ type: 'idle', expanded: false })}
                      className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-xs text-white font-medium"
                    >
                      قطع تماس
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-xs text-neutral-400 pt-1 border-t border-neutral-800">
                    <span>کیفیت صدا: HD Voice</span>
                    <button onClick={() => onOpenApp?.('phone')} className="text-emerald-400 hover:underline">
                      صفحه تماس
                    </button>
                  </div>
                </div>
              )}

              {state.type === 'timer' && (
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                      <Timer className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-neutral-400">تایمر فعال</p>
                      <p className="text-2xl font-bold font-mono tracking-tight text-amber-400">
                        {state.remainingSeconds ? `${Math.floor(state.remainingSeconds / 60)}:${(state.remainingSeconds % 60).toString().padStart(2, '0')}` : '04:59'}
                      </p>
                    </div>
                    <button
                      onClick={() => onUpdateState({ type: 'idle', expanded: false })}
                      className="px-3 py-1 rounded-full bg-neutral-800 text-xs text-neutral-300 hover:text-white"
                    >
                      توقف
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => onOpenApp?.('clock')} className="text-xs text-amber-400 hover:underline">
                      باز کردن تایمر
                    </button>
                  </div>
                </div>
              )}

              {state.type === 'assistant' && (
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20 animate-spin" style={{ animationDuration: '6s' }}>
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-pink-400 font-medium">ALI Intelligence</p>
                      <p className="text-xs text-neutral-300">در حال پردازش درخواست شما...</p>
                    </div>
                    <button
                      onClick={() => onUpdateState({ type: 'idle', expanded: false })}
                      className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-between text-xs font-medium px-1"
            >
              {state.type === 'idle' && (
                <div className="w-full flex items-center justify-between px-1">
                  <div className="w-2.5 h-2.5" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700/30" />
                </div>
              )}

              {state.type === 'music' && (
                <>
                  <div className="flex items-center gap-1.5 ml-3">
                    <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                      <Music2 className="w-2.5 h-2.5 text-black" />
                    </div>
                    <span className="text-[11px] text-neutral-300 truncate max-w-[85px]">{currentTrackTitle}</span>
                  </div>
                  {/* Waveform animation */}
                  <div className="flex items-center gap-0.5 mr-2">
                    <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-pulse" />
                    <span className="w-0.5 h-4 bg-amber-300 rounded-full animate-bounce" />
                    <span className="w-0.5 h-2 bg-amber-500 rounded-full animate-pulse" />
                  </div>
                </>
              )}

              {state.type === 'call' && (
                <>
                  <div className="flex items-center gap-1.5 ml-3">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-emerald-400 font-mono">01:42</span>
                  </div>
                  <div className="flex items-center gap-1 mr-2 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px]">{state.title || 'علی'}</span>
                  </div>
                </>
              )}

              {state.type === 'timer' && (
                <>
                  <div className="flex items-center gap-1.5 ml-3">
                    <Timer className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] text-amber-400 font-mono">
                      {state.remainingSeconds ? `${Math.floor(state.remainingSeconds / 60)}:${(state.remainingSeconds % 60).toString().padStart(2, '0')}` : '04:59'}
                    </span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-amber-400 mr-2" />
                </>
              )}

              {state.type === 'assistant' && (
                <>
                  <div className="flex items-center gap-1.5 ml-3">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                    <span className="text-[11px] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 font-medium">ALI AI</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-pink-400 mr-2 animate-ping" />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
