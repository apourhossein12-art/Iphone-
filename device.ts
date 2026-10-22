import { useEffect, useRef, useState, useCallback } from 'react';

/* ---------- Service worker ---------- */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Look for a new version whenever the installed app comes back to the foreground.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    }).catch((e) => console.warn('SW registration failed', e));

    // A new service worker took over: reload once, without interrupting the user mid-use.
    let hadController = !!navigator.serviceWorker.controller;
    let reloadPending = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) { hadController = true; return; } // first install, nothing to refresh
      if (reloadPending) return;
      reloadPending = true;
      if (document.visibilityState === 'hidden') location.reload();
      else document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') location.reload(); });
    });
  });
}

/* ---------- Display mode ---------- */
export const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: fullscreen)').matches ||
  (navigator as any).standalone === true;

export const isIOS = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** Native mode: the OS fills the whole screen (real phone / installed on a phone) instead of the desktop chassis. */
export function useIsNative(): boolean {
  const compute = () =>
    window.matchMedia('(max-width: 600px)').matches ||
    (isStandalone() && window.matchMedia('(pointer: coarse)').matches);
  const [native, setNative] = useState(compute);
  useEffect(() => {
    const update = () => setNative(compute());
    const qs = ['(max-width: 600px)', '(display-mode: standalone)', '(pointer: coarse)'].map((q) => window.matchMedia(q));
    qs.forEach((q) => q.addEventListener('change', update));
    window.addEventListener('resize', update);
    return () => {
      qs.forEach((q) => q.removeEventListener('change', update));
      window.removeEventListener('resize', update);
    };
  }, []);
  return native;
}

/* ---------- Battery (Chromium; iOS Safari does not expose it) ---------- */
export interface BatteryInfo { supported: boolean; level: number; charging: boolean }
export function useBattery(): BatteryInfo {
  const [info, setInfo] = useState<BatteryInfo>({ supported: false, level: 1, charging: false });
  useEffect(() => {
    let battery: any;
    let dead = false;
    const sync = () => battery && !dead && setInfo({ supported: true, level: battery.level, charging: battery.charging });
    (navigator as any).getBattery?.().then((b: any) => {
      battery = b;
      sync();
      ['levelchange', 'chargingchange'].forEach((ev) => b.addEventListener(ev, sync));
    }).catch(() => {});
    return () => {
      dead = true;
      if (battery) ['levelchange', 'chargingchange'].forEach((ev) => battery.removeEventListener(ev, sync));
    };
  }, []);
  return info;
}

/* ---------- Network ---------- */
export interface NetworkInfo { online: boolean; cellular: boolean; label: string }
export function useNetwork(): NetworkInfo {
  const read = (): NetworkInfo => {
    const c = (navigator as any).connection;
    const cellular = c?.type === 'cellular';
    const eff: string = c?.effectiveType || '';
    const label = eff === '4g' ? '4G' : eff === '3g' ? '3G' : eff === '2g' || eff === 'slow-2g' ? 'E' : '5G';
    return { online: navigator.onLine, cellular, label };
  };
  const [net, setNet] = useState<NetworkInfo>(read);
  useEffect(() => {
    const u = () => setNet(read());
    window.addEventListener('online', u);
    window.addEventListener('offline', u);
    (navigator as any).connection?.addEventListener?.('change', u);
    return () => {
      window.removeEventListener('online', u);
      window.removeEventListener('offline', u);
      (navigator as any).connection?.removeEventListener?.('change', u);
    };
  }, []);
  return net;
}

/* ---------- Real flashlight (torch) where the device supports it ---------- */
export function useTorch(on: boolean) {
  const streamRef = useRef<MediaStream | null>(null);
  useEffect(() => {
    let cancelled = false;
    const stop = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    if (!on) { stop(); return; }
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        const caps: any = track.getCapabilities?.() ?? {};
        if (caps.torch) await track.applyConstraints({ advanced: [{ torch: true } as any] });
        else stop(); // no torch hardware: keep the on-screen light only
      } catch { /* permission denied or no camera */ }
    })();
    return () => { cancelled = true; stop(); };
  }, [on]);
}

/* ---------- Keep screen awake while the phone is unlocked ---------- */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    let lock: any;
    const acquire = async () => {
      try { lock = await (navigator as any).wakeLock?.request('screen'); } catch {}
    };
    if (active) {
      acquire();
      const onVis = () => document.visibilityState === 'visible' && acquire();
      document.addEventListener('visibilitychange', onVis);
      return () => { document.removeEventListener('visibilitychange', onVis); lock?.release?.().catch(() => {}); };
    }
  }, [active]);
}

/* ---------- Install prompt ---------- */
export function useInstallPrompt() {
  const deferred = useRef<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(isStandalone());
  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); deferred.current = e; setCanInstall(true); };
    const onInstalled = () => { setInstalled(true); setCanInstall(false); deferred.current = null; };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);
  const install = useCallback(async () => {
    if (!deferred.current) return false;
    deferred.current.prompt();
    const { outcome } = await deferred.current.userChoice;
    deferred.current = null;
    setCanInstall(false);
    return outcome === 'accepted';
  }, []);
  return { canInstall, installed, install, iosManual: isIOS() && !installed };
}

/* ---------- Locale-correct date (real calendar, not hard-coded) ---------- */
export function formatLongDate(
  date: Date,
  language: string,
  calendar: 'persian' | 'gregorian' | 'islamic',
  numberSystem: 'persian' | 'latin' | 'arabic'
): string {
  const locale: Record<string, string> = { fa: 'fa-IR', ar: 'ar-SA', de: 'de-DE', fr: 'fr-FR', tr: 'tr-TR', en: 'en-US' };
  const ca = calendar === 'persian' ? 'persian' : calendar === 'islamic' ? 'islamic-umalqura' : 'gregory';
  const nu = numberSystem === 'persian' ? 'arabext' : numberSystem === 'arabic' ? 'arab' : 'latn';
  try {
    return new Intl.DateTimeFormat(`${locale[language] ?? 'en-US'}-u-ca-${ca}-nu-${nu}`, {
      weekday: 'long', day: 'numeric', month: 'long',
    }).format(date);
  } catch {
    return date.toDateString();
  }
}
