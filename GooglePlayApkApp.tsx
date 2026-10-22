import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Download,
  Check,
  Package,
  HardDrive,
  FileCode,
  Upload,
  RotateCcw,
  ShieldCheck,
  Star,
  Play,
  Pause,
  Share2,
  Trash2,
  Layers,
  ArrowRight,
  Database,
  Smartphone,
  ExternalLink,
  Terminal,
  Cloud,
  Cpu,
  Server,
  Radio,
  Tv,
  RotateCw,
  Power,
  Volume2,
  VolumeX,
  Camera,
  Compass,
  ArrowLeft,
  Square,
  Circle,
  Triangle,
  Info,
  Copy,
  Sparkles,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import { ApkPackage, AppLanguage, CustomApp, ProductItem, NoteItem, TitaniumFinish } from '../../types/phone';
import { t, formatDigits } from '../../utils/i18n';
import { soundEffects } from '../../utils/soundEffects';

interface GooglePlayApkAppProps {
  initialTab?: 'store' | 'cloud' | 'adb' | 'installer' | 'backup';
  installedApps: CustomApp[];
  onInstallCustomApp: (app: CustomApp) => void;
  products: ProductItem[];
  onRestoreProducts: (prods: ProductItem[]) => void;
  notes: NoteItem[];
  onRestoreNotes: (notes: NoteItem[]) => void;
  language: AppLanguage;
  soundEnabled: boolean;
  titaniumFinish: TitaniumFinish;
  wallpaperUrl: string;
}

const PLAY_STORE_APPS: ApkPackage[] = [
  {
    id: 'apk_snapp',
    packageName: 'cab.snapp.passenger',
    appName: 'اسنپ (Snapp!)',
    versionName: 'v5.8.4',
    sizeMb: 24.2,
    icon: '🚕',
    category: 'سفر و حمل و نقل',
    rating: 4.7,
    downloads: '10M+',
    description: 'سوپراپلیکیشن جامع درخواست خودرو، موتور، وانت، سفارش غذا و خرید اقلام سوپرمارکت.',
    permissions: ['INTERNET', 'ACCESS_FINE_LOCATION', 'CAMERA', 'VIBRATE'],
  },
  {
    id: 'apk_digikala',
    packageName: 'com.digikala.mobile',
    appName: 'دیجی‌کالا (Digikala)',
    versionName: 'v3.1.2',
    sizeMb: 36.8,
    icon: '🛍️',
    category: 'خرید آنلاین و فروشگاه',
    rating: 4.6,
    downloads: '10M+',
    description: 'بزرگ‌ترین فروشگاه اینترنتی ایران با تنوع بیش از ۷ میلیون کالا و ارسال سریع کالا.',
    permissions: ['INTERNET', 'WAKE_LOCK', 'WRITE_EXTERNAL_STORAGE'],
  },
  {
    id: 'apk_torob',
    packageName: 'ir.torob',
    appName: 'ترب (Torob)',
    versionName: 'v4.2.0',
    sizeMb: 18.5,
    icon: '🥕',
    category: 'خرید و مقایسه قیمت',
    rating: 4.8,
    downloads: '5M+',
    description: 'موتور جستجوی هوشمند کالا و مقایسه قیمت میان صدها هزار فروشگاه معتبر.',
    permissions: ['INTERNET', 'ACCESS_NETWORK_STATE'],
  },
  {
    id: 'apk_divar',
    packageName: 'ir.divar',
    appName: 'دیوار (Divar)',
    versionName: 'v12.0.4',
    sizeMb: 22.0,
    icon: '🧱',
    category: 'نیازمندی‌ها و تجارت',
    rating: 4.5,
    downloads: '10M+',
    description: 'سامانه ثبت رایگان آگهی‌های خرید و فروش خودرو، مسکن، لوازم دیجیتال و استخدام.',
    permissions: ['INTERNET', 'CAMERA', 'ACCESS_COARSE_LOCATION'],
  },
  {
    id: 'apk_telegram',
    packageName: 'org.telegram.messenger',
    appName: 'Telegram Messenger',
    versionName: 'v10.14.0',
    sizeMb: 52.4,
    icon: '✈️',
    category: 'پیام‌رسان و ارتباطات',
    rating: 4.8,
    downloads: '1B+',
    description: 'پیام‌رسان پرسرعت، امن، رمزنگاری‌شده با کانال‌ها و قابلیت‌های پیشرفته هوش مصنوعی.',
    permissions: ['INTERNET', 'RECORD_AUDIO', 'CAMERA', 'READ_CONTACTS'],
  },
  {
    id: 'apk_whatsapp',
    packageName: 'com.whatsapp',
    appName: 'WhatsApp Messenger',
    versionName: 'v2.24.18',
    sizeMb: 46.1,
    icon: '💬',
    category: 'ارتباطات',
    rating: 4.4,
    downloads: '5B+',
    description: 'تماس صوتی و تصویری با کیفیت بالا، گروه‌های گفتگو و پیام‌رسانی امن.',
    permissions: ['INTERNET', 'CAMERA', 'RECORD_AUDIO', 'ACCESS_FINE_LOCATION'],
  },
  {
    id: 'apk_instagram',
    packageName: 'com.instagram.android',
    appName: 'Instagram',
    versionName: 'v340.0.0',
    sizeMb: 61.2,
    icon: '📷',
    category: 'شبکه اجتماعی',
    rating: 4.3,
    downloads: '5B+',
    description: 'اشتراک‌گذاری لحظات، تصاویر، ریلز و ارتباط با میلیون‌ها صفحه تجاری و محصولات.',
    permissions: ['INTERNET', 'CAMERA', 'RECORD_AUDIO', 'ACCESS_MEDIA_LOCATION'],
  },
  {
    id: 'apk_vscode',
    packageName: 'com.microsoft.vscode.mobile',
    appName: 'VS Code Mobile IDE',
    versionName: 'v1.94.0',
    sizeMb: 78.5,
    icon: '💻',
    category: 'ابزار توسعه‌دهندگان',
    rating: 4.9,
    downloads: '50M+',
    description: 'محیط کدنویسی سبک برای ویرایش کدهای JavaScript، Python، HTML و اجرای ترمینال.',
    permissions: ['INTERNET', 'MANAGE_EXTERNAL_STORAGE', 'FOREGROUND_SERVICE'],
  },
];

