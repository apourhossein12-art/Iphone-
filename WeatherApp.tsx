import React, { useCallback, useEffect, useState } from 'react';
import { Sun, Moon, Cloud, CloudSun, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind, Droplets, Thermometer, MapPin, Search, LocateFixed, Loader2, WifiOff, X } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface WeatherAppProps { soundEnabled: boolean }
interface City { name: string; lat: number; lon: number }
interface Forecast {
  fetchedAt: number;
  current: { temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; weather_code: number; wind_speed_10m: number; is_day: number; time: string };
  hourly: { time: string[]; temperature_2m: number[]; weather_code: number[] };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; uv_index_max: number[] };
}

const DEFAULT_CITY: City = { name: 'تهران', lat: 35.6892, lon: 51.389 };
const fa = (n: number, d = 0) => n.toLocaleString('fa-IR', { maximumFractionDigits: d });

function describe(code: number, isDay = 1): { text: string; Icon: React.ElementType } {
  if (code === 0) return { text: isDay ? 'آفتابی' : 'آسمان صاف', Icon: isDay ? Sun : Moon };
  if (code <= 2) return { text: 'کمی ابری', Icon: CloudSun };
  if (code === 3) return { text: 'ابری', Icon: Cloud };
  if (code <= 48) return { text: 'مه‌آلود', Icon: CloudFog };
  if (code <= 57) return { text: 'نم‌نم باران', Icon: CloudRain };
  if (code <= 67 || (code >= 80 && code <= 82)) return { text: 'بارانی', Icon: CloudRain };
  if (code <= 77 || code === 85 || code === 86) return { text: 'برفی', Icon: CloudSnow };
  return { text: 'رعد و برق', Icon: CloudLightning };
}

const load = <T,>(k: string, fb: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };

