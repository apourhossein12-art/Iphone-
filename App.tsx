import React, { useState, useEffect } from 'react';
import {
  TitaniumFinish,
  CustomApp,
  ProductItem,
  NoteItem,
  PhotoItem,
  ContactItem,
  DynamicIslandState,
  AppLanguage,
  AppRegion,
  CalendarType,
  NumberSystem,
} from './types/phone';
import {
  DEFAULT_WALLPAPERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOM_APPS,
  INITIAL_NOTES,
  INITIAL_CONTACTS,
  INITIAL_PHOTOS,
} from './utils/defaultData';
import { soundEffects } from './utils/soundEffects';
import { SUPPORTED_LANGUAGES, t, formatDigits } from './utils/i18n';
import { IPhoneChassis } from './components/hardware/IPhoneChassis';
import { DynamicIsland } from './components/os/DynamicIsland';
import { ControlCenter } from './components/os/ControlCenter';
import { LockScreen } from './components/os/LockScreen';
import { SiriOverlay } from './components/os/SiriOverlay';
import { HomeScreen } from './components/os/HomeScreen';
import { InstallPrompt } from './components/os/InstallPrompt';
import { audioEngine } from './utils/audioEngine';
import { useBattery, useNetwork, useIsNative, useTorch, useWakeLock, useInstallPrompt } from './utils/device';

// App Views
import { AppStoreApp } from './components/apps/AppStoreApp';
import { GooglePlayApkApp } from './components/apps/GooglePlayApkApp';
import { ProductManagerApp } from './components/apps/ProductManagerApp';
import { CameraApp } from './components/apps/CameraApp';
import { PhotosApp } from './components/apps/PhotosApp';
import { PhoneApp } from './components/apps/PhoneApp';
import { MessagesApp } from './components/apps/MessagesApp';
import { SafariApp } from './components/apps/SafariApp';
import { CalculatorApp } from './components/apps/CalculatorApp';
import { NotesApp } from './components/apps/NotesApp';
import { MusicApp } from './components/apps/MusicApp';
import { WeatherApp } from './components/apps/WeatherApp';
import { ClockApp } from './components/apps/ClockApp';
import { SettingsApp } from './components/apps/SettingsApp';
import { CustomAppViewer } from './components/apps/CustomAppViewer';
import { TerminalApp } from './components/apps/TerminalApp';
import { CalendarApp } from './components/apps/CalendarApp';
import { MapsApp } from './components/apps/MapsApp';

import {
  Smartphone,
  Sparkles,
  Palette,
  Package,
  Layers,
  PhoneCall,
  RotateCcw,
  Volume2,
  VolumeX,
  Flashlight,
  Maximize2,
  Cpu,
  Wifi,
  Radio,
  Lock,
  Unlock,
  FileCode,
  Globe,
  Database,
  Download,
} from 'lucide-react';

