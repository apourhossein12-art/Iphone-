import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, MicOff, Send, X, CornerDownLeft } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface SiriOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction: (actionStr: string) => void;
  soundEnabled: boolean;
  phoneContext: any;
}

export const SiriOverlay: React.FC<SiriOverlayProps> = ({
  isOpen,
  onClose,
  onExecuteAction,
  soundEnabled,
  phoneContext,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'سلام! من هوش مصنوعی ALI Intelligence هستم. چطور می‌تونم در مدیریت محصولات یا استفاده از علی‌فون کمکت کنم؟',
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      soundEffects.siriChime(soundEnabled);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSend = async (textToSend?: string) => {
    const message = textToSend || inputText;
    if (!message.trim() || isLoading) return;

    soundEffects.click(soundEnabled);
    const newConv = [...conversation, { role: 'user' as const, text: message }];
    setConversation(newConv);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          history: newConv.map((c) => ({ role: c.role, text: c.text })),
          systemContext: phoneContext,
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setConversation((prev) => [...prev, { role: 'assistant', text: data.reply }]);
        soundEffects.notification(soundEnabled);
      }
      if (data.action) {
        onExecuteAction(data.action);
      }
    } catch (err: any) {
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', text: 'پوزش می‌طلبم، ارتباط با پردازشگر با مشکل مواجه شد. لطفا دوباره تلاش کنید.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoice = () => {
    soundEffects.click(soundEnabled);
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', text: 'مرورگر شما از ورودی مستقیم صوتی وب پشتیبانی نمی‌کند، لطفاً درخواست خود را تایپ کنید.' },
      ]);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'fa-IR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 pointer-events-auto flex flex-col justify-end">
          {/* iOS 18 Siri Glowing Perimeter Border Wave */}
          <div className="absolute inset-0 border-[6px] border-transparent rounded-[52px] pointer-events-none animate-pulse overflow-hidden shadow-[inset_0_0_50px_rgba(236,72,153,0.3)]">
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background: 'linear-gradient(45deg, rgba(59,130,246,0.5), rgba(168,85,247,0.5), rgba(236,72,153,0.5), rgba(245,158,11,0.5))',
                mask: 'radial-gradient(ellipse at center, transparent 72%, black 73%)',
                WebkitMask: 'radial-gradient(ellipse at center, transparent 72%, black 73%)',
              }}
            />
          </div>

          {/* Dimmed Background */}
          <div className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={onClose} />

          {/* Siri Card Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 bg-neutral-900/90 border-t border-neutral-700/60 rounded-t-[36px] p-5 pb-8 max-h-[80%] flex flex-col shadow-2xl backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">ALI Intelligence</h3>
                  <p className="text-[10px] text-neutral-400">هوش مصنوعی یکپارچه آیفون ۱۶ پرو مکس</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Log */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 space-y-3 min-h-[160px] max-h-[280px]">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-neutral-800 text-neutral-200 border border-neutral-700/50 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-800 border border-neutral-700/50 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                    <span className="text-xs text-neutral-400">در حال اندیشیدن...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Suggestions */}
            <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar text-[11px]">
              <button
                onClick={() => handleSend('محصولات من رو باز کن')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/40"
              >
                📦 باز کردن محصولات
              </button>
              <button
                onClick={() => handleSend('چراغ‌قوه رو روشن کن')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/40"
              >
                🔦 چراغ‌قوه
              </button>
              <button
                onClick={() => handleSend('دوربین رو باز کن')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/40"
              >
                📸 باز کردن دوربین
              </button>
              <button
                onClick={() => handleSend('مشخصات آیفون ۱۶ پرو مکس چیه؟')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/40"
              >
                ⚡ مشخصات گوشی
              </button>
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleToggleVoice}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
                title="صحبت با میکروفون"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="از علی هوش مصنوعی بپرسید..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-full px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 disabled:opacity-40 text-white flex items-center justify-center shadow-lg active:scale-95"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
