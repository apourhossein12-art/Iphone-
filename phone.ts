export type TitaniumFinish = 'desert' | 'black' | 'natural' | 'white';
export type AppLanguage = 'fa' | 'en' | 'ar' | 'de' | 'fr' | 'tr';
export type AppRegion = 'IR' | 'US' | 'AE' | 'DE' | 'FR' | 'TR';
export type CalendarType = 'persian' | 'gregorian' | 'islamic';
export type NumberSystem = 'persian' | 'latin' | 'arabic';

export type AppId =
  | 'phone'
  | 'messages'
  | 'safari'
  | 'camera'
  | 'photos'
  | 'appstore'
  | 'googleplay'
  | 'cloud_android'
  | 'terminal'
  | 'calendar'
  | 'maps'
  | 'products'
  | 'notes'
  | 'calculator'
  | 'music'
  | 'weather'
  | 'clock'
  | 'settings'
  | string; // for custom installed apps

export interface ApkPackage {
  id: string;
  packageName: string;
  appName: string;
  versionName: string;
  sizeMb: number;
  icon: string;
  category: string;
  rating: number;
  downloads: string;
  description: string;
  permissions: string[];
  isInstalled?: boolean;
  apkBlobUrl?: string;
  fileName?: string;
}

export interface BackupData {
  backupId: string;
  backupDate: string;
  deviceName: string;
  osVersion: string;
  apps: CustomApp[];
  products: ProductItem[];
  notes: NoteItem[];
  apks: ApkPackage[];
  settings: {
    language: AppLanguage;
    region: AppRegion;
    titaniumFinish: TitaniumFinish;
    wallpaperUrl: string;
    soundEnabled: boolean;
  };
}

export interface CustomApp {
  id: string;
  name: string;
  nameFa: string;
  iconName: string; // Lucide icon or emoji or image URL
  color: string;
  category: 'tools' | 'products' | 'finance' | 'utilities' | 'web';
  type: 'embed_url' | 'product_catalog' | 'markdown_tool' | 'custom_form' | 'calculator_tool';
  url?: string;
  data?: any;
  isPreinstalled?: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number; // in Toman or USD
  currency: 'تومان' | '$';
  stock: number;
  imageUrl?: string;
  description: string;
  status: 'active' | 'out_of_stock' | 'draft';
  sku?: string;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  folder: string;
  isPinned?: boolean;
}

export interface PhotoItem {
  id: string;
  url: string;
  title: string;
  date: string;
  isFavorite?: boolean;
  filter?: string;
}

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  avatarColor: string;
  isFavorite?: boolean;
}

export interface MessageItem {
  id: string;
  sender: 'user' | 'contact' | 'ali';
  text: string;
  timestamp: string;
}

export interface DynamicIslandState {
  type: 'idle' | 'music' | 'call' | 'timer' | 'flashlight' | 'charging' | 'assistant';
  title?: string;
  subtitle?: string;
  expanded?: boolean;
  progress?: number;
  remainingSeconds?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  location?: string;
  color: string;
  reminder?: string;
  notes?: string;
}
