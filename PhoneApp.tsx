import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  User,
  Clock,
  Star,
  Delete,
  Mic,
  Volume2,
  Plus,
} from 'lucide-react';
import { ContactItem, DynamicIslandState } from '../../types/phone';
import { soundEffects } from '../../utils/soundEffects';

interface PhoneAppProps {
  contacts: ContactItem[];
  onStartCall: (name: string, number: string) => void;
  onEndCall: () => void;
  activeCall: { name: string; number: string; duration: number } | null;
  soundEnabled: boolean;
}

export const PhoneApp: React.FC<PhoneAppProps> = ({
  contacts,
  onStartCall,
  onEndCall,
  activeCall,
  soundEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'keypad' | 'contacts' | 'recents'>('keypad');
  const [dialedNumber, setDialedNumber] = useState('');
  const [callHistory, setCallHistory] = useState([
    { name: 'مهندس علی', number: '09120000000', time: '۱۰:۲۴', type: 'incoming' },
    { name: 'انبار مرکزی', number: '09121112233', time: 'دیروز', type: 'outgoing' },
    { name: 'پشتیبانی تیتانیوم', number: '02188888888', time: 'دوشنبه', type: 'missed' },
  ]);

  const KEYPAD_BUTTONS = [
    { digit: '1', sub: '' },
    { digit: '2', sub: 'ABC' },
    { digit: '3', sub: 'DEF' },
    { digit: '4', sub: 'GHI' },
    { digit: '5', sub: 'JKL' },
    { digit: '6', sub: 'MNO' },
    { digit: '7', sub: 'PQRS' },
    { digit: '8', sub: 'TUV' },
    { digit: '9', sub: 'WXYZ' },
    { digit: '*', sub: '' },
    { digit: '0', sub: '+' },
    { digit: '#', sub: '' },
  ];

  const handleDigitPress = (digit: string) => {
    soundEffects.keypadTone(digit, soundEnabled);
    soundEffects.haptic(10);
    setDialedNumber((prev) => prev + digit);
  };

  const handleDeleteDigit = () => {
    soundEffects.click(soundEnabled);
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = (nameOrNum?: string) => {
    const target = nameOrNum || dialedNumber;
    if (!target) return;
    soundEffects.click(soundEnabled);
    onStartCall(target, target);
  };

  if (activeCall) {
    const mins = Math.floor(activeCall.duration / 60).toString().padStart(2, '0');
    const secs = (activeCall.duration % 60).toString().padStart(2, '0');

    return (
      <div className="h-full flex flex-col justify-between p-8 pt-20 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white select-none">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center text-3xl font-bold shadow-2xl">
            {activeCall.name[0]}
          </div>
          <h2 className="text-xl font-bold">{activeCall.name}</h2>
          <p className="text-xs text-neutral-400 font-mono">{activeCall.number}</p>
          <p className="text-emerald-400 text-sm font-mono tracking-widest">{mins}:{secs}</p>
        </div>

        {/* Audio controls */}
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto w-full">
          <button className="aspect-square rounded-2xl bg-white/10 hover:bg-white/20 flex flex-col items-center justify-center gap-1">
            <Mic className="w-5 h-5 text-white" />
            <span className="text-[10px] text-neutral-300">بی‌صدا</span>
          </button>
          <button className="aspect-square rounded-2xl bg-white/10 hover:bg-white/20 flex flex-col items-center justify-center gap-1">
            <Volume2 className="w-5 h-5 text-white" />
            <span className="text-[10px] text-neutral-300">اسپیکر HD</span>
          </button>
          <button className="aspect-square rounded-2xl bg-white/10 hover:bg-white/20 flex flex-col items-center justify-center gap-1">
            <Plus className="w-5 h-5 text-white" />
            <span className="text-[10px] text-neutral-300">افزودن</span>
          </button>
        </div>

        {/* End Call Button */}
        <div className="flex justify-center pb-8">
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              onEndCall();
            }}
            className="w-18 h-18 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center shadow-xl shadow-rose-600/30 active:scale-95 transition-transform"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white select-none">
      {/* Top Header */}
      <div className="pt-14 px-5 pb-2 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Cellular 5G</span>
          <h1 className="text-xl font-bold tracking-tight text-white">تلفن</h1>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'keypad' && (
          <div className="flex-1 flex flex-col justify-between p-4 pb-2">
            {/* Number Display */}
            <div className="h-16 flex items-center justify-center px-4 relative">
              <span className="text-3xl font-mono font-semibold tracking-wider text-white truncate text-center">
                {dialedNumber || ' '}
              </span>
              {dialedNumber && (
                <button
                  onClick={handleDeleteDigit}
                  className="absolute left-6 text-neutral-400 hover:text-white p-2"
                >
                  <Delete className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-3.5 max-w-[280px] mx-auto w-full">
              {KEYPAD_BUTTONS.map((item) => (
                <button
                  key={item.digit}
                  onClick={() => handleDigitPress(item.digit)}
                  className="w-18 h-18 rounded-full bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 transition-colors flex flex-col items-center justify-center shadow-md active:scale-95"
                >
                  <span className="text-2xl font-semibold leading-none">{item.digit}</span>
                  {item.sub && <span className="text-[9px] text-neutral-400 font-bold tracking-wider mt-0.5">{item.sub}</span>}
                </button>
              ))}
            </div>

            {/* Call button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => handleCall()}
                disabled={!dialedNumber}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
              >
                <Phone className="w-7 h-7" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-xs font-semibold text-neutral-400 px-1 uppercase tracking-wider">مخاطبین من</h3>
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${contact.avatarColor} text-white font-bold flex items-center justify-center text-sm`}>
                    {contact.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{contact.name}</p>
                    <p className="text-[11px] text-neutral-400 font-mono">{contact.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCall(contact.name)}
                  className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black flex items-center justify-center transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recents' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-xs font-semibold text-neutral-400 px-1 uppercase tracking-wider">تماس‌های اخیر</h3>
            {callHistory.map((call, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between"
              >
                <div>
                  <p className={`text-xs font-semibold ${call.type === 'missed' ? 'text-rose-400' : 'text-white'}`}>
                    {call.name}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono">{call.number}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-neutral-500">{call.time}</span>
                  <button
                    onClick={() => handleCall(call.name)}
                    className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-emerald-500 hover:text-black flex items-center justify-center text-neutral-400 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>
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
            setActiveTab('recents');
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'recents' ? 'text-blue-400 font-bold' : 'text-neutral-400'}`}
        >
          <Clock className="w-5 h-5" />
          <span>اخیر</span>
        </button>
        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            setActiveTab('contacts');
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'contacts' ? 'text-blue-400 font-bold' : 'text-neutral-400'}`}
        >
          <User className="w-5 h-5" />
          <span>مخاطبین</span>
        </button>
        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            setActiveTab('keypad');
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'keypad' ? 'text-blue-400 font-bold' : 'text-neutral-400'}`}
        >
          <Phone className="w-5 h-5" />
          <span>صفحه‌کلید</span>
        </button>
      </div>
    </div>
  );
};
