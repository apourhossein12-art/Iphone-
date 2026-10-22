import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Plus, Trash2, Loader2 } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { audioEngine, AudioState } from '../../utils/audioEngine';

interface MusicAppProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTrack: string;
  onSelectTrack: (title: string) => void;
  soundEnabled: boolean;
}

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
};

export const MusicApp: React.FC<MusicAppProps> = ({ soundEnabled }) => {
  const [st, setSt] = useState<AudioState>(audioEngine.getState());
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => audioEngine.subscribe(setSt), []);

  const pct = st.duration ? (st.currentTime / st.duration) * 100 : 0;
  const tap = () => soundEffects.click(soundEnabled);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white select-none pt-16">
      <div className="flex items-center justify-between px-6">
        <span className="text-[11px] text-amber-400 font-semibold">Music</span>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1 text-[11px] text-neutral-200 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full"
        >
          <Plus className="w-3 h-3" /> افزودن آهنگ
        </button>
        <input ref={fileRef} type="file" accept="audio/*" multiple hidden onChange={(e) => { if (e.target.files) audioEngine.importFiles(e.target.files); e.target.value = ''; }} />
      </div>

      <div className="flex flex-col items-center px-6 mt-4">
        <div className="w-52 h-52 rounded-3xl bg-gradient-to-tr from-amber-600 via-rose-600 to-indigo-800 p-1 shadow-2xl shadow-rose-950/40">
          <div className="w-full h-full rounded-[22px] bg-neutral-900 flex items-center justify-center relative overflow-hidden">
            {st.loading ? <Loader2 className="w-10 h-10 text-amber-400 animate-spin" /> : <Music className="w-14 h-14 text-amber-400/80" />}
            {st.playing && (
              <div className="absolute bottom-4 flex items-end gap-1">
                {[4, 8, 14, 18, 12, 16, 7, 10].map((h, i) => (
                  <span key={i} className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: h * 1.5, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="mt-4 text-sm font-bold text-center line-clamp-1">{st.track?.title ?? 'آهنگی انتخاب نشده'}</p>
        <p className="text-xs text-neutral-400">{st.track?.artist ?? ''}</p>
      </div>

      <div className="px-6 mt-4">
        <input
          type="range" min={0} max={st.duration || 1} step={0.1} value={st.currentTime}
          onChange={(e) => audioEngine.seek(parseFloat(e.target.value))}
          className="w-full accent-white h-1" dir="ltr"
          style={{ background: `linear-gradient(to right,#fff ${pct}%,rgba(255,255,255,.2) ${pct}%)` }}
        />
        <div className="flex justify-between text-[10px] text-neutral-400 mt-1 tabular-nums" dir="ltr">
          <span>{fmt(st.currentTime)}</span><span>-{fmt(st.duration - st.currentTime)}</span>
        </div>
        <div className="flex items-center justify-center gap-9 mt-1" dir="ltr">
          <button onClick={() => { tap(); audioEngine.prev(); }} aria-label="قبلی"><SkipBack className="w-7 h-7 fill-white" /></button>
          <button onClick={() => { tap(); audioEngine.toggle(); }} aria-label="پخش/مکث" className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center active:scale-95 transition-transform">
            {st.playing ? <Pause className="w-7 h-7 fill-black" /> : <Play className="w-7 h-7 fill-black ml-0.5" />}
          </button>
          <button onClick={() => { tap(); audioEngine.next(); }} aria-label="بعدی"><SkipForward className="w-7 h-7 fill-white" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 mt-4 pb-14 space-y-1">
        {st.tracks.map((t) => (
          <div key={t.id} onClick={() => { tap(); audioEngine.play(t.id); }}
            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer ${st.track?.id === t.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
            <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
              {st.track?.id === t.id && st.playing ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-neutral-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{t.title}</p>
              <p className="text-[10px] text-neutral-400 truncate">{t.artist}</p>
            </div>
            {!t.builtin && (
              <button onClick={(e) => { e.stopPropagation(); audioEngine.remove(t.id); }} aria-label="حذف" className="p-1.5 text-neutral-500 hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
