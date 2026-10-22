import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Timer, Hourglass, Plus } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface ClockAppProps {
  onStartTimer: (seconds: number) => void;
  soundEnabled: boolean;
}

export const ClockApp: React.FC<ClockAppProps> = ({ onStartTimer, soundEnabled }) => {
  const [activeTab, setActiveTab] = useState<'world' | 'stopwatch' | 'timer'>('stopwatch');

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime((prev) => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000).toString().padStart(2, '0');
    const secs = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const centis = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${mins}:${secs}.${centis}`;
  };

  const handleLap = () => {
    soundEffects.click(soundEnabled);
    setLaps((prev) => [stopwatchTime, ...prev]);
  };

  const handleResetStopwatch = () => {
    soundEffects.click(soundEnabled);
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  };

  const handleStartCountdown = () => {
    soundEffects.click(soundEnabled);
    const total = timerMinutes * 60 + timerSeconds;
    if (total > 0) {
      onStartTimer(total);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between bg-neutral-950 text-white select-none">
      {/* Top Header */}
      <div className="pt-14 px-5 pb-2 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">Apple Clock</span>
          <h1 className="text-xl font-bold tracking-tight text-white">ساعت و تایمر</h1>
        </div>
      </div>

      {/* Main Tab View */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        {activeTab === 'stopwatch' && (
          <div className="flex-1 flex flex-col justify-between">
            {/* Huge Digital Stopwatch */}
            <div className="my-auto text-center py-6">
              <span className="text-6xl font-light font-mono text-white tracking-tight">
                {formatStopwatch(stopwatchTime)}
              </span>
            </div>

            {/* Stopwatch Control Buttons */}
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={handleLap}
                disabled={!isStopwatchRunning && stopwatchTime === 0}
                className="w-18 h-18 rounded-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-white text-xs font-semibold flex items-center justify-center shadow-lg active:scale-95"
              >
                ثبت دور
              </button>

              <button
                onClick={handleResetStopwatch}
                disabled={stopwatchTime === 0}
                className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  setIsStopwatchRunning(!isStopwatchRunning);
                }}
                className={`w-18 h-18 rounded-full text-xs font-bold flex items-center justify-center shadow-lg active:scale-95 ${
                  isStopwatchRunning ? 'bg-rose-600 text-white' : 'bg-emerald-500 text-black'
                }`}
              >
                {isStopwatchRunning ? 'توقف' : 'شروع'}
              </button>
            </div>

            {/* Laps List */}
            {laps.length > 0 && (
              <div className="max-h-36 overflow-y-auto border-t border-neutral-800 p-2 space-y-1 text-xs">
                {laps.map((lap, idx) => (
                  <div key={idx} className="flex justify-between items-center text-neutral-400 font-mono py-1">
                    <span>دور {laps.length - idx}</span>
                    <span className="text-white font-semibold">{formatStopwatch(lap)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="flex-1 flex flex-col justify-between py-6">
            <div className="text-center my-auto space-y-4">
              <div className="text-5xl font-mono font-light text-amber-400">
                {timerMinutes.toString().padStart(2, '0')}:{timerSeconds.toString().padStart(2, '0')}
              </div>
              <p className="text-xs text-neutral-400">تایمر به صورت زنده در Dynamic Island نمایش داده می‌شود</p>

              {/* Minute picker buttons */}
              <div className="flex justify-center gap-2 pt-2">
                {[1, 3, 5, 10, 15, 30].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      soundEffects.click(soundEnabled);
                      setTimerMinutes(m);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
                      timerMinutes === m ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center pb-4">
              <button
                onClick={handleStartCountdown}
                className="w-20 h-20 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-bold flex items-center justify-center text-sm shadow-xl shadow-amber-500/20 active:scale-95"
              >
                شروع تایمر
              </button>
            </div>
          </div>
        )}

        {activeTab === 'world' && (
          <div className="space-y-3">
            {[
              { city: 'تهران', diff: 'زمان محلی', time: '۱۴:۳۵' },
              { city: 'دبی', diff: '+۰.۵ ساعت', time: '۱۵:۰۵' },
              { city: 'لندن', diff: '-۳.۵ ساعت', time: '۱۱:۰۵' },
              { city: 'نیویورک', diff: '-۷.۵ ساعت', time: '۰۷:۰۵' },
            ].map((w, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{w.city}</h4>
                  <p className="text-[10px] text-neutral-400">{w.diff}</p>
                </div>
                <span className="text-2xl font-mono font-light text-white">{w.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Tabs */}
      <div className="flex items-center justify-around py-2.5 border-t border-neutral-800 bg-neutral-900/90 text-[10px]">
        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            setActiveTab('world');
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'world' ? 'text-amber-400 font-bold' : 'text-neutral-400'}`}
        >
          <Clock className="w-5 h-5" />
          <span>ساعت جهانی</span>
        </button>
        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            setActiveTab('stopwatch');
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'stopwatch' ? 'text-amber-400 font-bold' : 'text-neutral-400'}`}
        >
          <Timer className="w-5 h-5" />
          <span>کرنومتر</span>
        </button>
        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            setActiveTab('timer');
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'timer' ? 'text-amber-400 font-bold' : 'text-neutral-400'}`}
        >
          <Hourglass className="w-5 h-5" />
          <span>تایمر</span>
        </button>
      </div>
    </div>
  );
};
