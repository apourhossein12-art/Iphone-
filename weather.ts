import { useEffect, useState } from 'react';

export interface WeatherSummary { city: string; temp: number; text: string }

const textFor = (c: number, day: number) =>
  c === 0 ? (day ? 'آفتابی' : 'آسمان صاف') : c <= 2 ? 'کمی ابری' : c === 3 ? 'ابری' : c <= 48 ? 'مه‌آلود' :
  c <= 67 || (c >= 80 && c <= 82) ? 'بارانی' : c <= 77 || c === 85 || c === 86 ? 'برفی' : 'رعد و برق';

/** Live temperature for the city selected in the Weather app (falls back to Tehran), cached for offline. */
export function useWeatherSummary(): WeatherSummary | null {
  const [w, setW] = useState<WeatherSummary | null>(null);
  useEffect(() => {
    let dead = false;
    let city = { name: 'تهران', lat: 35.6892, lon: 51.389 };
    try { const s = localStorage.getItem('aliphone_weather_active'); if (s) city = JSON.parse(s); } catch {}
    const key = `aliphone_wsum_${city.lat.toFixed(2)}_${city.lon.toFixed(2)}`;
    try { const c = localStorage.getItem(key); if (c && !dead) setW(JSON.parse(c)); } catch {}
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,is_day&timezone=auto`)
      .then((r) => r.json())
      .then((j) => {
        const v = { city: city.name, temp: j.current.temperature_2m, text: textFor(j.current.weather_code, j.current.is_day) };
        localStorage.setItem(key, JSON.stringify(v));
        if (!dead) setW(v);
      })
      .catch(() => {});
    return () => { dead = true; };
  }, []);
  return w;
}
