import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Tag,
  Trash2,
  Check,
  Search,
  Bell,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { CalendarType, NumberSystem, AppLanguage, CalendarEvent } from '../../types/phone';
import { soundEffects } from '../../utils/soundEffects';
import { formatDigits } from '../../utils/i18n';

interface CalendarAppProps {
  calendarType: CalendarType;
  onSelectCalendarType: (type: CalendarType) => void;
  numberSystem: NumberSystem;
  language: AppLanguage;
  soundEnabled: boolean;
}

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'جلسه بررسی راه‌اندازی استریم ابری اندروید',
    date: '2026-10-22',
    startTime: '10:00',
    endTime: '11:30',
    location: 'دفتر مرکزی - اتاق کنفرانس هوش مصنوعی',
    color: 'bg-blue-500',
    reminder: '15 دقیقه قبل',
    notes: 'بررسی اتصال Appetize.io و تست باینری‌های ARM64 روی علی‌فون',
  },
  {
    id: 'evt-2',
    title: 'تست بنچمارک پردازنده A18 Pro با پایتون ۳',
    date: '2026-10-22',
    startTime: '14:00',
    endTime: '15:00',
    location: 'آزمایشگاه نرم‌افزار',
    color: 'bg-purple-500',
    reminder: '30 دقیقه قبل',
    notes: 'اجرای محاسبات سنگین ریاضی و آمار در ترمینال',
  },
  {
    id: 'evt-3',
    title: 'جشن آبانگان (رویداد باستانی تقویم ایرانی)',
    date: '2026-10-26',
    startTime: '09:00',
    endTime: '21:00',
    location: 'ایران',
    color: 'bg-emerald-500',
    notes: 'روز گرامیداشت آب و آبادانی در گاه‌شماری ایرانی',
  },
  {
    id: 'evt-4',
    title: 'روز بزرگداشت کوروش بزرگ',
    date: '2026-10-29',
    startTime: '08:00',
    endTime: '18:00',
    location: 'پاسارگاد، فارس',
    color: 'bg-amber-500',
    notes: 'رویداد تاریخی ملی',
  },
];