export const WeatherApp: React.FC<WeatherAppProps> = ({ soundEnabled }) => {
  const [cities, setCities] = useState<City[]>(() => load('aliphone_weather_cities', [DEFAULT_CITY]));
  const [active, setActive] = useState<City>(() => load('aliphone_weather_active', DEFAULT_CITY));
  const [data, setData] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchWeather = useCallback(async (c: City) => {
    const key = `aliphone_weather_${c.lat.toFixed(2)}_${c.lon.toFixed(2)}`;
    setLoading(true); setError(null); setOffline(false);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto&forecast_days=7`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('bad response');
      const json = await res.json();
      const f: Forecast = { fetchedAt: Date.now(), current: json.current, hourly: json.hourly, daily: json.daily };
      localStorage.setItem(key, JSON.stringify(f));
      setData(f);
    } catch {
      const cached = load<Forecast | null>(key, null);
      if (cached) { setData(cached); setOffline(true); } else { setData(null); setError('اتصال اینترنت برقرار نیست و داده‌ای ذخیره نشده است.'); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWeather(active); localStorage.setItem('aliphone_weather_active', JSON.stringify(active)); }, [active, fetchWeather]);
  useEffect(() => { localStorage.setItem('aliphone_weather_cities', JSON.stringify(cities)); }, [cities]);

  const addCity = (c: City) => {
    soundEffects.click(soundEnabled);
    setCities((prev) => (prev.some((p) => Math.abs(p.lat - c.lat) < 0.05 && Math.abs(p.lon - c.lon) < 0.05) ? prev : [...prev, c]));
    setActive(c); setQuery(''); setResults([]);
  };

  const search = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=fa`);
      const j = await r.json();
      setResults((j.results ?? []).map((x: any) => ({ name: x.admin1 && x.admin1 !== x.name ? `${x.name}، ${x.admin1}` : x.name, lat: x.latitude, lon: x.longitude })));
    } catch { setResults([]); } finally { setSearching(false); }
  };

  const locate = () => {
    soundEffects.click(soundEnabled);
    if (!navigator.geolocation) { setError('این دستگاه مکان‌یابی را پشتیبانی نمی‌کند.'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => addCity({ name: 'موقعیت من', lat: p.coords.latitude, lon: p.coords.longitude }),
      () => { setLoading(false); setError('دسترسی به مکان داده نشد. در تنظیمات مرورگر اجازه دهید.'); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  };

  const cur = data ? describe(data.current.weather_code, data.current.is_day) : null;
  const nowIdx = data ? Math.max(0, data.hourly.time.findIndex((t) => t >= data.current.time.slice(0, 13))) : 0;
  const dayName = (iso: string, i: number) => (i === 0 ? 'امروز' : new Date(iso + 'T12:00').toLocaleDateString('fa-IR', { weekday: 'long' }));

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-sky-700 via-blue-900 to-slate-950 text-white pt-14 select-none">
      <div className="px-4 flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-white/60" />
          <input value={query} onChange={(e) => search(e.target.value)} placeholder="جستجوی شهر"
            className="w-full ps-8 pe-8 py-2 rounded-xl bg-white/15 placeholder:text-white/50 text-xs outline-none focus:bg-white/20" />
          {query && <button onClick={() => { setQuery(''); setResults([]); }} className="absolute top-1/2 -translate-y-1/2 end-2.5"><X className="w-3.5 h-3.5 text-white/60" /></button>}
        </div>
        <button onClick={locate} aria-label="موقعیت من" className="p-2 rounded-xl bg-white/15 hover:bg-white/25"><LocateFixed className="w-4 h-4" /></button>
      </div>

      {(results.length > 0 || searching) && (
        <div className="mx-4 mt-2 rounded-xl bg-black/50 backdrop-blur divide-y divide-white/10 text-xs overflow-hidden">
          {searching && <div className="p-3 flex items-center gap-2 text-white/70"><Loader2 className="w-3.5 h-3.5 animate-spin" /> در حال جستجو…</div>}
          {results.map((r, i) => (
            <button key={i} onClick={() => addCity(r)} className="w-full text-start p-3 hover:bg-white/10 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-white/60" />{r.name}</button>
          ))}
        </div>
      )}

      <div className="px-4 mt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {cities.map((c) => (
          <button key={c.name + c.lat} onClick={() => { soundEffects.click(soundEnabled); setActive(c); }}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] ${active.lat === c.lat && active.lon === c.lon ? 'bg-white text-slate-900 font-bold' : 'bg-white/15 text-white/80'}`}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-14 mt-2">
        {loading && !data && <div className="py-16 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-white/70" /></div>}
        {error && !data && <p className="py-12 text-center text-xs text-white/70 leading-relaxed">{error}</p>}
        {offline && data && (
          <div className="mt-1 mb-2 flex items-center gap-1.5 text-[10px] text-amber-200 bg-amber-500/15 rounded-lg px-2.5 py-1.5">
            <WifiOff className="w-3 h-3" /> آفلاین؛ آخرین داده‌ی ذخیره‌شده ({new Date(data.fetchedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })})
          </div>
        )}
        {data && cur && (
          <>
            <div className="text-center py-4">
              <p className="text-lg font-semibold">{active.name}</p>
              <p className="text-7xl font-extralight tracking-tight leading-none mt-1" dir="ltr">{fa(data.current.temperature_2m)}°</p>
              <p className="text-sm text-white/90 mt-1 flex items-center justify-center gap-1.5"><cur.Icon className="w-4 h-4" />{cur.text}</p>
              <p className="text-xs text-white/70 mt-0.5">
                حداکثر {fa(data.daily.temperature_2m_max[0])}° · حداقل {fa(data.daily.temperature_2m_min[0])}°
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur p-3">
              <p className="text-[10px] text-white/60 mb-2">پیش‌بینی ساعتی</p>
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {data.hourly.time.slice(nowIdx, nowIdx + 24).map((t, i) => {
                  const d = describe(data.hourly.weather_code[nowIdx + i]);
                  return (
                    <div key={t} className="flex flex-col items-center gap-1.5 shrink-0 text-xs">
                      <span className="text-white/70">{i === 0 ? 'اکنون' : fa(parseInt(t.slice(11, 13)))}</span>
                      <d.Icon className="w-5 h-5" />
                      <span>{fa(data.hourly.temperature_2m[nowIdx + i])}°</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur p-3 mt-3">
              <p className="text-[10px] text-white/60 mb-1">پیش‌بینی ۷ روزه</p>
              {data.daily.time.map((d, i) => {
                const w = describe(data.daily.weather_code[i]);
                return (
                  <div key={d} className="flex items-center justify-between py-2 border-t border-white/10 first:border-0 text-xs">
                    <span className="w-16">{dayName(d, i)}</span>
                    <w.Icon className="w-5 h-5" />
                    <span className="w-24 text-end text-white/80">{fa(data.daily.temperature_2m_min[i])}° — {fa(data.daily.temperature_2m_max[i])}°</span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              {[
                { I: Thermometer, l: 'دمای احساس‌شده', v: `${fa(data.current.apparent_temperature)}°` },
                { I: Droplets, l: 'رطوبت', v: `${fa(data.current.relative_humidity_2m)}٪` },
                { I: Wind, l: 'باد', v: `${fa(data.current.wind_speed_10m)} km/h` },
                { I: Sun, l: 'شاخص UV', v: fa(data.daily.uv_index_max[0]) },
              ].map(({ I, l, v }) => (
                <div key={l} className="rounded-2xl bg-white/10 backdrop-blur p-3">
                  <p className="text-[10px] text-white/60 flex items-center gap-1"><I className="w-3 h-3" />{l}</p>
                  <p className="text-xl font-light mt-1" dir="ltr">{v}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
