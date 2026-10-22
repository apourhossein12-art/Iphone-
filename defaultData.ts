import { CustomApp, ProductItem, NoteItem, PhotoItem, ContactItem } from '../types/phone';

export const DEFAULT_WALLPAPERS = [
  {
    id: 'desert',
    name: 'Desert Titanium (پیش‌فرض)',
    nameEn: 'Desert Titanium',
    url: '/wallpapers/iphone16_titanium_desert_1792636480310.jpg',
    thumbClass: 'bg-amber-900',
  },
  {
    id: 'black',
    name: 'Black Titanium',
    nameEn: 'Black Titanium',
    url: '/wallpapers/iphone16_titanium_dark_1792636480816.jpg',
    thumbClass: 'bg-neutral-900',
  },
  {
    id: 'natural',
    name: 'Natural Titanium',
    nameEn: 'Natural Titanium',
    url: '/wallpapers/iphone16_titanium_natural_1792636481964.jpg',
    thumbClass: 'bg-stone-500',
  },
  {
    id: 'neon-mesh',
    name: 'Aurora iOS 18',
    nameEn: 'Aurora iOS 18',
    url: '',
    gradient: 'from-blue-900 via-indigo-950 to-purple-950',
    thumbClass: 'bg-indigo-900',
  },
  {
    id: 'sunset-mesh',
    name: 'Solar Flare',
    nameEn: 'Solar Flare',
    url: '',
    gradient: 'from-rose-950 via-orange-950 to-neutral-950',
    thumbClass: 'bg-rose-950',
  },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'گوشی آیفون ۱۶ پرو مکس (نسخه تیتانیوم ۱ ترابایت)',
    category: 'دیجیتال و موبایل',
    price: 118000000,
    currency: 'تومان',
    stock: 12,
    status: 'active',
    sku: 'IPH-16PM-1TB-DES',
    description: 'جدیدترین پرچمدار اپل با پردازنده A18 Pro، دکمه کمرا کنترل و بدنه تیتانیوم گرید ۵.',
    createdAt: '2026-10-15',
  },
  {
    id: 'prod-2',
    name: 'مک‌بوک پرو ۱۶ اینچ چیپ M4 Max',
    category: 'رایانه و لپ‌تاپ',
    price: 245000000,
    currency: 'تومان',
    stock: 5,
    status: 'active',
    sku: 'MBP-16-M4M-64G',
    description: 'ابر پردازشگر مناسب تدوین 8K، هوش مصنوعی و کدنویسی پیشرفته با رم ۶۴ گیگابایت.',
    createdAt: '2026-10-10',
  },
  {
    id: 'prod-3',
    name: 'اپل واچ اولترا ۲ با بند تیتانیوم میلانس',
    category: 'ساعت هوشمند',
    price: 49500000,
    currency: 'تومان',
    stock: 18,
    status: 'active',
    sku: 'AWU-2-TIT-MIL',
    description: 'نمایشگر ۳۰۰۰ نیت، عمق‌سنج ۴۰ متری، باتری ۷۲ ساعته در حالت ذخیره نیرو.',
    createdAt: '2026-10-08',
  },
  {
    id: 'prod-4',
    name: 'ایرپادز پرو نسل ۲ پورت USB-C',
    category: 'صوتی و هندزفری',
    price: 14200000,
    currency: 'تومان',
    stock: 35,
    status: 'active',
    sku: 'APP-2-USBC',
    description: 'حذف نویز فعال ۲ برابر قوی‌تر و پشتیبانی از صدای بدون افت Lossless.',
    createdAt: '2026-10-01',
  },
  {
    id: 'prod-5',
    name: 'پاوربانک مگ‌سیف انکر ۲۵ واتی چرم اصل',
    category: 'لوازم جانبی',
    price: 3800000,
    currency: 'تومان',
    stock: 50,
    status: 'active',
    sku: 'ANK-MAG-25W',
    description: 'شارژ وایرلس سریع Qi2 سازگار با تمامی مدل‌های سری آیفون ۱۵ و ۱۶.',
    createdAt: '2026-09-28',
  },
];

