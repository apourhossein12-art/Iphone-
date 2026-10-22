import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  Sliders,
  ChevronUp,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface CameraAppProps {
  onCapturePhoto: (photoUrl: string) => void;
  onOpenPhotos: () => void;
  lastCapturedUrl?: string;
  soundEnabled: boolean;
}

export const CameraApp: React.FC<CameraAppProps> = ({
  onCapturePhoto,
  onOpenPhotos,
  lastCapturedUrl,
  soundEnabled,
}) => {
  const [cameraMode, setCameraMode] = useState<'PHOTO' | 'PORTRAIT' | 'VIDEO' | 'CINEMATIC'>('PHOTO');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('auto');
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [flashTriggered, setFlashTriggered] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize webcam
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: isFrontCamera ? 'user' : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraPermissionGranted(true);
      } catch (err) {
        console.warn('Webcam permission not granted or unavailable, using simulation view', err);
        setCameraPermissionGranted(false);
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isFrontCamera]);

  // Video recording timer
  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleShutter = () => {
    soundEffects.cameraShutter(soundEnabled);
    soundEffects.haptic([20, 50, 20]);

    if (cameraMode === 'VIDEO' || cameraMode === 'CINEMATIC') {
      setIsRecording(!isRecording);
      return;
    }

    // Flash animation
    setFlashTriggered(true);
    setTimeout(() => setFlashTriggered(false), 150);

    // Capture image from video stream or canvas
    if (videoRef.current && canvasRef.current && cameraPermissionGranted) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (isFrontCamera) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapturePhoto(dataUrl);
        return;
      }
    }

    // High quality simulation capture
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 1080;
    fallbackCanvas.height = 1920;
    const ctx = fallbackCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(0.5, '#78350f');
      grad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('iPhone 16 Pro Max 48MP Fusion Shot', 540, 960);
      ctx.font = '32px sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`ALI Phone · ${cameraMode} · ${zoomLevel}x`, 540, 1020);

      const simUrl = fallbackCanvas.toDataURL('image/jpeg');
      onCapturePhoto(simUrl);
    }
  };

  const MODES: ('PHOTO' | 'PORTRAIT' | 'VIDEO' | 'CINEMATIC')[] = ['CINEMATIC', 'VIDEO', 'PHOTO', 'PORTRAIT'];

  return (
    <div className="h-full flex flex-col bg-black text-white select-none relative overflow-hidden">
      {/* Top Controls Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-12 px-5 pb-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            setFlashMode(flashMode === 'auto' ? 'on' : flashMode === 'on' ? 'off' : 'auto');
          }}
          className={`p-2 rounded-full backdrop-blur-md ${
            flashMode === 'on' ? 'bg-amber-400 text-black' : flashMode === 'auto' ? 'bg-white/20 text-amber-300' : 'bg-white/10 text-white'
          }`}
          title="فلاش"
        >
          {flashMode === 'off' ? <ZapOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
        </button>

        {isRecording ? (
          <div className="px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>
              {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:
              {(recordingSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-neutral-300 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
            4K · 60fps · ProRes
          </span>
        )}

        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            setIsFrontCamera(!isFrontCamera);
          }}
          className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 active:rotate-180 transition-transform"
          title="چرخش دوربین"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Viewfinder */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-neutral-950">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transition-transform duration-300 ${isFrontCamera ? 'scale-x-[-1]' : ''}`}
          style={{ transform: `scale(${zoomLevel})` }}
        />

        {/* Fallback Viewfinder if webcam not active */}
        {!cameraPermissionGranted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-black">
            <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-3">
              <Camera className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">دوربین آیفون ۱۶ پرو مکس</p>
            <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
              سنسور ۴۸ مگاپیکسلی Fusion با دیافراگم ƒ/1.78. برای استفاده از وبکم زنده اجازه دسترسی دهید یا با دکمه شاتر عکاسی کنید.
            </p>
          </div>
        )}

        {/* Shutter Flash visual effect */}
        {flashTriggered && (
          <div className="absolute inset-0 bg-white z-40 transition-opacity duration-150 opacity-100" />
        )}

        {/* Viewfinder Rule-of-Thirds Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-white/40">
            <div className="border border-white/20" />
            <div className="border border-white/20" />
            <div className="border border-white/20" />
            <div className="border border-white/20" />
            <div className="border border-white/20" />
            <div className="border border-white/20" />
            <div className="border border-white/20" />
            <div className="border border-white/20" />
            <div className="border border-white/20" />
          </div>
        </div>

        {/* Zoom Selector (0.5x, 1x, 2x, 5x Tetraprism) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          {[0.5, 1, 2, 5].map((z) => (
            <button
              key={z}
              onClick={() => {
                soundEffects.click(soundEnabled);
                setZoomLevel(z);
              }}
              className={`w-8 h-8 rounded-full text-[11px] font-bold font-mono transition-all ${
                zoomLevel === z ? 'bg-amber-400 text-black shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              {z === 0.5 ? '.5' : `${z}`}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Controls Panel */}
      <div className="pt-3 pb-8 px-6 bg-black z-30 flex flex-col gap-3">
        {/* Modes Carousel */}
        <div className="flex items-center justify-center gap-6 text-xs font-semibold overflow-x-auto no-scrollbar">
          {MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => {
                soundEffects.click(soundEnabled);
                setCameraMode(mode);
              }}
              className={`transition-colors whitespace-nowrap ${
                cameraMode === mode ? 'text-amber-400 font-bold scale-105' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {mode === 'PHOTO' ? 'عکس' : mode === 'PORTRAIT' ? 'پرتره' : mode === 'VIDEO' ? 'ویدیو' : 'سینماتیک'}
            </button>
          ))}
        </div>

        {/* Shutter row */}
        <div className="flex items-center justify-between px-2 pt-2">
          {/* Gallery Thumbnail */}
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              onOpenPhotos();
            }}
            className="w-12 h-12 rounded-xl border border-white/20 bg-neutral-900 overflow-hidden flex items-center justify-center shadow-md active:scale-90 transition-transform"
            title="گالری عکس‌ها"
          >
            {lastCapturedUrl ? (
              <img src={lastCapturedUrl} alt="Last captured" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-neutral-400" />
            )}
          </button>

          {/* Shutter Button */}
          <button
            onClick={handleShutter}
            className={`w-18 h-18 rounded-full border-4 flex items-center justify-center active:scale-95 transition-transform ${
              cameraMode === 'VIDEO' || cameraMode === 'CINEMATIC'
                ? 'border-white bg-black'
                : 'border-white bg-black'
            }`}
          >
            <div
              className={`transition-all ${
                cameraMode === 'VIDEO' || cameraMode === 'CINEMATIC'
                  ? isRecording
                    ? 'w-7 h-7 rounded-md bg-rose-600'
                    : 'w-14 h-14 rounded-full bg-rose-600'
                  : 'w-15 h-15 rounded-full bg-white hover:bg-neutral-200'
              }`}
            />
          </button>

          {/* Flip camera */}
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setIsFrontCamera(!isFrontCamera);
            }}
            className="w-12 h-12 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-white hover:bg-neutral-800 active:scale-90 transition-transform"
            title="چرخش دوربین"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
