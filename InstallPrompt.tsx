import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

interface Props {
  canInstall: boolean;
  installed: boolean;
  iosManual: boolean;
  onInstall: () => void;
  variant: 'button' | 'banner';
}

/** Install entry point: native prompt where supported, step-by-step guide on iOS Safari. */
export const InstallPrompt: React.FC<Props> = ({ canInstall, installed, iosManual, onInstall, variant }) => {
  const [guide, setGuide] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('aliphone_install_dismissed') === '1');
  if (installed || (!canInstall && !iosManual)) return null;

  const act = () => (canInstall ? onInstall() : setGuide(true));
  const dismiss = () => { localStorage.setItem('aliphone_install_dismissed', '1'); setDismissed(true); };

  return (
    <>
      {variant === 'button' ? (
        <button
          onClick={act}
          className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">نصب برنامه</span>
        </button>
      ) : (
        !dismissed && (
          <div
            className="fixed inset-x-3 z-[100] rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-white/10 p-3 flex items-center gap-3 shadow-2xl"
            style={{ bottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
          >
            <img src="/icons/icon-192.png" alt="" className="w-11 h-11 rounded-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">ALI phone را نصب کنید</p>
              <p className="text-[11px] text-neutral-400">تمام‌صفحه، بدون مرورگر و آفلاین</p>
            </div>
            <button onClick={act} className="px-3.5 py-1.5 rounded-full bg-blue-500 text-white text-xs font-bold">نصب</button>
            <button onClick={dismiss} aria-label="بستن" className="p-1 text-neutral-500"><X className="w-4 h-4" /></button>
          </div>
        )
      )}

      {guide && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setGuide(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-white/10 p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-white">نصب روی آیفون</h3>
            <ol className="space-y-3 text-sm text-neutral-200">
              <li className="flex items-center gap-3"><Share className="w-5 h-5 text-blue-400 shrink-0" /><span>در Safari دکمه <b>Share</b> را بزنید.</span></li>
              <li className="flex items-center gap-3"><PlusSquare className="w-5 h-5 text-blue-400 shrink-0" /><span>گزینه <b>Add to Home Screen</b> را انتخاب کنید.</span></li>
              <li className="flex items-center gap-3"><Download className="w-5 h-5 text-blue-400 shrink-0" /><span>روی <b>Add</b> بزنید؛ آیکون روی صفحه‌ی اصلی ساخته می‌شود.</span></li>
            </ol>
            <button onClick={() => setGuide(false)} className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-bold">متوجه شدم</button>
          </div>
        </div>
      )}
    </>
  );
};
