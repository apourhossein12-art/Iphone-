import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Image, ArrowRight, CheckCheck } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface MessagesAppProps {
  onExecuteAction: (actionStr: string) => void;
  soundEnabled: boolean;
  phoneContext: any;
}

export const MessagesApp: React.FC<MessagesAppProps> = ({
  onExecuteAction,
  soundEnabled,
  phoneContext,
}) => {
  const [activeChat, setActiveChat] = useState<'ali' | 'manager' | 'customer'>('ali');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [aliMessages, setAliMessages] = useState<{ sender: 'user' | 'ali'; text: string; time: string }[]>([
    {
      sender: 'ali',
      text: 'درود! من هوش مصنوعی ALI Intelligence هستم. تمام تنظیمات، ابزارها و کاتالوگ محصولات علی‌فون در دسترس من است. چه کمکی از دستم برمی‌آید؟',
      time: '۱۰:۰۰',
    },
  ]);

  const [managerMessages, setManagerMessages] = useState([
    { sender: 'user', text: 'سلام مهندس، کاتالوگ آیفون ۱۶ و مک‌بوک‌ها رو بررسی کردی؟', time: '۰۹:۱۵' },
    { sender: 'ali', text: 'سلام، بله تمامی قیمت‌ها و مشخصات فنی در برنامه "مدیریت محصولات" با دقت به‌روزرسانی شد.', time: '۰۹:۱۸' },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aliMessages, managerMessages, activeChat]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    soundEffects.click(soundEnabled);

    const currentTimeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: inputText, time: currentTimeStr };

    if (activeChat === 'ali') {
      const updatedList = [...aliMessages, userMsg];
      setAliMessages(updatedList);
      setInputText('');
      setIsLoading(true);

      try {
        const res = await fetch('/api/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMsg.text,
            history: updatedList.map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', text: m.text })),
            systemContext: phoneContext,
          }),
        });
        const data = await res.json();
        if (data.reply) {
          setAliMessages((prev) => [
            ...prev,
            { sender: 'ali', text: data.reply, time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) },
          ]);
          soundEffects.notification(soundEnabled);
        }
        if (data.action) {
          onExecuteAction(data.action);
        }
      } catch (err) {
        setAliMessages((prev) => [
          ...prev,
          { sender: 'ali', text: 'خطا در ارتباط با سرور هوش مصنوعی.', time: currentTimeStr },
        ]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setManagerMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setTimeout(() => {
        soundEffects.notification(soundEnabled);
        setManagerMessages((prev) => [
          ...prev,
          { sender: 'ali', text: 'پیام دریافت شد، در اولین فرصت پیگیری می‌کنم.', time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) },
        ]);
      }, 1200);
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white select-none">
      {/* Top Header */}
      <div className="pt-14 px-5 pb-2 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">iMessage & AI</span>
          <h1 className="text-xl font-bold tracking-tight text-white">پیام‌ها</h1>
        </div>
      </div>

      {/* Conversations tabs */}
      <div className="flex items-center gap-1.5 p-2 bg-neutral-900 border-b border-neutral-800 text-xs">
        <button
          onClick={() => setActiveChat('ali')}
          className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 font-medium transition-colors ${
            activeChat === 'ali'
              ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300 font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>ALI Intelligence</span>
        </button>

        <button
          onClick={() => setActiveChat('manager')}
          className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 font-medium transition-colors ${
            activeChat === 'manager'
              ? 'bg-neutral-800 text-white border border-neutral-700 font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>مهندس علی</span>
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {(activeChat === 'ali' ? aliMessages : managerMessages).map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-neutral-800 text-neutral-200 border border-neutral-700/60 rounded-bl-xs'
              }`}
            >
              {msg.text}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[9px] text-neutral-500 px-1">
              <span>{msg.time}</span>
              {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-blue-400" />}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 p-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>ALI Intelligence در حال پاسخگویی...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="پیام خود را بنویسید..."
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
          className="w-9 h-9 rounded-full bg-blue-600 disabled:opacity-40 text-white flex items-center justify-center shadow-md active:scale-95"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