export default function App() {
  // Persistence Helpers
  const loadLocal = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`aliphone_${key}`);
      return saved ? JSON.parse(saved.split('/src/assets/images/').join('/wallpapers/')) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveLocal = (key: string, data: any) => {
    try {
      localStorage.setItem(`aliphone_${key}`, JSON.stringify(data));
    } catch {}
  };

  // Phone OS State
  const [isLocked, setIsLocked] = useState(false);
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [siriOpen, setSiriOpen] = useState(false);

  // Dynamic Island
  const [dynamicIsland, setDynamicIsland] = useState<DynamicIslandState>({
    type: 'idle',
    expanded: false,
  });

  // Hardware Finishes & Customization
  const [titaniumFinish, setTitaniumFinish] = useState<TitaniumFinish>(() =>
    loadLocal('titanium_finish', 'desert')
  );
  const [wallpaperUrl, setWallpaperUrl] = useState<string>(() =>
    loadLocal('wallpaper_url', DEFAULT_WALLPAPERS[0].url)
  );

  // True Multi-Language & Region (مثل تنظیمات آیفون)
  const [language, setLanguage] = useState<AppLanguage>(() =>
    loadLocal('language', 'fa')
  );
  const [region, setRegion] = useState<AppRegion>(() =>
    loadLocal('region', 'IR')
  );
  const [calendarType, setCalendarType] = useState<CalendarType>(() =>
    loadLocal('calendar_type', 'persian')
  );
  const [numberSystem, setNumberSystem] = useState<NumberSystem>(() =>
    loadLocal('number_system', 'persian')
  );

  // Storage Databases
  const [installedApps, setInstalledApps] = useState<CustomApp[]>(() =>
    loadLocal('installed_apps', INITIAL_CUSTOM_APPS)
  );
  const [products, setProducts] = useState<ProductItem[]>(() =>
    loadLocal('products', INITIAL_PRODUCTS)
  );
  const [notes, setNotes] = useState<NoteItem[]>(() =>
    loadLocal('notes', INITIAL_NOTES)
  );
  const [contacts] = useState<ContactItem[]>(INITIAL_CONTACTS);
  const [photos, setPhotos] = useState<PhotoItem[]>(() =>
    loadLocal('photos', INITIAL_PHOTOS)
  );

  // System Controls
  const [brightness, setBrightness] = useState<number>(100);
  const [volume, setVolume] = useState<number>(85);
  const [flashlightOn, setFlashlightOn] = useState<boolean>(false);
  const [lowPowerMode, setLowPowerMode] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [wifiEnabled, setWifiEnabled] = useState<boolean>(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState<boolean>(true);
  const [airplaneMode, setAirplaneMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Media & Active Call State
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [currentTrackTitle, setCurrentTrackTitle] = useState<string>(
    'ALI Spatial Audio - Titanium Vibes'
  );
  const [activeCall, setActiveCall] = useState<{
    name: string;
    number: string;
    duration: number;
  } | null>(null);

  // Real device integration
  const isNative = useIsNative();
  const battery = useBattery();
  const network = useNetwork();
  const pwa = useInstallPrompt();
  useTorch(flashlightOn && currentApp !== 'camera');
  useWakeLock(!isLocked);

  // Real-time clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync to localStorage
  useEffect(() => saveLocal('titanium_finish', titaniumFinish), [titaniumFinish]);
  useEffect(() => saveLocal('wallpaper_url', wallpaperUrl), [wallpaperUrl]);
  useEffect(() => saveLocal('language', language), [language]);
  useEffect(() => saveLocal('region', region), [region]);
  useEffect(() => saveLocal('calendar_type', calendarType), [calendarType]);
  useEffect(() => saveLocal('number_system', numberSystem), [numberSystem]);
  useEffect(() => saveLocal('installed_apps', installedApps), [installedApps]);
  useEffect(() => saveLocal('products', products), [products]);
  useEffect(() => saveLocal('notes', notes), [notes]);
  useEffect(() => saveLocal('photos', photos), [photos]);

  // Real audio engine <-> UI sync
  useEffect(() => {
    return audioEngine.subscribe((st) => {
      setIsMusicPlaying(st.playing);
      if (st.track) setCurrentTrackTitle(st.track.title);
      setDynamicIsland((prev) =>
        st.playing
          ? { type: 'music', title: st.track?.title, expanded: prev.type === 'music' ? prev.expanded : false }
          : prev.type === 'music' ? { type: 'idle' } : prev
      );
    });
  }, []);
  useEffect(() => audioEngine.setVolume(volume / 100), [volume]);

  // PWA shortcuts: /?app=camera
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('app');
    if (id) { setIsLocked(false); setCurrentApp(id); }
  }, []);

  // Handle active call duration
  useEffect(() => {
    let callTimer: any = null;
    if (activeCall) {
      callTimer = setInterval(() => {
        setActiveCall((prev) => (prev ? { ...prev, duration: prev.duration + 1 } : null));
      }, 1000);
    }
    return () => clearInterval(callTimer);
  }, [activeCall]);

  // Action Button Action (Flashlight / Haptics)
  const handleActionButton = () => {
    soundEffects.flashlight(soundEnabled);
    setFlashlightOn(!flashlightOn);
    setDynamicIsland({
      type: !flashlightOn ? 'flashlight' : 'idle',
      title: !flashlightOn ? 'Flashlight On' : undefined,
    });
    setTimeout(() => {
      setDynamicIsland((prev) => (prev.type === 'flashlight' ? { type: 'idle' } : prev));
    }, 2500);
  };

  // Camera Control button
  const handleCameraControl = () => {
    setIsLocked(false);
    setCurrentApp('camera');
  };

  // Power Button click
  const handlePowerClick = () => {
    soundEffects.lock(soundEnabled);
    if (isLocked) {
      setIsLocked(false);
    } else {
      setIsLocked(true);
      setCurrentApp(null);
    }
  };

  // Power Button long press -> Siri
  const handlePowerLongPress = () => {
    setSiriOpen(true);
  };

  // Music toggle (real audio)
  const handleToggleMusic = () => audioEngine.toggle();

  // Call simulation
  const handleStartCall = (name: string, number: string) => {
    setActiveCall({ name, number, duration: 0 });
    setDynamicIsland({
      type: 'call',
      title: name,
      expanded: false,
    });
  };

  const handleEndCall = () => {
    setActiveCall(null);
    setDynamicIsland({ type: 'idle' });
  };

  // Start countdown timer
  const handleStartTimer = (seconds: number) => {
    setDynamicIsland({
      type: 'timer',
      title: t('clock', language),
      remainingSeconds: seconds,
      expanded: false,
    });
    let remaining = seconds;
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        soundEffects.notification(soundEnabled);
        setDynamicIsland({ type: 'idle' });
      } else {
        setDynamicIsland((prev) =>
          prev.type === 'timer' ? { ...prev, remainingSeconds: remaining } : prev
        );
      }
    }, 1000);
  };

  // Assistant action executor
  const handleExecuteAction = (actionStr: string) => {
    if (actionStr.startsWith('open_app:')) {
      const target = actionStr.replace('open_app:', '');
      setIsLocked(false);
      setCurrentApp(target);
    } else if (actionStr === 'flashlight:toggle') {
      setFlashlightOn((prev) => !prev);
    } else if (actionStr === 'take_photo') {
      setIsLocked(false);
      setCurrentApp('camera');
    }
  };

  // Reset demo data
  const handleResetData = () => {
    localStorage.clear();
    setInstalledApps(INITIAL_CUSTOM_APPS);
    setProducts(INITIAL_PRODUCTS);
    setNotes(INITIAL_NOTES);
    setPhotos(INITIAL_PHOTOS);
    setTitaniumFinish('desert');
    setWallpaperUrl(DEFAULT_WALLPAPERS[0].url);
    setLanguage('fa');
    setRegion('IR');
    setCalendarType('persian');
    setNumberSystem('persian');
    soundEffects.notification(soundEnabled);
  };

  // Capture photo from Camera app
  const handleCapturePhoto = (photoUrl: string) => {
    const newPhoto: PhotoItem = {
      id: `photo_${Date.now()}`,
      url: photoUrl,
      title: `iPhone 16 Pro Max 48MP - ${new Date().toLocaleTimeString()}`,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setPhotos([newPhoto, ...photos]);
  };

  // Check if current app is a custom app
  const activeCustomApp = installedApps.find((a) => a.id === currentApp);

  // Status Bar Time format with selected number system
  const statusTimeHours = formatDigits(
    currentTime.getHours().toString().padStart(2, '0'),
    numberSystem
  );
  const statusTimeMins = formatDigits(
    currentTime.getMinutes().toString().padStart(2, '0'),
    numberSystem
  );

  const isRTL = language === 'fa' || language === 'ar';

  const screenContent = (
            <div
    dir={isRTL ? 'rtl' : 'ltr'}
    className="relative w-full h-full flex flex-col bg-black overflow-hidden select-none"
  >
    {/* TOP STATUS BAR: real time, real network, real battery (hidden in native mode: the OS draws its own) */}
    {!isNative && (
      <div
        onClick={() => setControlCenterOpen(true)}
        className="absolute top-0 left-0 right-0 h-11 px-7 flex items-center justify-between text-xs font-semibold text-white z-40 cursor-pointer group"
        title="Control Center"
      >
        <div className="text-sm tracking-tight text-white font-semibold tabular-nums">
          {statusTimeHours}:{statusTimeMins}
        </div>
        <div className="flex items-center gap-1.5">
          {network.online && !airplaneMode ? (
            <>
              <div className="flex items-end gap-0.5 h-2.5">
                <span className="w-0.5 h-1 bg-white rounded-full" />
                <span className="w-0.5 h-1.5 bg-white rounded-full" />
                <span className="w-0.5 h-2 bg-white rounded-full" />
                <span className={`w-0.5 h-2.5 rounded-full ${network.cellular ? 'bg-white' : 'bg-white/40'}`} />
              </div>
              {network.cellular ? (
                <span className="text-[10px] tracking-tight text-white">{network.label}</span>
              ) : (
                wifiEnabled && <Wifi className="w-3.5 h-3.5 text-white" />
              )}
            </>
          ) : (
            <span className="text-[10px] text-white/70">{airplaneMode ? '✈︎' : 'No Service'}</span>
          )}
          <div className="flex items-center gap-1">
            {battery.supported && (
              <span className="text-[10px] tabular-nums text-white">
                {formatDigits(Math.round(battery.level * 100), numberSystem)}
              </span>
            )}
            <div className="flex items-center gap-0.5">
              <div className="w-5 h-2.5 rounded-sm border border-white/70 p-0.5 flex items-center">
                <div
                  className={`h-full rounded-[1px] ${
                    battery.charging ? 'bg-emerald-400' : lowPowerMode ? 'bg-yellow-400' : battery.level <= 0.2 ? 'bg-red-500' : 'bg-white'
                  }`}
                  style={{ width: `${Math.max(8, Math.round(battery.level * 100))}%` }}
                />
              </div>
              <div className="w-0.5 h-1 bg-white/70 rounded-r-sm" />
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Native mode gestures: swipe down from the top = Control Center, double tap = lock */}
    {isNative && (
      <div
        className="absolute left-0 right-0 z-40"
        style={{ top: 0, height: 'calc(env(safe-area-inset-top) + 28px)', touchAction: 'none' }}
        onPointerDown={(e) => { (e.currentTarget as any)._y = e.clientY; }}
        onPointerUp={(e) => {
          const y0 = (e.currentTarget as any)._y ?? e.clientY;
          if (e.clientY - y0 > 24) { soundEffects.click(soundEnabled); setControlCenterOpen(true); }
        }}
        onDoubleClick={handlePowerClick}
      />
    )}

    {/* DYNAMIC ISLAND (live activities). In native mode it sits just under the real status bar */}
    <div
      className="absolute left-0 right-0 z-50 pointer-events-none"
      style={{ top: isNative ? 'calc(env(safe-area-inset-top) + 4px)' : 0, display: isNative && dynamicIsland.type === 'idle' ? 'none' : undefined }}
    >
      <div className="pointer-events-auto relative">
        <DynamicIsland
          state={dynamicIsland}
          onUpdateState={(next) => setDynamicIsland((prev) => ({ ...prev, ...next }))}
          onOpenApp={(appId) => {
            setIsLocked(false);
            setCurrentApp(appId);
          }}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={handleToggleMusic}
          currentTrackTitle={currentTrackTitle}
          soundEnabled={soundEnabled}
        />
      </div>
    </div>

    {/* ACTIVE SCREEN LAYER */}
    <div className="flex-1 relative overflow-hidden flex flex-col">
      {isLocked ? (
        <LockScreen
          onUnlock={() => setIsLocked(false)}
          wallpaperUrl={wallpaperUrl}
          flashlightOn={flashlightOn}
          setFlashlightOn={setFlashlightOn}
          onOpenApp={(appId) => {
            setIsLocked(false);
            setCurrentApp(appId);
          }}
          soundEnabled={soundEnabled}
          currentTime={currentTime}
          language={language}
          numberSystem={numberSystem}
          calendarType={calendarType}
        />
      ) : currentApp === null ? (
        <HomeScreen
          onOpenApp={(appId) => setCurrentApp(appId)}
          installedApps={installedApps}
          products={products}
          wallpaperUrl={wallpaperUrl}
          onOpenSiri={() => setSiriOpen(true)}
          onOpenControlCenter={() => setControlCenterOpen(true)}
          soundEnabled={soundEnabled}
          currentTime={currentTime}
          language={language}
        />
      ) : currentApp === 'googleplay' || currentApp === 'cloud_android' ? (
        <GooglePlayApkApp
          initialTab={currentApp === 'cloud_android' ? 'cloud' : 'store'}
          installedApps={installedApps}
          onInstallCustomApp={(newApp) =>
            setInstalledApps([...installedApps, newApp])
          }
          products={products}
          onRestoreProducts={(prods) => setProducts(prods)}
          notes={notes}
          onRestoreNotes={(n) => setNotes(n)}
          language={language}
          soundEnabled={soundEnabled}
          titaniumFinish={titaniumFinish}
          wallpaperUrl={wallpaperUrl}
        />
      ) : currentApp === 'appstore' ? (
        <AppStoreApp
          installedApps={installedApps}
          onInstallApp={(newApp) => setInstalledApps([...installedApps, newApp])}
          onUninstallApp={(appId) =>
            setInstalledApps(installedApps.filter((a) => a.id !== appId))
          }
          onLaunchApp={(appId) => setCurrentApp(appId)}
          soundEnabled={soundEnabled}
        />
      ) : currentApp === 'products' ? (
        <ProductManagerApp
          products={products}
          onAddProduct={(p) => setProducts([p, ...products])}
          onUpdateProduct={(p) =>
            setProducts(products.map((item) => (item.id === p.id ? p : item)))
          }
          onDeleteProduct={(id) =>
            setProducts(products.filter((p) => p.id !== id))
          }
          soundEnabled={soundEnabled}
        />
      ) : currentApp === 'camera' ? (
        <CameraApp
          onCapturePhoto={handleCapturePhoto}
          onOpenPhotos={() => setCurrentApp('photos')}
          lastCapturedUrl={photos[0]?.url}
          soundEnabled={soundEnabled}
        />
      ) : currentApp === 'photos' ? (
        <PhotosApp
          photos={photos}
          onDeletePhoto={(id) => setPhotos(photos.filter((p) => p.id !== id))}
          soundEnabled={soundEnabled}
        />
      ) : currentApp === 'phone' ? (
        <PhoneApp
          contacts={contacts}
          onStartCall={handleStartCall}
          onEndCall={handleEndCall}
          activeCall={activeCall}
          soundEnabled={soundEnabled}
        />
      ) : currentApp === 'messages' ? (
        <MessagesApp
          onExecuteAction={handleExecuteAction}
          soundEnabled={soundEnabled}
          phoneContext={{
            productsCount: products.length,
            installedAppsCount: installedApps.length,
            titaniumFinish,
            brightness,
            batteryHealth: '100%',
            language,
          }}
        />
      ) : currentApp === 'safari' ? (
        <SafariApp soundEnabled={soundEnabled} />
      ) : currentApp === 'calculator' ? (
        <CalculatorApp soundEnabled={soundEnabled} />
      ) : currentApp === 'notes' ? (
        <NotesApp
          notes={notes}
          onAddNote={(n) => setNotes([n, ...notes])}
          onUpdateNote={(n) =>
            setNotes(notes.map((item) => (item.id === n.id ? n : item)))
          }
          onDeleteNote={(id) => setNotes(notes.filter((n) => n.id !== id))}
          soundEnabled={soundEnabled}
        />
      ) : currentApp === 'music' ? (
        <MusicApp
          isPlaying={isMusicPlaying}
          onTogglePlay={handleToggleMusic}
          currentTrack={currentTrackTitle}
          onSelectTrack={() => {}}
          soundEnabled={soundEnabled}
        />
      ) : currentApp === 'weather' ? (
        <WeatherApp soundEnabled={soundEnabled} />
      ) : currentApp === 'clock' ? (
        <ClockApp
          onStartTimer={handleStartTimer}
          soundEnabled={soundEnabled}
        />
      ) : currentApp === 'terminal' ? (
        <TerminalApp soundEnabled={soundEnabled} />
      ) : currentApp === 'calendar' ? (
        <CalendarApp
          calendarType={calendarType}
          onSelectCalendarType={setCalendarType}
          numberSystem={numberSystem}
          language={language}
          soundEnabled={soundEnabled}
        />
      ) : currentApp === 'maps' ? (
        <MapsApp soundEnabled={soundEnabled} />
      ) : currentApp === 'settings' ? (
        <SettingsApp
          titaniumFinish={titaniumFinish}
          onSelectTitaniumFinish={setTitaniumFinish}
          currentWallpaperUrl={wallpaperUrl}
          onSelectWallpaper={setWallpaperUrl}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          language={language}
          onSelectLanguage={setLanguage}
          region={region}
          onSelectRegion={setRegion}
          calendarType={calendarType}
          onSelectCalendar={setCalendarType}
          numberSystem={numberSystem}
          onSelectNumberSystem={setNumberSystem}
          onResetData={handleResetData}
        />
      ) : activeCustomApp ? (
        <CustomAppViewer
          app={activeCustomApp}
          products={products}
          onBack={() => setCurrentApp(null)}
          soundEnabled={soundEnabled}
        />
      ) : (
        <div className="h-full flex items-center justify-center p-6 text-center text-neutral-400">
          <div>
            <p className="text-sm font-semibold">
              {language === 'fa' ? 'برنامه در دسترس نیست' : 'App Not Found'}
            </p>
            <button
              onClick={() => setCurrentApp(null)}
              className="mt-3 px-4 py-1.5 rounded-full bg-neutral-800 text-xs text-white"
            >
              {t('back', language)}
            </button>
          </div>
        </div>
      )}
    </div>

    {/* BOTTOM HOME INDICATOR BAR */}
    <div
      onClick={() => {
        soundEffects.click(soundEnabled);
        setCurrentApp(null);
      }}
      className="absolute left-0 right-0 h-7 flex items-center justify-center cursor-pointer group z-40"
      style={{ bottom: isNative ? 'calc(env(safe-area-inset-bottom) * 0.35 + 4px)' : 6 }}
      onContextMenu={(e) => { e.preventDefault(); setSiriOpen(true); }}
      title="Home Bar"
    >
      <div className="w-34 h-1 bg-white/70 group-hover:bg-white rounded-full transition-all group-active:w-28" />
    </div>

    {/* CONTROL CENTER OVERLAY */}
    <ControlCenter
      isOpen={controlCenterOpen}
      onClose={() => setControlCenterOpen(false)}
      brightness={brightness}
      setBrightness={setBrightness}
      volume={volume}
      setVolume={setVolume}
      wifiEnabled={wifiEnabled}
      setWifiEnabled={setWifiEnabled}
      bluetoothEnabled={bluetoothEnabled}
      setBluetoothEnabled={setBluetoothEnabled}
      airplaneMode={airplaneMode}
      setAirplaneMode={setAirplaneMode}
      flashlightOn={flashlightOn}
      setFlashlightOn={setFlashlightOn}
      lowPowerMode={lowPowerMode}
      setLowPowerMode={setLowPowerMode}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      onOpenApp={(appId) => {
        setIsLocked(false);
        setCurrentApp(appId);
      }}
      isMusicPlaying={isMusicPlaying}
      onToggleMusic={handleToggleMusic}
      currentTrackTitle={currentTrackTitle}
      soundEnabled={soundEnabled}
      language={language}
    />

    {/* SIRI / ALI INTELLIGENCE OVERLAY */}
    <SiriOverlay
      isOpen={siriOpen}
      onClose={() => setSiriOpen(false)}
      onExecuteAction={handleExecuteAction}
      soundEnabled={soundEnabled}
      phoneContext={{
        productsCount: products.length,
        installedAppsCount: installedApps.length,
        titaniumFinish,
        brightness,
        isLocked,
        currentApp,
        language,
      }}
    />
  </div>
  );

  // NATIVE MODE: real phone or installed PWA -> the OS fills the whole screen, no chassis
  if (isNative) {
    return (
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="fixed inset-0 bg-black text-white overflow-hidden"
        style={{ filter: `brightness(${brightness}%)` }}
      >
        {screenContent}
        <InstallPrompt
          variant="banner"
          canInstall={pwa.canInstall}
          installed={pwa.installed}
          iosManual={pwa.iosManual}
          onInstall={pwa.install}
        />
      </div>
    );
  }

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none overflow-x-hidden"
    >
      {/* Studio Header Bar */}
      <header className="h-14 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-black text-xs shadow-md shadow-amber-500/20">
            ALI
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>ALI phone · iPhone 16 Pro Max</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                A18 Pro · 1TB Titanium
              </span>
            </h1>
          </div>
        </div>

        {/* Quick Toolbar for Languages, Titanium Finishes & View */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Language Selector (مثل تنظیمات آیفون) */}
          <div className="flex items-center gap-1 p-1 bg-neutral-800/80 rounded-xl border border-neutral-700/60 text-xs">
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  setLanguage(l.code);
                  if (l.code === 'fa') {
                    setCalendarType('persian');
                    setNumberSystem('persian');
                    setRegion('IR');
                  } else if (l.code === 'ar') {
                    setCalendarType('islamic');
                    setNumberSystem('arabic');
                    setRegion('AE');
                  } else {
                    setCalendarType('gregorian');
                    setNumberSystem('latin');
                  }
                }}
                className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  language === l.code
                    ? 'bg-neutral-900 text-blue-400 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title={l.englishName}
              >
                <span>{l.flag}</span>
                <span className="hidden md:inline">{l.nativeName}</span>
              </button>
            ))}
          </div>

          {/* Quick Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-500" />
            )}
          </button>

          <InstallPrompt
            variant="button"
            canInstall={pwa.canInstall}
            installed={pwa.installed}
            iosManual={false}
            onInstall={pwa.install}
          />

          {/* Simulate Call Button */}
          <button
            onClick={() => handleStartCall('مهندس علی', '09120000000')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5"
            title="Simulate Call"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {language === 'fa' ? 'شبیه‌ساز تماس' : 'Call'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-6 flex flex-col lg:flex-row items-center justify-center gap-8 overflow-y-auto">
        {/* LEFT / CENTER: THE ULTRA-REALISTIC IPHONE 16 PRO MAX */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <IPhoneChassis
            finish={titaniumFinish}
            onPowerClick={handlePowerClick}
            onPowerLongPress={handlePowerLongPress}
            onActionButtonClick={handleActionButton}
            onCameraControlClick={handleCameraControl}
            onVolumeUp={() => {
              setVolume((v) => Math.min(100, v + 10));
              soundEffects.click(soundEnabled);
            }}
            onVolumeDown={() => {
              setVolume((v) => Math.max(0, v - 10));
              soundEffects.click(soundEnabled);
            }}
            soundEnabled={soundEnabled}
            brightness={brightness}
            flashlightOn={flashlightOn}
          >
            {screenContent}
          </IPhoneChassis>

          {/* Quick Hardware hints */}
          <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Camera Control</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Action Button</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Google Play APK Bridge</span>
            </span>
          </div>
        </div>

        {/* RIGHT DESKTOP SIDEBAR: PRODUCT ECOSYSTEM & APK / BACKUP MANAGER */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          {/* Card 1: ALI Phone Specs & Status */}
          <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {language === 'fa' ? 'مشخصات گوشی شبیه‌سازی‌شده' : 'ALI Phone Specifications'}
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">ONLINE</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/40">
                <p className="text-[10px] text-neutral-400">{t('set_model_name', language)}</p>
                <p className="font-semibold text-white mt-0.5">iPhone 16 Pro Max</p>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/40">
                <p className="text-[10px] text-neutral-400">Name</p>
                <p className="font-semibold text-amber-400 mt-0.5">ALI phone</p>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/40">
                <p className="text-[10px] text-neutral-400">{t('set_processor', language)}</p>
                <p className="font-semibold text-purple-400 mt-0.5">Apple A18 Pro (3nm)</p>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/40">
                <p className="text-[10px] text-neutral-400">{t('set_storage', language)}</p>
                <p className="font-semibold text-white mt-0.5 font-mono">1 TB NVMe</p>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {language === 'fa'
                ? 'پشتیبانی کامل از فرمت APK و فروشگاه Google Play، پشتیبان‌گیری و بازیابی داده‌ها، چندزبانه واقعی مثل تنظیمات آیفون.'
                : 'Full support for APK package format, Google Play Store bridge, full backups & restore, and true multi-language iOS settings.'}
            </p>
          </div>

          {/* Card 2: Quick App Launchers */}
          <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>
                {language === 'fa' ? 'دسترسی سریع به ابزارها و پلی‌استور' : 'Quick Launchers & Store'}
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setIsLocked(false);
                  setCurrentApp('googleplay');
                }}
                className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold text-start flex items-center justify-between"
              >
                <span>📦 {t('googleplay', language)}</span>
                <span className="text-[10px] opacity-70">APK ↵</span>
              </button>

              <button
                onClick={() => {
                  setIsLocked(false);
                  setCurrentApp('products');
                }}
                className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-start flex items-center justify-between"
              >
                <span>🛒 {t('products', language)} ({products.length})</span>
                <span className="text-[10px] opacity-70">↵</span>
              </button>

              <button
                onClick={() => {
                  setIsLocked(false);
                  setCurrentApp('appstore');
                }}
                className="p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold text-start flex items-center justify-between"
              >
                <span>🚀 {t('appstore', language)}</span>
                <span className="text-[10px] opacity-70">↵</span>
              </button>

              <button
                onClick={() => setSiriOpen(true)}
                className="p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold text-start flex items-center justify-between"
              >
                <span>✨ ALI AI</span>
                <span className="text-[10px] opacity-70">Chat</span>
              </button>
            </div>
          </div>

          {/* Card 3: Titanium Finishes */}
          <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-sky-400" />
              <span>{t('set_hardware_color', language)}</span>
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {(['desert', 'black', 'natural', 'white'] as TitaniumFinish[]).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    setTitaniumFinish(f);
                  }}
                  className={`p-2 rounded-2xl border text-center transition-all ${
                    titaniumFinish === f
                      ? 'border-amber-400 bg-white/10 font-bold'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full mx-auto mb-1 border border-white/20 ${
                      f === 'desert'
                        ? 'bg-[#B48860]'
                        : f === 'black'
                        ? 'bg-[#383735]'
                        : f === 'natural'
                        ? 'bg-[#98928A]'
                        : 'bg-[#E5E5EA]'
                    }`}
                  />
                  <span className="text-[10px] block truncate">
                    {f === 'desert' ? 'Desert' : f === 'black' ? 'Black' : f === 'natural' ? 'Natural' : 'White'}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-neutral-400">
              <button
                onClick={handlePowerClick}
                className="flex items-center gap-1.5 hover:text-white"
              >
                {isLocked ? (
                  <Unlock className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-400" />
                )}
                <span>{isLocked ? 'Unlock Phone' : 'Lock Phone'}</span>
              </button>

              <button
                onClick={() => setControlCenterOpen(true)}
                className="text-blue-400 hover:underline"
              >
                Control Center
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