export const CalendarApp: React.FC<CalendarAppProps> = ({
  calendarType,
  onSelectCalendarType,
  numberSystem,
  language,
  soundEnabled,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'day' | 'agenda'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('aliphone_calendar_events');
      return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
    } catch {
      return DEFAULT_EVENTS;
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('12:00');
  const [newEndTime, setNewEndTime] = useState('13:00');
  const [newLocation, setNewLocation] = useState('');
  const [newColor, setNewColor] = useState('bg-blue-500');
  const [newNotes, setNewNotes] = useState('');

  // Save events
  useEffect(() => {
    try {
      localStorage.setItem('aliphone_calendar_events', JSON.stringify(events));
    } catch {}
  }, [events]);

  // Calendar formatter
  const formatHeader = (date: Date) => {
    const locale = calendarType === 'persian' ? 'fa-IR-u-ca-persian' : calendarType === 'islamic' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatDayNumber = (date: Date) => {
    const locale = calendarType === 'persian' ? 'fa-IR-u-ca-persian' : calendarType === 'islamic' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US';
    const dayStr = new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(date);
    return formatDigits(dayStr, numberSystem);
  };

  const formatFullDate = (date: Date) => {
    const locale = calendarType === 'persian' ? 'fa-IR-u-ca-persian' : calendarType === 'islamic' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  // Generate 35 days for current calendar month view
  const getMonthDays = (current: Date) => {
    const days: Date[] = [];
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 is Sunday

    for (let i = -startDayOfWeek; i < 35 - startDayOfWeek; i++) {
      const d = new Date(year, month, 1 + i);
      days.push(d);
    }
    return days;
  };

  const monthDays = getMonthDays(selectedDate);
  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Filter events for selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedDayEvents = events.filter((e) => e.date === selectedDateStr);

  const handleAddEvent = () => {
    if (!newTitle.trim()) return;
    soundEffects.click(soundEnabled);
    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newTitle.trim(),
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      location: newLocation.trim() || undefined,
      color: newColor,
      notes: newNotes.trim() || undefined,
    };
    setEvents([...events, newEvt]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewLocation('');
    setNewNotes('');
    soundEffects.notification(soundEnabled);
  };

  const handleDeleteEvent = (id: string) => {
    soundEffects.click(soundEnabled);
    setEvents(events.filter((e) => e.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white select-none">
      {/* Top Header Bar (iOS Calendar styling) */}
      <div className="pt-13 px-4 pb-2 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-md">
            <span className="font-bold text-sm font-mono">{today.getDate()}</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">تقویم علی‌فون (Calendar)</h1>
            <p className="text-[10px] text-rose-400 font-medium">{formatHeader(selectedDate)}</p>
          </div>
        </div>

        {/* Calendar Type & Add Event */}
        <div className="flex items-center gap-1.5">
          <select
            value={calendarType}
            onChange={(e) => {
              soundEffects.click(soundEnabled);
              onSelectCalendarType(e.target.value as CalendarType);
            }}
            className="bg-neutral-800 border border-neutral-700 rounded-xl px-2 py-1 text-[11px] text-white focus:outline-none"
          >
            <option value="persian">هجری شمسی (جلالی)</option>
            <option value="gregorian">میلادی (Gregorian)</option>
            <option value="islamic">هجری قمری</option>
          </select>

          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setIsAddModalOpen(true);
            }}
            className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md active:scale-95 transition-all"
            title="افزودن رویداد جدید"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation & View Mode Switcher */}
      <div className="flex items-center justify-between p-2 bg-neutral-900 border-b border-neutral-800 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              const prev = new Date(selectedDate);
              prev.setMonth(prev.getMonth() - 1);
              setSelectedDate(prev);
            }}
            className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setSelectedDate(new Date());
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-400 font-bold text-[11px] hover:bg-rose-600/30"
          >
            امروز
          </button>

          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              const next = new Date(selectedDate);
              next.setMonth(next.getMonth() + 1);
              setSelectedDate(next);
            }}
            className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* View Switcher Chips */}
        <div className="flex items-center gap-1 bg-neutral-800/80 p-0.5 rounded-xl border border-neutral-700/60 text-[11px]">
          <button
            onClick={() => setViewMode('month')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              viewMode === 'month' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            ماهانه
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              viewMode === 'day' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            روزانه
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              viewMode === 'agenda' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            رویدادها ({events.length})
          </button>
        </div>
      </div>

      {/* Main Viewport Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================================================================== */}
        {/* VIEW 1: MONTH GRID VIEW                                            */}
        {/* ================================================================== */}
        {viewMode === 'month' && (
          <div className="space-y-4">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-neutral-400 font-bold pb-1 border-b border-neutral-800">
              <span>ش</span>
              <span>ی</span>
              <span>د</span>
              <span>س</span>
              <span>چ</span>
              <span>پ</span>
              <span className="text-rose-400">ج</span>
            </div>

            {/* 35-Day Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {monthDays.map((date, idx) => {
                const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                const isCurrentToday = isSameDay(date, today);
                const isSelected = isSameDay(date, selectedDate);
                const dateIso = date.toISOString().split('T')[0];
                const dayHasEvents = events.some((e) => e.date === dateIso);

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      soundEffects.click(soundEnabled);
                      setSelectedDate(date);
                    }}
                    className={`h-11 rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30'
                        : isCurrentToday
                        ? 'bg-neutral-800 text-rose-400 font-bold border border-rose-500/40'
                        : isCurrentMonth
                        ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200'
                        : 'bg-neutral-950 text-neutral-600'
                    }`}
                  >
                    <span className="text-xs font-mono">{formatDayNumber(date)}</span>
                    {dayHasEvents && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Summary & Events */}
            <div className="p-3.5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold text-white">{formatFullDate(selectedDate)}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-rose-400 font-mono">
                  {selectedDayEvents.length} رویداد
                </span>
              </div>

              {selectedDayEvents.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-4">رویدادی برای این روز ثبت نشده است.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 flex items-start justify-between gap-2 shadow-sm"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${evt.color}`} />
                        <div>
                          <h4 className="text-xs font-bold text-white">{evt.title}</h4>
                          <p className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono">{evt.startTime} - {evt.endTime}</span>
                            {evt.location && <span>· {evt.location}</span>}
                          </p>
                          {evt.notes && (
                            <p className="text-[10px] text-neutral-500 mt-1">{evt.notes}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1 text-neutral-500 hover:text-rose-400"
                        title="حذف رویداد"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* VIEW 2: 24-HOUR DAY VIEW                                           */}
        {/* ================================================================== */}
        {viewMode === 'day' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white">{formatFullDate(selectedDate)}</span>
              <span className="text-[10px] text-rose-400 font-mono">برنامه ۲۴ ساعته</span>
            </div>

            {/* 24 Hour Slots */}
            <div className="space-y-1 relative">
              {Array.from({ length: 24 }).map((_, hour) => {
                const hourFormatted = `${hour.toString().padStart(2, '0')}:00`;
                const matchingEvt = selectedDayEvents.find((e) => e.startTime?.startsWith(hour.toString().padStart(2, '0')));

                return (
                  <div key={hour} className="flex items-start gap-3 py-1.5 border-b border-neutral-900 text-xs">
                    <span className="w-12 text-neutral-500 font-mono text-[11px] shrink-0">{hourFormatted}</span>
                    <div className="flex-1 min-h-[28px] rounded-xl bg-neutral-900/40 p-1.5 flex items-center">
                      {matchingEvt ? (
                        <div className="w-full p-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-xs flex items-center justify-between">
                          <span className="font-bold text-rose-300">{matchingEvt.title}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">{matchingEvt.location}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-700 text-[10px]">--</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* VIEW 3: AGENDA / ALL EVENTS VIEW                                   */}
        {/* ================================================================== */}
        {viewMode === 'agenda' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white">لیست تمامی رویدادها و مناسبت‌ها</span>
              <span className="text-[10px] text-neutral-400">{events.length} آیتم</span>
            </div>

            <div className="space-y-2.5">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-start justify-between gap-2 shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 ${evt.color}`} />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">{evt.title}</h4>
                      <p className="text-[11px] text-neutral-400 font-mono flex items-center gap-2">
                        <span>📅 {evt.date}</span>
                        <span>⏰ {evt.startTime} - {evt.endTime}</span>
                      </p>
                      {evt.location && (
                        <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span>{evt.location}</span>
                        </p>
                      )}
                      {evt.notes && (
                        <p className="text-[10px] text-neutral-500">{evt.notes}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteEvent(evt.id)}
                    className="p-1.5 rounded-xl bg-neutral-800 hover:bg-rose-900/40 text-neutral-400 hover:text-rose-400"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-rose-500" />
                <span>افزودن رویداد جدید به تقویم</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                انصراف
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">عنوان رویداد:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثلاً: جلسه کاری، تولد، سفر..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">تاریخ (YYYY-MM-DD):</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">ساعت شروع:</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">ساعت پایان:</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">مکان:</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="مکان یا آدرس..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">رنگ برچسب:</label>
                <div className="flex items-center gap-2">
                  {['bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={`w-6 h-6 rounded-full ${color} transition-transform ${newColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-70'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleAddEvent}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all mt-2"
            >
              ذخیره در تقویم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