export const GooglePlayApkApp: React.FC<GooglePlayApkAppProps> = ({
  initialTab = 'store',
  installedApps,
  onInstallCustomApp,
  products,
  onRestoreProducts,
  notes,
  onRestoreNotes,
  language,
  soundEnabled,
  titaniumFinish,
  wallpaperUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'store' | 'cloud' | 'adb' | 'installer' | 'backup'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApk, setSelectedApk] = useState<ApkPackage | null>(null);

  // Installer state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    sizeMb: number;
    packageName: string;
    appName: string;
  } | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccessMessage, setInstallSuccessMessage] = useState('');

  // Backup state
  const [backupNotice, setBackupNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cloudFileInputRef = useRef<HTMLInputElement>(null);
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  // --------------------------------------------------------------------------
  // Cloud Streaming & Appetize.io / Genymotion state
  // --------------------------------------------------------------------------
  const [cloudStreamMode, setCloudStreamMode] = useState<'interactive' | 'appetize' | 'genymotion'>('interactive');
  const [cloudDevice, setCloudDevice] = useState<'pixel8' | 's24' | 'pixel7' | 'nexus5x'>('pixel8');
  const [cloudAndroidVer, setCloudAndroidVer] = useState<'14.0' | '13.0' | '12.0' | '11.0'>('14.0');
  const [cloudPowerOn, setCloudPowerOn] = useState(true);
  const [cloudOrientation, setCloudOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [cloudVolume, setCloudVolume] = useState(80);
  const [cloudMuted, setCloudMuted] = useState(false);
  const [cloudActiveScreen, setCloudActiveScreen] = useState<'launcher' | 'snapp' | 'digikala' | 'telegram' | 'chrome' | 'settings'>('launcher');
  const [cloudRunningApp, setCloudRunningApp] = useState<string | null>(null);
  const [cloudConnecting, setCloudConnecting] = useState(false);
  const [cloudUploadProgress, setCloudUploadProgress] = useState<number | null>(null);
  const [appetizeKey, setAppetizeKey] = useState<string>('demo');
  const [appetizeCustomInput, setAppetizeCustomInput] = useState<string>('');

  // --------------------------------------------------------------------------
  // ADB Console state
  // --------------------------------------------------------------------------
  const [adbInput, setAdbInput] = useState('');
  const [adbLogs, setAdbLogs] = useState<Array<{ id: string; type: 'cmd' | 'out' | 'err' | 'info'; text: string }>>([
    { id: '1', type: 'info', text: 'Android Debug Bridge (ADB) Client v1.0.41 - Revision 35.0.1' },
    { id: '2', type: 'info', text: 'Connected to Cloud Emulator: emulator-5554 (Google Pixel 8 Pro - Android 14.0)' },
    { id: '3', type: 'cmd', text: 'adb devices' },
    { id: '4', type: 'out', text: 'List of devices attached\nemulator-5554\tdevice product:husky model:Pixel_8_Pro device:husky transport_id:1' },
  ]);
  const [isLogcatStreaming, setIsLogcatStreaming] = useState(false);
  const adbScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adbScrollRef.current) {
      adbScrollRef.current.scrollTop = adbScrollRef.current.scrollHeight;
    }
  }, [adbLogs]);

  // Logcat stream simulator
  useEffect(() => {
    if (!isLogcatStreaming) return;
    const interval = setInterval(() => {
      const tags = ['ActivityTaskManager', 'PackageManager', 'AppetizeStream', 'SurfaceFlinger', 'InputDispatcher', 'AudioFlinger'];
      const tag = tags[Math.floor(Math.random() * tags.length)];
      const pid = 1000 + Math.floor(Math.random() * 8000);
      const time = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);
      const msg = `[${time}] ${pid} D ${tag}: display_event_ack frame_drawn token=${Math.random().toString(16).slice(2, 8)}`;
      setAdbLogs((prev) => [...prev.slice(-80), { id: Date.now().toString() + Math.random(), type: 'info', text: msg }]);
    }, 1200);
    return () => clearInterval(interval);
  }, [isLogcatStreaming]);

  const filteredApps = PLAY_STORE_APPS.filter(
    (app) =>
      app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.includes(searchQuery)
  );

  // Install APK package onto ALI phone
  const handleInstallApk = (apk: ApkPackage) => {
    soundEffects.click(soundEnabled);
    setIsInstalling(true);

    setTimeout(() => {
      const customApp: CustomApp = {
        id: `apk_${apk.packageName.replace(/\./g, '_')}`,
        name: apk.appName,
        nameFa: apk.appName,
        iconName: 'Package',
        color: 'from-emerald-600 to-teal-800',
        category: 'tools',
        type: 'calculator_tool',
        data: { apk },
      };
      onInstallCustomApp(customApp);
      setIsInstalling(false);
      soundEffects.notification(soundEnabled);
      setInstallSuccessMessage(`بسته ${apk.appName} با فرمت APK با موفقیت روی علی‌فون نصب شد!`);
      setTimeout(() => setInstallSuccessMessage(''), 3500);
    }, 800);
  };

  // Download official APK file
  const handleDownloadApkFile = (apk: ApkPackage) => {
    soundEffects.click(soundEnabled);
    const simulatedApkManifest = {
      header: 'ANDROID_PACKAGE_ARCHIVE_APK',
      packageName: apk.packageName,
      versionName: apk.versionName,
      architecture: 'arm64-v8a',
      targetSdk: 35,
      builtForDevice: 'ALI phone iPhone 16 Pro Max Simulation',
      permissions: apk.permissions,
      createdAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(simulatedApkManifest, null, 2)], {
      type: 'application/vnd.android.package-archive',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${apk.packageName}_${apk.versionName}.apk`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setInstallSuccessMessage(`فایل ${apk.packageName}.apk شروع به دانلود شد.`);
    setTimeout(() => setInstallSuccessMessage(''), 3000);
  };

  // Handle uploaded APK file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.click(soundEnabled);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const pkgName = `com.aliphone.${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    setUploadedFile({
      name: file.name,
      sizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
      packageName: pkgName,
      appName: cleanName,
    });
  };

  // Handle direct cloud stream upload
  const handleCloudApkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundEffects.click(soundEnabled);

    setCloudConnecting(true);
    setCloudUploadProgress(15);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');

    const timer = setInterval(() => {
      setCloudUploadProgress((p) => {
        if (!p || p >= 90) {
          clearInterval(timer);
          return 90;
        }
        return p + 25;
      });
    }, 400);

    setTimeout(() => {
      clearInterval(timer);
      setCloudUploadProgress(100);
      setCloudConnecting(false);
      setCloudRunningApp(cleanName);
      setCloudActiveScreen('launcher');
      soundEffects.notification(soundEnabled);
      setInstallSuccessMessage(`فایل ${file.name} روی سرور ابری آپلود و مستقر شد!`);

      // Add to adb log
      setAdbLogs((prev) => [
        ...prev,
        { id: Date.now().toString(), type: 'cmd', text: `adb install -r -d /sdcard/Download/${file.name}` },
        { id: (Date.now() + 1).toString(), type: 'out', text: `Performing Streamed Install\nSuccess\nInstalled ${cleanName} on Appetize/Genymotion cloud host.` },
      ]);

      setTimeout(() => {
        setCloudUploadProgress(null);
        setInstallSuccessMessage('');
      }, 3500);
    }, 1800);
  };

  // Install the user's custom uploaded APK
  const handleInstallUploadedApk = () => {
    if (!uploadedFile) return;
    soundEffects.click(soundEnabled);
    setIsInstalling(true);

    setTimeout(() => {
      const customApp: CustomApp = {
        id: `custom_apk_${Date.now()}`,
        name: uploadedFile.appName,
        nameFa: uploadedFile.appName,
        iconName: 'Package',
        color: 'from-blue-600 to-indigo-800',
        category: 'tools',
        type: 'calculator_tool',
        data: { uploadedFile },
      };
      onInstallCustomApp(customApp);
      setIsInstalling(false);
      soundEffects.notification(soundEnabled);
      setInstallSuccessMessage(`برنامه اختصاصی ${uploadedFile.name} با موفقیت نصب گردید!`);
      setUploadedFile(null);
      setTimeout(() => setInstallSuccessMessage(''), 3500);
    }, 1000);
  };

  // Deploy an APK to Cloud Streamer
  const handleDeployApkToCloud = (apk: ApkPackage) => {
    soundEffects.click(soundEnabled);
    setCloudConnecting(true);
    setActiveTab('cloud');
    setTimeout(() => {
      setCloudConnecting(false);
      setCloudRunningApp(apk.appName);
      if (apk.packageName.includes('snapp')) setCloudActiveScreen('snapp');
      else if (apk.packageName.includes('digikala')) setCloudActiveScreen('digikala');
      else if (apk.packageName.includes('telegram')) setCloudActiveScreen('telegram');
      else setCloudActiveScreen('launcher');

      soundEffects.notification(soundEnabled);
      setInstallSuccessMessage(`برنامه ${apk.appName} در استریم ابری آماده اجرا شد!`);
      setTimeout(() => setInstallSuccessMessage(''), 3500);
    }, 1000);
  };

  // Execute an ADB command
  const handleRunAdbCommand = (cmdToRun?: string) => {
    const rawCmd = (cmdToRun || adbInput).trim();
    if (!rawCmd) return;
    soundEffects.click(soundEnabled);

    const newLogs = [...adbLogs, { id: Date.now().toString(), type: 'cmd' as const, text: rawCmd }];
    const cmd = rawCmd.toLowerCase();

    if (cmd === 'clear' || cmd === 'cls') {
      setAdbLogs([]);
      setAdbInput('');
      return;
    }

    if (cmd.startsWith('adb devices')) {
      newLogs.push({
        id: (Date.now() + 1).toString(),
        type: 'out',
        text: 'List of devices attached\nemulator-5554\tdevice product:husky model:Pixel_8_Pro device:husky transport_id:1',
      });
    } else if (cmd.startsWith('adb install')) {
      const match = rawCmd.match(/adb install(?: -[a-z]+)*\s+(.+)/);
      const pkgFile = match ? match[1] : 'application.apk';
      newLogs.push({
        id: (Date.now() + 1).toString(),
        type: 'out',
        text: `Performing Streamed Install\n[100%] Transferring ${pkgFile}\nPkg: /data/app/~~vB49/${pkgFile}\nSuccess: Installed in 1.42s`,
      });
      soundEffects.notification(soundEnabled);
      setInstallSuccessMessage(`فرمان ADB: بسته ${pkgFile} با موفقیت نصب گردید.`);
      setTimeout(() => setInstallSuccessMessage(''), 3500);
    } else if (cmd.includes('pm list packages')) {
      const list = PLAY_STORE_APPS.map((a) => `package:${a.packageName}`).join('\n') + '\npackage:com.android.chrome\npackage:com.google.android.gms';
      newLogs.push({ id: (Date.now() + 1).toString(), type: 'out', text: list });
    } else if (cmd.includes('dumpsys battery')) {
      newLogs.push({
        id: (Date.now() + 1).toString(),
        type: 'out',
        text: 'Current Battery Service state:\n  AC powered: true\n  USB powered: true\n  status: 2 (Charging)\n  health: 2 (Good)\n  present: true\n  level: 98\n  scale: 100\n  voltage: 4350mV\n  temperature: 284 (28.4°C)\n  technology: Li-ion',
      });
    } else if (cmd.includes('getprop')) {
      newLogs.push({
        id: (Date.now() + 1).toString(),
        type: 'out',
        text: '[ro.build.version.release]: [14]\n[ro.build.version.sdk]: [34]\n[ro.product.model]: [Pixel 8 Pro]\n[ro.product.manufacturer]: [Google]\n[ro.product.cpu.abi]: [arm64-v8a]\n[ro.hardware]: [husky_tensor_g3]\n[gsm.network.type]: [5G_SA]',
      });
    } else if (cmd.includes('logcat')) {
      setIsLogcatStreaming(!isLogcatStreaming);
      newLogs.push({
        id: (Date.now() + 1).toString(),
        type: 'info',
        text: isLogcatStreaming ? '--- Logcat stream paused ---' : '--- Starting Android logcat live stream (Press again or run adb logcat to pause) ---',
      });
    } else if (cmd.includes('reboot')) {
      newLogs.push({
        id: (Date.now() + 1).toString(),
        type: 'out',
        text: 'Restarting Android runtime zygote & system_server...',
      });
      setCloudActiveScreen('launcher');
    } else if (cmd.includes('help')) {
      newLogs.push({
        id: (Date.now() + 1).toString(),
        type: 'info',
        text: 'Available ADB commands:\n  adb devices - list attached cloud instances\n  adb install [-r] <file.apk> - stream and install APK\n  adb shell pm list packages - list installed packages\n  adb shell dumpsys battery - check cloud device battery\n  adb shell getprop - read Android build & hardware properties\n  adb logcat - stream live system logs\n  adb reboot - soft reboot cloud container\n  clear - clear terminal output',
      });
    } else {
      newLogs.push({
        id: (Date.now() + 1).toString(),
        type: 'out',
        text: `Executing: ${rawCmd}\n[OK] Return code 0.`,
      });
    }

    setAdbLogs(newLogs);
    setAdbInput('');
  };

  // Generate & Download Full System Backup File (.alibackup)
  const handleGenerateBackup = () => {
    soundEffects.click(soundEnabled);
    const backupData = {
      backupId: `ALI_BACKUP_${Date.now()}`,
      backupDate: new Date().toISOString(),
      deviceName: 'ALI phone - iPhone 16 Pro Max',
      chip: 'Apple A18 Pro',
      osVersion: 'ALI OS 18.2',
      installedApps,
      products,
      notes,
      settings: {
        language,
        titaniumFinish,
        wallpaperUrl,
        soundEnabled,
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aliphone_full_backup_${new Date().toISOString().split('T')[0]}.alibackup`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    soundEffects.notification(soundEnabled);
    setBackupNotice(t('gp_backup_success', language));
    setTimeout(() => setBackupNotice(''), 4000);
  };

  // Restore from uploaded .alibackup / JSON file
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.click(soundEnabled);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products && Array.isArray(parsed.products)) {
          onRestoreProducts(parsed.products);
        }
        if (parsed.notes && Array.isArray(parsed.notes)) {
          onRestoreNotes(parsed.notes);
        }
        soundEffects.notification(soundEnabled);
        setBackupNotice(t('gp_restore_success', language));
        setTimeout(() => setBackupNotice(''), 4500);
      } catch (err) {
        setBackupNotice('خطا: ساختار فایل پشتیبان نامعتبر می‌باشد.');
        setTimeout(() => setBackupNotice(''), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white select-none">
      {/* Top Header - Google Play branding */}
      <div className="pt-13 px-4 pb-2 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Official Google Play multicolor triangle */}
          <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700/80 flex items-center justify-center shadow-md">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M3.6 2.1c-.2.2-.4.6-.4 1v17.8c0 .4.2.8.4 1l9.9-9.9L3.6 2.1z" />
              <path fill="#FBBC05" d="M17.4 8.2l-3.9 3.9 3.9 3.9 4.3-2.5c1.2-.7 1.2-1.8 0-2.5l-4.3-2.8z" />
              <path fill="#34A853" d="M13.5 12.1L3.6 22c.4.4 1.1.5 1.8.1l12-6.9-3.9-3.1z" />
              <path fill="#EA4335" d="M13.5 12.1l3.9-3.9L5.4 1.3C4.7.9 4 1 3.6 1.4l9.9 10.7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">{t('gp_title', language)}</h1>
            <p className="text-[10px] text-neutral-400">Play Store · Cloud Streaming · ADB Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Cloud A14
          </span>
        </div>
      </div>

      {/* Navigation Tabs (Horizontal Scrollable for Clean Touch Fit) */}
      <div className="flex items-center gap-1 p-1.5 bg-neutral-900 border-b border-neutral-800 text-[11px] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            activeTab === 'store' ? 'bg-neutral-800 text-emerald-400 font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>{t('gp_tab_store', language)}</span>
        </button>
        <button
          onClick={() => setActiveTab('cloud')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            activeTab === 'cloud' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>استریم ابری (Appetize)</span>
        </button>
        <button
          onClick={() => setActiveTab('adb')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            activeTab === 'adb' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>ترمینال ADB</span>
        </button>
        <button
          onClick={() => setActiveTab('installer')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            activeTab === 'installer' ? 'bg-neutral-800 text-blue-400 font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{t('gp_tab_installer', language)}</span>
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            activeTab === 'backup' ? 'bg-neutral-800 text-amber-400 font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{t('gp_tab_backup', language)}</span>
        </button>
      </div>

      {/* Success Notification Bar */}
      {(installSuccessMessage || backupNotice) && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{installSuccessMessage || backupNotice}</span>
        </div>
      )}

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ==================================================================== */}
        {/* TAB 1: Google Play Store                                             */}
        {/* ==================================================================== */}
        {activeTab === 'store' && (
          <div className="space-y-4">
            {/* Banner explaining Real Android Streaming vs Native APK */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-cyan-950/40 border border-neutral-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span>استریم ابری اندروید فعال است</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">Appetize & Genymotion</span>
                </p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  می‌توانید هر بسته را مستقیماً دانلود نمایید یا با یک کلیک روی سرورهای ابری اجرا و به صورت استریم زنده تست کنید.
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('gp_search', language)}
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-2xl pr-9 pl-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Android / APK Package List */}
            <div className="space-y-2.5">
              {filteredApps.map((apk) => {
                const isInstalled = installedApps.some(
                  (a) => a.id === `apk_${apk.packageName.replace(/\./g, '_')}`
                );

                return (
                  <div
                    key={apk.id}
                    className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors flex flex-col gap-2.5 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl shrink-0 p-1 bg-neutral-800 rounded-xl">{apk.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{apk.appName}</h4>
                          <p className="text-[10px] text-neutral-400 font-mono">{apk.packageName}</p>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1">
                            <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {apk.rating}
                            </span>
                            <span>·</span>
                            <span>{apk.downloads} دانلود</span>
                            <span>·</span>
                            <span className="font-mono">{apk.sizeMb} MB</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                        {apk.versionName}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {apk.description}
                    </p>

                    {/* Actions: Install APK, Stream on Cloud & Download .apk */}
                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-neutral-800 text-xs gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isInstalled ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>{t('installed', language)}</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleInstallApk(apk)}
                            disabled={isInstalling}
                            className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{t('gp_install_apk', language)}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeployApkToCloud(apk)}
                          className="px-3 py-1 rounded-full bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-[11px] font-semibold flex items-center gap-1 border border-cyan-500/40 active:scale-95 transition-all"
                          title="استریم زنده این برنامه در اندروید ابری"
                        >
                          <Play className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                          <span>استریم ابری</span>
                        </button>

                        <button
                          onClick={() => handleDownloadApkFile(apk)}
                          className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium flex items-center gap-1 border border-neutral-700"
                          title="دانلود فایل خام APK"
                        >
                          <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                          <span>دانلود .apk</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedApk(selectedApk?.id === apk.id ? null : apk)}
                        className="text-[11px] text-neutral-400 hover:text-white"
                      >
                        {selectedApk?.id === apk.id ? 'بستن مجوزها' : 'مجوزها ↵'}
                      </button>
                    </div>

                    {/* Expandable Permissions view */}
                    {selectedApk?.id === apk.id && (
                      <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700 text-[10px] space-y-1 mt-1">
                        <p className="font-semibold text-neutral-300">{t('gp_permissions', language)}:</p>
                        <div className="flex flex-wrap gap-1">
                          {apk.permissions.map((perm) => (
                            <span key={perm} className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 font-mono">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: Cloud Android Streaming (Appetize.io & Genymotion Engine)     */}
        {/* ==================================================================== */}
        {activeTab === 'cloud' && (
          <div className="space-y-4">
            {/* Core Explanation Card based on User Specification */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-blue-950/40 border border-cyan-500/30 space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Radio className="w-5 h-5 animate-pulse" />
                  <h3 className="text-sm font-bold text-white">استریم ابری اندروید (Cloud Android Streaming)</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  Appetize / Genymotion
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed text-justify">
                سرویس‌هایی مثل <span className="text-cyan-400 font-bold">Appetize.io</span> یا <span className="text-blue-400 font-bold">Genymotion Cloud</span> یک گوشی اندروید واقعی با معماری x86/ARM را روی سرور اجرا می‌کنند و خروجی تصویر و تاچ آن را داخل مرورگر استریم می‌نمایند. فایل <span className="text-emerald-400 font-mono font-bold">APK</span> را آپلود می‌کنید تا با <span className="text-cyan-400 font-mono">adb install</span> یا Play Store مستقر شود.
              </p>
            </div>

            {/* Cloud Stream Sub-Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs">
              <button
                onClick={() => setCloudStreamMode('interactive')}
                className={`flex-1 py-1.5 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 ${
                  cloudStreamMode === 'interactive'
                    ? 'bg-cyan-600 text-white font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>شبیه‌ساز لایو استریم</span>
              </button>
              <button
                onClick={() => setCloudStreamMode('appetize')}
                className={`flex-1 py-1.5 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 ${
                  cloudStreamMode === 'appetize'
                    ? 'bg-blue-600 text-white font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>پلیر Appetize.io</span>
              </button>
              <button
                onClick={() => setCloudStreamMode('genymotion')}
                className={`flex-1 py-1.5 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 ${
                  cloudStreamMode === 'genymotion'
                    ? 'bg-purple-600 text-white font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>معماری Genymotion</span>
              </button>
            </div>

            {/* SUB-MODE 1: Interactive Live Cloud Runner */}
            {cloudStreamMode === 'interactive' && (
              <div className="space-y-4">
                {/* Cloud Stream Device Settings & Controls Bar */}
                <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 text-[11px]">دستگاه:</span>
                    <select
                      value={cloudDevice}
                      onChange={(e) => setCloudDevice(e.target.value as any)}
                      className="bg-neutral-800 border border-neutral-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
                    >
                      <option value="pixel8">Google Pixel 8 Pro (Android 14)</option>
                      <option value="s24">Samsung Galaxy S24 Ultra (One UI 6.1)</option>
                      <option value="pixel7">Google Pixel 7 (Android 13)</option>
                      <option value="nexus5x">Nexus 5X (Android 11 Legacy)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Rotate orientation */}
                    <button
                      onClick={() => {
                        soundEffects.click(soundEnabled);
                        setCloudOrientation(cloudOrientation === 'portrait' ? 'landscape' : 'portrait');
                      }}
                      className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                      title="چرخش صفحه (Rotate)"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Mute/Unmute */}
                    <button
                      onClick={() => {
                        soundEffects.click(soundEnabled);
                        setCloudMuted(!cloudMuted);
                      }}
                      className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                      title={cloudMuted ? 'روشن کردن صدا' : 'قطع صدا'}
                    >
                      {cloudMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>

                    {/* Power Toggle */}
                    <button
                      onClick={() => {
                        soundEffects.click(soundEnabled);
                        setCloudPowerOn(!cloudPowerOn);
                      }}
                      className={`p-1.5 rounded-xl transition-colors ${
                        cloudPowerOn ? 'bg-emerald-600/30 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                      }`}
                      title="کلید پاور اندروید (Power)"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Upload Progress Bar if active */}
                {cloudUploadProgress !== null && (
                  <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 animate-bounce" />
                        <span>در حال استقرار APK روی سرور ابری...</span>
                      </span>
                      <span className="font-mono text-cyan-400">{cloudUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${cloudUploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* VIRTUAL CLOUD ANDROID STREAM CONTAINER */}
                <div
                  className={`mx-auto rounded-[36px] bg-neutral-950 border-4 border-neutral-700 shadow-2xl overflow-hidden flex flex-col relative transition-all duration-300 ${
                    cloudOrientation === 'landscape' ? 'w-full h-[280px]' : 'w-full max-w-[340px] h-[520px]'
                  }`}
                >
                  {/* Streaming Connection Indicator Banner */}
                  <div className="bg-neutral-900/95 border-b border-neutral-800/80 px-3 py-1 flex items-center justify-between text-[10px] text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="font-mono text-emerald-400 font-bold">WEBRTC LIVE</span>
                      <span>·</span>
                      <span className="font-mono">60 FPS</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[9px]">
                      <span>PING: 24ms</span>
                      <span className="text-cyan-400">ARM64</span>
                    </div>
                  </div>

                  {/* Android Screen Body */}
                  <div className="flex-1 bg-gradient-to-b from-slate-900 to-neutral-950 relative overflow-hidden flex flex-col">
                    {!cloudPowerOn ? (
                      <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-2">
                        <Power className="w-8 h-8" />
                        <span className="text-xs">صفحه قفل یا خاموش است</span>
                        <button
                          onClick={() => setCloudPowerOn(true)}
                          className="mt-2 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs"
                        >
                          روشن کردن صفحه
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Android Status Bar */}
                        <div className="px-4 pt-1.5 pb-1 flex items-center justify-between text-[11px] text-neutral-300 font-mono z-10 bg-black/30 backdrop-blur-sm">
                          <span>12:45</span>
                          <div className="flex items-center gap-1.5">
                            <Wifi className="w-3.5 h-3.5 text-neutral-300" />
                            <span className="text-[10px] font-bold">5G</span>
                            <div className="w-5 h-2.5 rounded-sm border border-neutral-300 flex items-center p-0.5">
                              <div className="w-full h-full bg-emerald-400 rounded-2xs"></div>
                            </div>
                          </div>
                        </div>

                        {/* Cloud Screen Content Router */}
                        <div className="flex-1 overflow-y-auto p-3 relative flex flex-col">
                          {cloudActiveScreen === 'launcher' && (
                            <div className="flex-1 flex flex-col justify-between space-y-4">
                              {/* Google Search Widget */}
                              <div className="mt-2 bg-neutral-800/90 border border-neutral-700/60 rounded-full px-4 py-2 flex items-center justify-between text-xs shadow-md">
                                <span className="text-neutral-400 font-medium">Google Search</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-red-400 font-bold">G</span>
                                  <span className="text-yellow-400 font-bold">o</span>
                                  <span className="text-blue-400 font-bold">o</span>
                                  <span className="text-green-400 font-bold">g</span>
                                </div>
                              </div>

                              {/* Cloud Installed App Grid */}
                              <div className="grid grid-cols-4 gap-3 text-center my-auto">
                                <button
                                  onClick={() => {
                                    soundEffects.click(soundEnabled);
                                    setCloudActiveScreen('snapp');
                                  }}
                                  className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
                                >
                                  <span className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-2xl shadow-lg">
                                    🚕
                                  </span>
                                  <span className="text-[10px] text-white font-medium truncate w-full">اسنپ</span>
                                </button>

                                <button
                                  onClick={() => {
                                    soundEffects.click(soundEnabled);
                                    setCloudActiveScreen('digikala');
                                  }}
                                  className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
                                >
                                  <span className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-2xl shadow-lg">
                                    🛍️
                                  </span>
                                  <span className="text-[10px] text-white font-medium truncate w-full">دیجی‌کالا</span>
                                </button>

                                <button
                                  onClick={() => {
                                    soundEffects.click(soundEnabled);
                                    setCloudActiveScreen('telegram');
                                  }}
                                  className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
                                >
                                  <span className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-2xl shadow-lg">
                                    ✈️
                                  </span>
                                  <span className="text-[10px] text-white font-medium truncate w-full">تلگرام</span>
                                </button>

                                <button
                                  onClick={() => {
                                    soundEffects.click(soundEnabled);
                                    setCloudActiveScreen('chrome');
                                  }}
                                  className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
                                >
                                  <span className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-2xl shadow-lg">
                                    🌐
                                  </span>
                                  <span className="text-[10px] text-white font-medium truncate w-full">Chrome</span>
                                </button>

                                {cloudRunningApp && (
                                  <button
                                    onClick={() => {
                                      soundEffects.click(soundEnabled);
                                      setInstallSuccessMessage(`اجرای بسته دلخواه: ${cloudRunningApp}`);
                                      setTimeout(() => setInstallSuccessMessage(''), 3000);
                                    }}
                                    className="flex flex-col items-center gap-1 active:scale-95 transition-transform animate-scaleUp"
                                  >
                                    <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-lg font-bold">
                                      <Package className="w-6 h-6" />
                                    </span>
                                    <span className="text-[10px] text-cyan-300 font-bold truncate w-full">{cloudRunningApp}</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    soundEffects.click(soundEnabled);
                                    setCloudActiveScreen('settings');
                                  }}
                                  className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
                                >
                                  <span className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-2xl shadow-lg">
                                    ⚙️
                                  </span>
                                  <span className="text-[10px] text-white font-medium truncate w-full">تنظیمات</span>
                                </button>
                              </div>

                              {/* Cloud Status Footer */}
                              <div className="p-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-[10px] text-neutral-400 text-center">
                                سرور ابری فعال: <span className="font-mono text-cyan-400">appetize-genymotion-arm64</span>
                              </div>
                            </div>
                          )}

                          {/* App View: Snapp */}
                          {cloudActiveScreen === 'snapp' && (
                            <div className="flex-1 bg-neutral-900 rounded-2xl p-3 flex flex-col justify-between text-xs">
                              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                                  <span>🚕 اسنپ اندروید</span>
                                </span>
                                <span className="text-[10px] text-neutral-400">v5.8.4</span>
                              </div>
                              <div className="py-6 text-center space-y-2">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
                                  📍
                                </div>
                                <p className="font-bold text-white">مبدا: میدان ونک، تهران</p>
                                <p className="text-[11px] text-neutral-400">شبیه‌سازی نقشه و انتخاب مقصد فعال است</p>
                              </div>
                              <button
                                onClick={() => {
                                  soundEffects.notification(soundEnabled);
                                  setInstallSuccessMessage('درخواست خودرو در محیط ابری اسنپ شبیه‌سازی شد!');
                                  setTimeout(() => setInstallSuccessMessage(''), 3000);
                                }}
                                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs"
                              >
                                درخواست خودرو اسنپ اکو
                              </button>
                            </div>
                          )}

                          {/* App View: Digikala */}
                          {cloudActiveScreen === 'digikala' && (
                            <div className="flex-1 bg-neutral-900 rounded-2xl p-3 flex flex-col justify-between text-xs">
                              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                                <span className="font-bold text-rose-500">🛍️ دیجی‌کالا</span>
                                <span className="text-[10px] text-neutral-400">فروشگاه آنلاین</span>
                              </div>
                              <div className="space-y-2 my-auto">
                                <div className="p-2.5 rounded-xl bg-neutral-800 flex items-center justify-between">
                                  <div>
                                    <p className="font-bold text-white text-xs">گوشی iPhone 16 Pro Max</p>
                                    <p className="text-[10px] text-neutral-400">رنگ تیتانیوم صحرایی ۱ ترابایت</p>
                                  </div>
                                  <span className="text-xs font-bold text-rose-400">موجود</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-neutral-800 flex items-center justify-between">
                                  <div>
                                    <p className="font-bold text-white text-xs">ساعت هوشمند Apple Watch Ultra 2</p>
                                    <p className="text-[10px] text-neutral-400">بند تریل لوپ نارنجی</p>
                                  </div>
                                  <span className="text-xs font-bold text-rose-400">تخفیف ویژه</span>
                                </div>
                              </div>
                              <button
                                onClick={() => setCloudActiveScreen('launcher')}
                                className="w-full py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
                              >
                                برگشت به صفحه اصلی
                              </button>
                            </div>
                          )}

                          {/* App View: Telegram */}
                          {cloudActiveScreen === 'telegram' && (
                            <div className="flex-1 bg-neutral-900 rounded-2xl p-3 flex flex-col justify-between text-xs">
                              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                                <span className="font-bold text-sky-400">✈️ Telegram Android</span>
                                <span className="text-[10px] text-neutral-400">آنلاین</span>
                              </div>
                              <div className="space-y-2 my-auto">
                                <div className="p-2 rounded-xl bg-neutral-800 flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center font-bold text-sky-400">
                                    AI
                                  </div>
                                  <div>
                                    <p className="font-bold text-white text-xs">کانال هوش مصنوعی و APK</p>
                                    <p className="text-[10px] text-neutral-400">آخرین نسخه بسته‌های اندروید ابری</p>
                                  </div>
                                </div>
                                <div className="p-2 rounded-xl bg-neutral-800 flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
                                    AL
                                  </div>
                                  <div>
                                    <p className="font-bold text-white text-xs">پشتیبانی علی‌فون</p>
                                    <p className="text-[10px] text-neutral-400">اتصال ابری بدون افت فریم برقرار است.</p>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => setCloudActiveScreen('launcher')}
                                className="w-full py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
                              >
                                بازگشت به لانچر
                              </button>
                            </div>
                          )}

                          {/* App View: Chrome */}
                          {cloudActiveScreen === 'chrome' && (
                            <div className="flex-1 bg-neutral-900 rounded-2xl p-3 flex flex-col justify-between text-xs">
                              <div className="bg-neutral-800 rounded-xl px-3 py-1.5 flex items-center justify-between text-neutral-400 text-xs">
                                <span className="truncate">https://google.com</span>
                                <Compass className="w-3.5 h-3.5" />
                              </div>
                              <div className="text-center py-6 space-y-1">
                                <h4 className="font-bold text-white text-base">Google Chrome Android</h4>
                                <p className="text-xs text-neutral-400">موتور رندرینگ Blink / Chromium</p>
                              </div>
                              <button
                                onClick={() => setCloudActiveScreen('launcher')}
                                className="w-full py-2 rounded-xl bg-neutral-800 text-neutral-200 text-xs"
                              >
                                خروج از مرورگر
                              </button>
                            </div>
                          )}

                          {/* App View: Android Settings */}
                          {cloudActiveScreen === 'settings' && (
                            <div className="flex-1 bg-neutral-900 rounded-2xl p-3 flex flex-col justify-between text-xs">
                              <div className="font-bold text-white border-b border-neutral-800 pb-2">
                                تنظیمات اندروید ابری (AOSP)
                              </div>
                              <div className="space-y-1.5 text-[11px] my-auto">
                                <div className="p-2 rounded-xl bg-neutral-800 flex items-center justify-between">
                                  <span>اشکال‌زدایی USB (USB Debugging)</span>
                                  <span className="text-emerald-400 font-bold">فعال (ADB)</span>
                                </div>
                                <div className="p-2 rounded-xl bg-neutral-800 flex items-center justify-between">
                                  <span>نسخه کرنل لینوکس</span>
                                  <span className="font-mono text-neutral-400">6.1.45-android</span>
                                </div>
                                <div className="p-2 rounded-xl bg-neutral-800 flex items-center justify-between">
                                  <span>شتاب‌دهنده گرافیکی GPU</span>
                                  <span className="text-cyan-400 font-bold">Vulkan 1.3</span>
                                </div>
                              </div>
                              <button
                                onClick={() => setCloudActiveScreen('launcher')}
                                className="w-full py-2 rounded-xl bg-neutral-800 text-neutral-200 text-xs"
                              >
                                بازگشت به خانه
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Android 3-Button Navigation Bar */}
                        <div className="py-2.5 px-8 bg-black/60 backdrop-blur-md border-t border-neutral-800/80 flex items-center justify-between text-neutral-400">
                          {/* Back Button */}
                          <button
                            onClick={() => {
                              soundEffects.click(soundEnabled);
                              setCloudActiveScreen('launcher');
                            }}
                            className="p-1 hover:text-white active:scale-90 transition-transform"
                            title="بازگشت (Back)"
                          >
                            <Triangle className="w-3.5 h-3.5 -rotate-90 fill-current" />
                          </button>

                          {/* Home Button */}
                          <button
                            onClick={() => {
                              soundEffects.click(soundEnabled);
                              setCloudActiveScreen('launcher');
                            }}
                            className="p-1 hover:text-white active:scale-90 transition-transform"
                            title="خانه (Home)"
                          >
                            <Circle className="w-4 h-4" />
                          </button>

                          {/* Recent Apps Button */}
                          <button
                            onClick={() => {
                              soundEffects.click(soundEnabled);
                              soundEffects.notification(soundEnabled);
                              setInstallSuccessMessage('نمایش برنامه‌های اخیر در حافظه کانتینر ابری اندروید');
                              setTimeout(() => setInstallSuccessMessage(''), 2500);
                            }}
                            className="p-1 hover:text-white active:scale-90 transition-transform"
                            title="برنامه‌های اخیر (Recent Tasks)"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Direct Upload APK to Cloud Stream */}
                <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>آپلود و استقرار مستقیم فایل APK در استریم ابری</span>
                    </span>
                    <button
                      onClick={() => cloudFileInputRef.current?.click()}
                      className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                    >
                      انتخاب فایل .apk
                    </button>
                  </div>
                  <input
                    ref={cloudFileInputRef}
                    type="file"
                    accept=".apk,.zip"
                    onChange={handleCloudApkUpload}
                    className="hidden"
                  />
                  <p className="text-[10px] text-neutral-400">
                    فایل آپلودشده به صورت خودکار روی کانتینر اندروید نصب شده و تصویر زنده آن در پلیر فوق نمایش داده می‌شود.
                  </p>
                </div>
              </div>
            )}

            {/* SUB-MODE 2: Official Appetize.io Embed Integration */}
            {cloudStreamMode === 'appetize' && (
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Tv className="w-5 h-5" />
                      <h4 className="text-sm font-bold text-white">پلیر واقعی Appetize.io (Web Embed)</h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                      Iframe Streamer
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed text-justify">
                    سرویس <span className="text-blue-400 font-bold">Appetize.io</span> پیشروترین ارائه‌دهنده وب‌استریمینگ اندروید است. در این حالت می‌توانید از کانتینر پیش‌نمایش یا شناسه اختصاصی برنامه خود در Appetize استفاده نمایید.
                  </p>

                  {/* Appetize Key Configuration */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={appetizeCustomInput}
                        onChange={(e) => setAppetizeCustomInput(e.target.value)}
                        placeholder="شناسه عمومی برنامه (Public Key) در Appetize..."
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
                      />
                      <button
                        onClick={() => {
                          if (appetizeCustomInput.trim()) {
                            setAppetizeKey(appetizeCustomInput.trim());
                            setInstallSuccessMessage(`کلید Appetize به ${appetizeCustomInput.trim()} تغییر یافت.`);
                            setTimeout(() => setInstallSuccessMessage(''), 3000);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                      >
                        بارگذاری
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <span>نمونه‌های آماده:</span>
                      <button
                        onClick={() => setAppetizeKey('demo')}
                        className={`px-2 py-0.5 rounded ${appetizeKey === 'demo' ? 'bg-blue-500 text-white' : 'bg-neutral-800 text-neutral-300'}`}
                      >
                        نسخه آزمایشی (Demo)
                      </button>
                      <button
                        onClick={() => setAppetizeKey('standalone')}
                        className={`px-2 py-0.5 rounded ${appetizeKey === 'standalone' ? 'bg-blue-500 text-white' : 'bg-neutral-800 text-neutral-300'}`}
                      >
                        Pixel 7 Stream
                      </button>
                    </div>
                  </div>

                  {/* Appetize Embedded Frame */}
                  <div className="w-full h-[380px] rounded-2xl bg-black border border-neutral-800 overflow-hidden relative shadow-inner">
                    <iframe
                      src={`https://appetize.io/embed/${appetizeKey}?device=pixel7&osVersion=13.0&scale=75&toolbar=true&centered=true`}
                      className="w-full h-full border-0"
                      title="Appetize.io Cloud Android Stream"
                      allow="autoplay; camera; microphone"
                    />
                  </div>

                  {/* API Upload Guide */}
                  <div className="p-3 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 text-xs space-y-1.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" />
                      <span>دستور ارسال خودکار APK به Appetize با cURL:</span>
                    </p>
                    <pre className="p-2 rounded-xl bg-neutral-950 text-cyan-300 font-mono text-[10px] overflow-x-auto text-left dir-ltr">
                      {`curl https://api.appetize.io/v2/apps \\
  -F "file=@your_app.apk" \\
  -F "platform=android" \\
  -u "tok_YOUR_API_TOKEN:"`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-MODE 3: Genymotion Cloud Architecture */}
            {cloudStreamMode === 'genymotion' && (
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Server className="w-5 h-5" />
                    <h4 className="text-sm font-bold text-white">معماری Genymotion Cloud PaaS</h4>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed text-justify">
                    سرویس <span className="text-purple-400 font-bold">Genymotion Cloud</span> سیستم‌عامل اندروید را به عنوان یک Container روی سرورهای AWS، GCP یا دیتاسنتر اختصاصی اجرا می‌کند. ویدیو از طریق پروتکل فوق‌سریع <span className="text-cyan-400 font-mono font-bold">WebRTC</span> با تأخیر کمتر از ۳۰ میلی‌ثانیه به مرورگر وب فرستاده می‌شود.
                  </p>

                  {/* Tech Specs Comparison Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-neutral-800 border border-neutral-700 space-y-1">
                      <p className="font-bold text-cyan-400">Appetize.io</p>
                      <p className="text-[10px] text-neutral-400">مناسب نمایش سریع در سایت، تست نسخه دمو و تست‌های دستی</p>
                      <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">۱۰۰ دقیقه رایگان در ماه</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-neutral-800 border border-neutral-700 space-y-1">
                      <p className="font-bold text-purple-400">Genymotion SaaS</p>
                      <p className="text-[10px] text-neutral-400">پشتیبانی از شتاب‌دهنده گرافیکی GPU، اتصال مستقیم ADB over IP و اتوماسیون CI/CD</p>
                      <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">مناسب توسعه پیشرفته</span>
                    </div>
                  </div>

                  {/* Connect over ADB over WebSocket */}
                  <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-1.5 font-mono">
                    <p className="text-neutral-400 text-[10px]">اتصال خط فرمان محلی به سرور Genymotion:</p>
                    <p className="text-emerald-400 text-[11px] dir-ltr text-left">
                      $ gmsaas instances start [instance_uuid]<br />
                      $ adb connect 127.0.0.1:5555<br />
                      $ adb install my_app.apk
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: ADB Terminal & Console (adb install Engine)                   */}
        {/* ==================================================================== */}
        {activeTab === 'adb' && (
          <div className="space-y-3">
            {/* Terminal Header */}
            <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white">ترمینال خط فرمان Android Debug Bridge</span>
              </div>
              <button
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  setAdbLogs([]);
                }}
                className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>پاکسازی لاگ</span>
              </button>
            </div>

            {/* Quick Action Commands */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-[10px] font-mono">
              <button
                onClick={() => handleRunAdbCommand('adb devices')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 shrink-0"
              >
                adb devices
              </button>
              <button
                onClick={() => handleRunAdbCommand('adb install -r snapp_v5.8.4.apk')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shrink-0"
              >
                adb install (اسنپ)
              </button>
              <button
                onClick={() => handleRunAdbCommand('adb shell pm list packages')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 shrink-0"
              >
                pm list packages
              </button>
              <button
                onClick={() => handleRunAdbCommand('adb logcat')}
                className={`px-2.5 py-1 rounded-lg shrink-0 border transition-colors ${
                  isLogcatStreaming
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                }`}
              >
                {isLogcatStreaming ? 'توقف logcat' : 'adb logcat (Live)'}
              </button>
              <button
                onClick={() => handleRunAdbCommand('adb shell dumpsys battery')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 shrink-0"
              >
                dumpsys battery
              </button>
              <button
                onClick={() => handleRunAdbCommand('adb help')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 shrink-0"
              >
                راهنما (help)
              </button>
            </div>

            {/* Interactive Terminal Window */}
            <div
              ref={adbScrollRef}
              className="h-[340px] rounded-2xl bg-black border border-neutral-800 p-3 font-mono text-[11px] overflow-y-auto space-y-1.5 text-left dir-ltr shadow-inner"
            >
              {adbLogs.map((log) => (
                <div key={log.id} className="leading-relaxed">
                  {log.type === 'cmd' ? (
                    <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                      <span className="text-neutral-500">$</span>
                      <span>{log.text}</span>
                    </div>
                  ) : log.type === 'err' ? (
                    <div className="text-rose-400 whitespace-pre-wrap">{log.text}</div>
                  ) : log.type === 'info' ? (
                    <div className="text-yellow-400/90 whitespace-pre-wrap text-[10px]">{log.text}</div>
                  ) : (
                    <div className="text-emerald-300 whitespace-pre-wrap">{log.text}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Command Input Field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunAdbCommand();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-mono">
                <span className="text-cyan-400 font-bold">$</span>
                <input
                  type="text"
                  value={adbInput}
                  onChange={(e) => setAdbInput(e.target.value)}
                  placeholder="دستور adb را تایپ کنید (مثلاً: adb install app.apk)..."
                  className="w-full bg-transparent text-white placeholder-neutral-500 focus:outline-none font-mono text-xs"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                اجرا
              </button>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: APK Sideload & File Installer                                 */}
        {/* ==================================================================== */}
        {activeTab === 'installer' && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <FileCode className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">نصب بسته دلخواه با فرمت APK</h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                می‌توانید هر فایل نصبی با پسوند <span className="text-blue-400 font-mono">.apk</span> یا <span className="text-blue-400 font-mono">.zip</span> را از رایانه خود بارگذاری کرده و به صورت مستقیم روی پردازنده A18 Pro شبیه‌ساز علی‌فون اجرا نمایید.
              </p>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-neutral-700 hover:border-blue-500 bg-neutral-800/50 text-center cursor-pointer transition-colors space-y-2"
              >
                <Upload className="w-8 h-8 text-blue-400 mx-auto" />
                <p className="text-xs font-semibold text-white">{t('gp_drop_apk', language)}</p>
                <p className="text-[10px] text-neutral-400">پشتیبانی کامل از ساختار بسته APK و امضای اندروید</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".apk,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Uploaded File Manifest Details */}
              {uploadedFile && (
                <div className="p-3.5 rounded-2xl bg-neutral-800 border border-blue-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{uploadedFile.name}</span>
                    <span className="text-[10px] text-blue-400 font-mono">{uploadedFile.sizeMb} MB</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 space-y-1">
                    <p>شناسه بسته شبیه‌سازی: <span className="font-mono text-neutral-300">{uploadedFile.packageName}</span></p>
                    <p className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>سازگار با معماری ARM64 و چیپ A18 Pro علی‌فون</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleInstallUploadedApk}
                      disabled={isInstalling}
                      className="py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      <span>نصب روی صفحه اصلی</span>
                    </button>
                    <button
                      onClick={() => {
                        soundEffects.click(soundEnabled);
                        setCloudRunningApp(uploadedFile.appName);
                        setActiveTab('cloud');
                        setInstallSuccessMessage(`بسته ${uploadedFile.name} آماده استریم روی سرور شد!`);
                        setTimeout(() => setInstallSuccessMessage(''), 3000);
                      }}
                      className="py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <Play className="w-4 h-4" />
                      <span>استریم در ابر</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: Full Backup & Restore System                                  */}
        {/* ==================================================================== */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            {/* Backup Generation Card */}
            <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Database className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">پشتیبان‌گیری جامع سیستم و محصولات</h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                از تمامی محصولات ثبت‌شده، بسته‌های APK نصب‌شده، یادداشت‌ها، لیست ابزارها و تنظیمات علی‌فون نسخه پشتیبان کامل تهیه کنید و در رایانه خود ذخیره نمایید.
              </p>

              {/* Backup Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                  <p className="text-[10px] text-neutral-400">محصولات انبار</p>
                  <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">{products.length}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                  <p className="text-[10px] text-neutral-400">برنامه‌ها و APK</p>
                  <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{installedApps.length}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                  <p className="text-[10px] text-neutral-400">یادداشت‌ها</p>
                  <p className="text-sm font-bold text-purple-400 font-mono mt-0.5">{notes.length}</p>
                </div>
              </div>

              <button
                onClick={handleGenerateBackup}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{t('gp_backup_btn', language)}</span>
              </button>
            </div>

            {/* Restore Card */}
            <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">بازیابی اطلاعات (Restore Backup)</h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                فایل بکاپ دانلود‌شده (<span className="text-amber-400 font-mono">.alibackup</span> یا <span className="text-amber-400 font-mono">.json</span>) را انتخاب کنید تا تمامی اطلاعات بلافاصله در گوشی بازنشانی شوند.
              </p>

              <div
                onClick={() => restoreFileInputRef.current?.click()}
                className="p-4 rounded-2xl border border-dashed border-neutral-700 hover:border-emerald-500 bg-neutral-800/40 text-center cursor-pointer transition-colors"
              >
                <Upload className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-neutral-200">{t('gp_restore_btn', language)}</span>
                <input
                  ref={restoreFileInputRef}
                  type="file"
                  accept=".alibackup,.json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