export const INITIAL_CUSTOM_APPS: CustomApp[] = [
  {
    id: 'products',
    name: 'مدیریت محصولات',
    nameFa: 'محصولات من',
    iconName: 'Package',
    color: 'from-amber-500 to-orange-600',
    category: 'products',
    type: 'product_catalog',
    isPreinstalled: true,
  },
  {
    id: 'invoice_gen',
    name: 'فاکتورساز هوشمند',
    nameFa: 'صدور فاکتور',
    iconName: 'Receipt',
    color: 'from-emerald-500 to-teal-700',
    category: 'finance',
    type: 'custom_form',
    isPreinstalled: true,
  },
  {
    id: 'crypto_rates',
    name: 'نرخ لحظه‌ای ارز و طلا',
    nameFa: 'صرافی و ارز',
    iconName: 'TrendingUp',
    color: 'from-blue-600 to-cyan-700',
    category: 'finance',
    type: 'calculator_tool',
    isPreinstalled: true,
  },
  {
    id: 'kanban_board',
    name: 'تسک‌های کاری و پروژه‌ها',
    nameFa: 'مدیریت وظایف',
    iconName: 'Kanban',
    color: 'from-violet-600 to-purple-800',
    category: 'tools',
    type: 'markdown_tool',
    isPreinstalled: true,
  },
];

export const MARKETPLACE_TOOLS: CustomApp[] = [
  {
    id: 'tool_analytics',
    name: 'آنالیز فروش و مشتریان',
    nameFa: 'داشبورد آنالیز',
    iconName: 'BarChart3',
    color: 'from-purple-600 to-indigo-700',
    category: 'tools',
    type: 'calculator_tool',
  },
  {
    id: 'tool_qrcode',
    name: 'بارکدساز و QR کد خوان',
    nameFa: 'استودیو QR',
    iconName: 'QrCode',
    color: 'from-pink-600 to-rose-700',
    category: 'utilities',
    type: 'custom_form',
  },
  {
    id: 'tool_notes_vault',
    name: 'اسناد محرمانه و انبار فرمول‌ها',
    nameFa: 'گاوصندوق اسناد',
    iconName: 'FileText',
    color: 'from-stone-700 to-zinc-900',
    category: 'tools',
    type: 'markdown_tool',
  },
  {
    id: 'tool_terminal',
    name: 'ترمینال توسعه‌دهنده ALI',
    nameFa: 'ترمینال کد',
    iconName: 'Terminal',
    color: 'from-emerald-600 to-green-900',
    category: 'tools',
    type: 'markdown_tool',
  },
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'برنامه راه‌اندازی محصولات علی فون',
    content: `۱. بارگذاری مشخصات تمامی کالاها و لیست قیمت‌ها در برنامه "محصولات من".
۲. نصب ابزار فاکتورساز برای ثبت سفارشات مشتریان حضوری و اینترنتی.
۳. هماهنگی موجودی انبار تیتانیوم ۱ ترابایت و اکسسوری‌ها.
۴. استفاده از هوش مصنوعی ALI Intelligence جهت مشاوره و تحلیل رقبا.`,
    updatedAt: '۱۴:۳۵ - امروز',
    folder: 'کاری',
    isPinned: true,
  },
  {
    id: 'note-2',
    title: 'ایده‌های توسعه ابزار اختصاصی',
    content: `می‌توان از طریق اپ‌استور علی‌فون هر آدرس وب یا فرم اختصاصی برای محصولات، کاتالوگ آنلاین، و سیستم CRM را مستقیم درون گوشی نصب کرد.`,
    updatedAt: 'دیروز',
    folder: 'ایده‌ها',
  },
];

export const INITIAL_CONTACTS: ContactItem[] = [
  {
    id: 'c-1',
    name: 'مهندس علی (مدیر سیستم)',
    phone: '09120000000',
    avatarColor: 'bg-amber-500',
    isFavorite: true,
  },
  {
    id: 'c-2',
    name: 'پشتیبانی فنی تیتانیوم',
    phone: '02188888888',
    avatarColor: 'bg-blue-600',
    isFavorite: true,
  },
  {
    id: 'c-3',
    name: 'انبار مرکزی تهران',
    phone: '09121112233',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'c-4',
    name: 'واحد فروش و سفارشات',
    phone: '09351234567',
    avatarColor: 'bg-purple-600',
  },
];

export const INITIAL_PHOTOS: PhotoItem[] = [
  {
    id: 'ph-1',
    url: '/wallpapers/iphone16_titanium_desert_1792636480310.jpg',
    title: 'iPhone 16 Pro Max Desert Titanium',
    date: 'امروز، ۱۲:۳۰',
    isFavorite: true,
  },
  {
    id: 'ph-2',
    url: '/wallpapers/iphone16_titanium_dark_1792636480816.jpg',
    title: 'Black Titanium Studio Render',
    date: 'امروز، ۱۰:۱۵',
    isFavorite: true,
  },
  {
    id: 'ph-3',
    url: '/wallpapers/iphone16_titanium_natural_1792636481964.jpg',
    title: 'Natural Titanium Macro Lens',
    date: 'دیروز',
  },
];
