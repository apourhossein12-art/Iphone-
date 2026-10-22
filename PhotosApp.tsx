import React, { useState } from 'react';
import { PhotoItem } from '../../types/phone';
import { Trash2, Heart, Share2, ZoomIn, ArrowRight, X, Sparkles } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface PhotosAppProps {
  photos: PhotoItem[];
  onDeletePhoto: (id: string) => void;
  soundEnabled: boolean;
}

export const PhotosApp: React.FC<PhotosAppProps> = ({
  photos,
  onDeletePhoto,
  soundEnabled,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'none' | 'sepia' | 'grayscale' | 'vibrant'>('none');

  const filterStyle = {
    none: '',
    sepia: 'sepia(0.6) contrast(1.1)',
    grayscale: 'grayscale(1)',
    vibrant: 'saturate(1.8) contrast(1.1)',
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white select-none">
      {/* Top Bar */}
      <div className="pt-14 px-5 pb-3 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase">Photo Library</span>
          <h1 className="text-xl font-bold tracking-tight text-white">گالری عکس‌های من</h1>
        </div>
        <span className="text-xs text-neutral-400">{photos.length} عکس</span>
      </div>

      {/* Grid of Photos */}
      <div className="flex-1 overflow-y-auto p-3">
        {photos.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 text-xs">
            <p>هنوز عکسی ثبت نشده است.</p>
            <p className="mt-1 text-neutral-400">از برنامه دوربین برای ثبت تصاویر با کیفیت استفاده کنید.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {photos.map((ph) => (
              <div
                key={ph.id}
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  setSelectedPhoto(ph);
                  setActiveFilter('none');
                }}
                className="aspect-square rounded-xl overflow-hidden bg-neutral-900 relative cursor-pointer group shadow-sm"
              >
                <img
                  src={ph.url}
                  alt={ph.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 pt-12 select-none animate-fadeIn">
          {/* Top action row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="p-2 rounded-full bg-neutral-900 text-neutral-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-xs text-neutral-300 font-medium truncate max-w-[200px]">
              {selectedPhoto.title}
            </span>
            <button
              onClick={() => {
                soundEffects.click(soundEnabled);
                onDeletePhoto(selectedPhoto.id);
                setSelectedPhoto(null);
              }}
              className="p-2 rounded-full bg-neutral-900 text-rose-400 hover:bg-rose-500/20"
              title="حذف"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Main Photo Display */}
          <div className="flex-1 flex items-center justify-center py-4 overflow-hidden">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              style={{ filter: filterStyle[activeFilter] }}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-all"
            />
          </div>

          {/* Bottom Filter Controls */}
          <div className="space-y-3 pb-4">
            <div className="flex items-center justify-center gap-2 text-xs">
              {(['none', 'vibrant', 'sepia', 'grayscale'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    setActiveFilter(f);
                  }}
                  className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                    activeFilter === f ? 'bg-amber-400 text-black font-bold' : 'bg-neutral-900 text-neutral-300'
                  }`}
                >
                  {f === 'none' ? 'اصلی' : f === 'vibrant' ? 'سرزنده' : f === 'sepia' ? 'گرم' : 'سیاه و سفید'}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center text-[11px] text-neutral-400 px-2">
              <span>{selectedPhoto.date}</span>
              <span className="font-mono">48MP · HEIF · ISO 64</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
