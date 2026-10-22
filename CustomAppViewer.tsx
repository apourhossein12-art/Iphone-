import React, { useState } from 'react';
import { CustomApp, ProductItem } from '../../types/phone';
import {
  ExternalLink,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  Send,
  Calculator,
  Kanban,
  Check,
  DollarSign,
  TrendingUp,
  Package,
} from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface CustomAppViewerProps {
  app: CustomApp;
  products: ProductItem[];
  onBack: () => void;
  soundEnabled: boolean;
}

export const CustomAppViewer: React.FC<CustomAppViewerProps> = ({
  app,
  products,
  onBack,
  soundEnabled,
}) => {
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Currency Converter state for crypto_rates
  const [usdAmount, setUsdAmount] = useState<number>(100);

  // Kanban tasks state
  const [tasks, setTasks] = useState([
    { id: 1, title: 'هماهنگی تأمین قطعات تیتانیوم', status: 'done' },
    { id: 2, title: 'به‌روزرسانی قیمت‌های کاتالوگ فروشگاه', status: 'in_progress' },
    { id: 3, title: 'بررسی فاکتورهای جدید مشتریان', status: 'todo' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    soundEffects.click(soundEnabled);
    setTasks([...tasks, { id: Date.now(), title: newTaskTitle, status: 'todo' }]);
    setNewTaskTitle('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.notification(soundEnabled);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormName('');
      setFormPhone('');
      setFormDetails('');
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white select-none">
      {/* Top Navigation Bar */}
      <div className="pt-13 px-4 pb-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            onBack();
          }}
          className="flex items-center gap-1 text-xs text-blue-400 font-semibold"
        >
          <ArrowRight className="w-4 h-4" />
          <span>برگشت</span>
        </button>

        <span className="text-xs font-bold text-white truncate max-w-[200px]">
          {app.nameFa || app.name}
        </span>

        <span className="text-[10px] text-neutral-400 px-2 py-0.5 rounded bg-neutral-800 font-mono">
          ALI Tool
        </span>
      </div>

      {/* App Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Type 1: Embed URL */}
        {app.type === 'embed_url' && (
          <div className="h-full flex flex-col">
            <div className="mb-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <span className="font-mono truncate max-w-[240px]" dir="ltr">
                {app.url}
              </span>
              <a
                href={app.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 flex items-center gap-1 hover:underline"
              >
                <span>باز کردن</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <iframe
              src={app.url}
              title={app.name}
              className="flex-1 w-full rounded-2xl border border-neutral-800 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        )}

        {/* Type 2: Currency & Rates Tool */}
        {app.id === 'crypto_rates' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/60 to-cyan-900/60 border border-blue-500/30">
              <span className="text-[10px] text-cyan-300 font-semibold uppercase">صرافی هوشمند علی فون</span>
              <h2 className="text-base font-bold text-white mt-1">نرخ لحظه‌ای ارز، طلا و رمزارزها</h2>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <label className="block text-xs text-neutral-400">مبلغ به دلار آمریکا ($)</label>
              <div className="relative">
                <input
                  type="number"
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(Number(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">$ USD</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-between text-xs">
                <span className="text-neutral-300">معادل تومان (نرخ تقریبی ۷۰,۰۰۰):</span>
                <span className="text-sm font-bold font-mono text-amber-400">
                  {(usdAmount * 70000).toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>

            {/* Market Prices Table */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 divide-y divide-neutral-800/80 overflow-hidden text-xs">
              <div className="p-3 flex justify-between items-center">
                <span className="font-semibold text-white">دلار آمریکا (اسکناس)</span>
                <span className="font-mono text-emerald-400">۶۹,۸۵۰ تومان (+۰.۴٪)</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="font-semibold text-white">یورو اتحادیه اروپا</span>
                <span className="font-mono text-emerald-400">۷۵,۲۰۰ تومان (+۰.۲٪)</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="font-semibold text-white">طلای ۱۸ عیار (هر گرم)</span>
                <span className="font-mono text-amber-400">۴,۴۸۰,۰۰۰ تومان</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="font-semibold text-white">بیت‌کوین (BTC)</span>
                <span className="font-mono text-cyan-400">$68,450 USD</span>
              </div>
            </div>
          </div>
        )}

        {/* Type 3: Kanban & Task Tool */}
        {app.id === 'kanban_board' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Kanban className="w-4 h-4 text-purple-400" />
                <span>مدیریت وظایف و پروژه‌های کاری</span>
              </h3>

              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="عنوان تسک جدید..."
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
                >
                  افزودن
                </button>
              </form>
            </div>

            <div className="space-y-2">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    setTasks(
                      tasks.map((item) =>
                        item.id === t.id
                          ? { ...item, status: item.status === 'done' ? 'todo' : 'done' }
                          : item
                      )
                    );
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    t.status === 'done'
                      ? 'bg-neutral-900/40 border-neutral-800/60 opacity-60'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <span className={`text-xs ${t.status === 'done' ? 'line-through text-neutral-400' : 'text-white'}`}>
                    {t.title}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      t.status === 'done'
                        ? 'bg-emerald-500 border-emerald-500 text-black'
                        : 'border-neutral-600'
                    }`}
                  >
                    {t.status === 'done' && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Type 4: Custom Form or Invoice */}
        {(app.type === 'custom_form' || app.id === 'invoice_gen') && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/60 to-teal-900/60 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-300 font-semibold uppercase">ثبت فرم و فاکتور رسمی</span>
              <h2 className="text-base font-bold text-white mt-1">{app.nameFa}</h2>
            </div>

            {formSubmitted ? (
              <div className="p-6 rounded-2xl bg-neutral-900 border border-emerald-500/40 text-center space-y-2">
                <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">فاکتور با موفقیت در سیستم ثبت شد!</h3>
                <p className="text-xs text-neutral-400">اطلاعات در حافظه امن علی‌فون ذخیره گردید.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">نام طرف حساب / خریدار</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="نام کامل یا شرکت خریدار..."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">شماره همراه خریدار</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0912xxxxxxx"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">شرح خدمات یا اقلام محصول</label>
                  <textarea
                    rows={3}
                    required
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                    placeholder="اقلام، مشخصات گارانتی، نحوه تسویه..."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>صدور فاکتور رسمی</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Fallback general tool info */}
        {app.type !== 'embed_url' && app.id !== 'crypto_rates' && app.id !== 'kanban_board' && app.type !== 'custom_form' && app.id !== 'invoice_gen' && (
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-3">
            <Package className="w-12 h-12 text-blue-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">{app.nameFa}</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              این ابزار شخصی بر روی پردازشگر امن A18 Pro علی‌فون با موفقیت بارگذاری شده و به تمام داده‌های دستگاه دسترسی دارد.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
