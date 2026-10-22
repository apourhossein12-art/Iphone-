import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Navigation,
  Layers,
  MapPin,
  Compass,
  Plus,
  Minus,
  RotateCcw,
  Coffee,
  Fuel,
  Utensils,
  Hotel,
  Cross,
  Car,
  Bike,
  Footprints,
  Share2,
  Bookmark,
  Check,
  AlertCircle,
} from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapsAppProps {
  soundEnabled: boolean;
}

interface PlacePreset {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  desc: string;
}

const PRESET_LOCATIONS: PlacePreset[] = [
  { name: 'تهران (برج میلاد)', nameEn: 'Tehran - Milad Tower', lat: 35.7448, lng: 51.3753, desc: 'پایتخت ایران، نماد برج میلاد' },
  { name: 'اصفهان (میدان نقش جهان)', nameEn: 'Isfahan - Naqsh-e Jahan', lat: 32.6577, lng: 51.6776, desc: 'آثار تاریخی و معماری صفوی' },
  { name: 'شیراز (حافظیه و تخت جمشید)', nameEn: 'Shiraz', lat: 29.6268, lng: 52.5593, desc: 'پایتخت فرهنگی و شعر ایران' },
  { name: 'مشهد (حرم مطهر)', nameEn: 'Mashhad', lat: 36.2878, lng: 59.6158, desc: 'دومین کلان‌شهر ایران' },
  { name: 'تبریز (ائل گلی)', nameEn: 'Tabriz', lat: 38.0800, lng: 46.2919, desc: 'شهر کهن و تاریخی شمال غرب' },
  { name: 'کیش (خلیج فارس)', nameEn: 'Kish Island', lat: 26.5325, lng: 53.9875, desc: 'جزیره مرجانی خلیج فارس' },
  { name: 'دبی (برج خلیفه)', nameEn: 'Dubai - Burj Khalifa', lat: 25.1972, lng: 55.2744, desc: 'امارات متحده عربی' },
  { name: 'استانبول (میدان تکسیم)', nameEn: 'Istanbul - Taksim', lat: 41.0369, lng: 28.9850, desc: 'ترکیه، پیوند آسیا و اروپا' },
  { name: 'پاریس (برج ایفل)', nameEn: 'Paris - Eiffel Tower', lat: 48.8584, lng: 2.2945, desc: 'فرانسه' },
  { name: 'لندن (بیگ بن)', nameEn: 'London - Big Ben', lat: 51.5007, lng: -0.1246, desc: 'بریتانیا' },
];

export const MapsApp: React.FC<MapsAppProps> = ({ soundEnabled }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 35.7448,
    lng: 51.3753, // Tehran
  });
  const [zoomLevel, setZoomLevel] = useState(13);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');
  const [activePoiFilter, setActivePoiFilter] = useState<string | null>(null);

  // Routing State
  const [isRoutingOpen, setIsRoutingOpen] = useState(false);
  const [routeOrigin, setRouteOrigin] = useState('تهران، میدان آزادی');
  const [routeDest, setRouteDest] = useState('تهران، برج میلاد');
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(11.4);
  const [routeDurationMins, setRouteDurationMins] = useState<number | null>(18);
  const [routeTravelMode, setRouteTravelMode] = useState<'car' | 'bike' | 'walk'>('car');

  // Fix Leaflet Default Marker Icons
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentCoords.lat, currentCoords.lng],
      zoom: zoomLevel,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;
    markerGroupRef.current = L.layerGroup().addTo(map);

    // Initial Tile Layer
    updateTileLayer('streets');

    // Add main initial marker
    addCustomMarker(currentCoords.lat, currentCoords.lng, 'موقعیت جاری: تهران', 'برج میلاد - پایتخت');

    map.on('moveend', () => {
      const center = map.getCenter();
      setCurrentCoords({ lat: center.lat, lng: center.lng });
      setZoomLevel(map.getZoom());
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer
  const updateTileLayer = (layerType: 'streets' | 'satellite' | 'terrain') => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (layerType === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
      }).addTo(map);
    } else if (layerType === 'terrain') {
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
    }
  };

  const handleSwitchLayer = (type: 'streets' | 'satellite' | 'terrain') => {
    soundEffects.click(soundEnabled);
    setMapLayer(type);
    updateTileLayer(type);
  };

  const addCustomMarker = (lat: number, lng: number, title: string, subtitle?: string) => {
    if (!markerGroupRef.current) return;
    markerGroupRef.current.clearLayers();

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:28px;height:28px;background:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px rgba(239,68,68,0.5);border:2px solid #fff;">
            📍
          </div>
          <div style="background:#000;color:#fff;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:bold;margin-top:2px;white-space:nowrap;border:1px solid #333;">
            ${title}
          </div>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    });

    const marker = L.marker([lat, lng], { icon: customIcon });
    if (subtitle) {
      marker.bindPopup(`<b style="color:#000;">${title}</b><br/><span style="color:#666;font-size:11px;">${subtitle}</span>`);
    }
    markerGroupRef.current.addLayer(marker);
  };

  // Real GPS Geolocation
  const handleLocateMe = () => {
    soundEffects.click(soundEnabled);
    setIsLocating(true);
    setLocationNotice('در حال دریافت موقعیت مکانی GPS ماهواره‌ای...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setIsLocating(false);
          setCurrentCoords({ lat, lng });

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.5 });
          }
          addCustomMarker(lat, lng, 'موقعیت دقیق شما (GPS)', `دقت: ±${Math.round(pos.coords.accuracy)} متر`);
          soundEffects.notification(soundEnabled);
          setLocationNotice(`موقعیت مکانی شما با موفقیت دریافت شد (عرض: ${lat.toFixed(4)}, طول: ${lng.toFixed(4)})`);
          setTimeout(() => setLocationNotice(''), 4000);
        },
        (err) => {
          setIsLocating(false);
          // Fallback to Tehran center
          const lat = 35.6892;
          const lng = 51.3890;
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1 });
          }
          addCustomMarker(lat, lng, 'تهران، میدان آزادی', 'پایتخت ایران');
          setLocationNotice('دسترسی به GPS مسدود شد. به موقعیت پیش‌فرض هدایت شدید.');
          setTimeout(() => setLocationNotice(''), 4000);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      setLocationNotice('مرورگر از GPS پشتیبانی نمی‌کند.');
      setTimeout(() => setLocationNotice(''), 3000);
    }
  };

  // Fly to Preset Location
  const handleSelectPreset = (place: PlacePreset) => {
    soundEffects.click(soundEnabled);
    setCurrentCoords({ lat: place.lat, lng: place.lng });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.lat, place.lng], 14, { duration: 1.2 });
    }
    addCustomMarker(place.lat, place.lng, place.name, place.desc);
    setLocationNotice(`انتقال به ${place.name}`);
    setTimeout(() => setLocationNotice(''), 3000);
  };

  // Search Online Address
  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    soundEffects.click(soundEnabled);

    // Check if matches preset
    const match = PRESET_LOCATIONS.find((p) =>
      p.name.includes(searchQuery.trim()) || p.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (match) {
      handleSelectPreset(match);
      setSearchQuery('');
      return;
    }

    try {
      setLocationNotice(`در حال جستجوی "${searchQuery}" در نقشه...`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const top = data[0];
        const lat = parseFloat(top.lat);
        const lng = parseFloat(top.lon);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
        }
        addCustomMarker(lat, lng, top.display_name.split(',')[0], top.display_name);
        setLocationNotice(`مکان پیدا شد: ${top.display_name.split(',')[0]}`);
        setSearchQuery('');
        setTimeout(() => setLocationNotice(''), 4000);
      } else {
        setLocationNotice('مکانی با این نام پیدا نشد.');
        setTimeout(() => setLocationNotice(''), 3000);
      }
    } catch {
      setLocationNotice('خطا در اتصال به سرویس جستجوی نقشه');
      setTimeout(() => setLocationNotice(''), 3000);
    }
  };

  // Filter POIs
  const handleFilterPoi = (category: string) => {
    soundEffects.click(soundEnabled);
    setActivePoiFilter(activePoiFilter === category ? null : category);

    if (!mapInstanceRef.current || !markerGroupRef.current) return;
    const center = mapInstanceRef.current.getCenter();

    // Generate simulated nearby POIs
    const pois = [
      { name: `${category} ۱ - نزدیک شما`, offsetLat: 0.005, offsetLng: 0.004 },
      { name: `${category} ۲ - بلوار اصلی`, offsetLat: -0.004, offsetLng: 0.006 },
      { name: `${category} ۳ - مرکز شهر`, offsetLat: 0.006, offsetLng: -0.005 },
    ];

    markerGroupRef.current.clearLayers();
    // Add current center
    addCustomMarker(center.lat, center.lng, 'موقعیت شما');

    pois.forEach((poi) => {
      const pLat = center.lat + poi.offsetLat;
      const pLng = center.lng + poi.offsetLng;

      const poiIcon = L.divIcon({
        className: 'custom-poi-pin',
        html: `
          <div style="background:#2563eb;color:#fff;padding:3px 7px;border-radius:12px;font-size:10px;font-weight:bold;box-shadow:0 3px 8px rgba(37,99,235,0.6);border:2px solid #fff;white-space:nowrap;">
            ⭐ ${poi.name}
          </div>
        `,
        iconSize: [80, 26],
      });

      const m = L.marker([pLat, pLng], { icon: poiIcon });
      m.bindPopup(`<b>${poi.name}</b><br/>فاصله: حدود ۷۰۰ متر`);
      markerGroupRef.current?.addLayer(m);
    });

    setLocationNotice(`نمایش ۳ نقطه برای ${category}`);
    setTimeout(() => setLocationNotice(''), 3500);
  };

  // Zoom controls
  const handleZoomIn = () => {
    soundEffects.click(soundEnabled);
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    soundEffects.click(soundEnabled);
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  // Calculate simulated route
  const handleCalculateRoute = () => {
    soundEffects.click(soundEnabled);
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Draw realistic route polyline
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
    }

    const c = map.getCenter();
    const waypoints: L.LatLngExpression[] = [
      [c.lat - 0.015, c.lng - 0.012],
      [c.lat - 0.008, c.lng - 0.004],
      [c.lat, c.lng],
      [c.lat + 0.009, c.lng + 0.007],
      [c.lat + 0.018, c.lng + 0.015],
    ];

    const poly = L.polyline(waypoints, {
      color: '#3b82f6',
      weight: 5,
      opacity: 0.85,
      dashArray: '1, 8',
    }).addTo(map);

    routeLineRef.current = poly;
    map.fitBounds(poly.getBounds(), { padding: [40, 40] });

    soundEffects.notification(soundEnabled);
    setLocationNotice('مسیر بهینه محاسبه شد (فاصله ۱۱.۴ کیلومتر - زمان ۱۸ دقیقه)');
    setTimeout(() => setLocationNotice(''), 4000);
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white select-none relative overflow-hidden">
      {/* Top Search Bar (Apple Maps & Google Maps blend) */}
      <div className="pt-13 px-4 pb-2 z-20 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 space-y-2">
        <form onSubmit={handleSearchAddress} className="relative flex items-center">
          <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی مکان، شهر، خیابان در نقشه گوگل..."
            className="w-full bg-neutral-900 border border-neutral-700/80 rounded-2xl pr-9 pl-10 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleLocateMe}
            className={`absolute left-2.5 top-1/2 -translate-y-1/2 p-1 rounded-xl transition-colors ${
              isLocating ? 'bg-blue-600 text-white animate-spin' : 'bg-neutral-800 text-blue-400 hover:bg-neutral-700'
            }`}
            title="موقعیت فعلی من (GPS)"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
          </button>
        </form>

        {/* Quick City Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
          {PRESET_LOCATIONS.slice(0, 6).map((p) => (
            <button
              key={p.name}
              onClick={() => handleSelectPreset(p)}
              className="px-2.5 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-medium whitespace-nowrap active:scale-95 transition-all"
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Status Notice */}
      {locationNotice && (
        <div className="absolute top-28 left-4 right-4 z-30 p-2.5 rounded-2xl bg-neutral-900/90 border border-blue-500/40 text-blue-300 text-xs flex items-center gap-2 shadow-2xl backdrop-blur-md animate-fadeIn">
          <Check className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="truncate">{locationNotice}</span>
        </div>
      )}

      {/* Interactive Map Viewport */}
      <div className="flex-1 relative w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Right Floating Controls: Layers, Zoom, Compass */}
        <div className="absolute right-3 top-4 z-20 flex flex-col gap-2">
          {/* Layer switcher */}
          <div className="p-1 rounded-2xl bg-neutral-950/90 border border-neutral-800 shadow-xl backdrop-blur-md flex flex-col gap-1">
            <button
              onClick={() => handleSwitchLayer('streets')}
              className={`p-2 rounded-xl transition-colors ${
                mapLayer === 'streets' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="نقشه استاندارد (Streets)"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSwitchLayer('satellite')}
              className={`p-2 rounded-xl transition-colors ${
                mapLayer === 'satellite' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="تصویر ماهواره‌ای واقعی (Satellite)"
            >
              <span className="text-[10px] font-bold">SAT</span>
            </button>
            <button
              onClick={() => handleSwitchLayer('terrain')}
              className={`p-2 rounded-xl transition-colors ${
                mapLayer === 'terrain' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="توپوگرافی و عوارض زمین (Terrain)"
            >
              <span className="text-[10px] font-bold">TER</span>
            </button>
          </div>

          {/* Zoom In / Out */}
          <div className="p-1 rounded-2xl bg-neutral-950/90 border border-neutral-800 shadow-xl backdrop-blur-md flex flex-col gap-1">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl text-neutral-300 hover:bg-neutral-800"
              title="بزرگ‌نمایی"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl text-neutral-300 hover:bg-neutral-800"
              title="کوچک‌نمایی"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Locate Me Button */}
          <button
            onClick={handleLocateMe}
            className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-xl active:scale-95 transition-all"
            title="موقعیت GPS من"
          >
            <Navigation className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Left Floating Directions Toggle */}
        <div className="absolute left-3 top-4 z-20">
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setIsRoutingOpen(!isRoutingOpen);
            }}
            className="px-3 py-2 rounded-2xl bg-neutral-950/90 border border-neutral-800 text-xs font-bold text-white shadow-xl backdrop-blur-md flex items-center gap-1.5 hover:border-blue-500 transition-colors"
          >
            <Car className="w-3.5 h-3.5 text-blue-400" />
            <span>مسیریابی</span>
          </button>
        </div>

        {/* POI Quick Filter Category Bar (Bottom overlay) */}
        <div className="absolute bottom-4 left-3 right-3 z-20 flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-neutral-950/90 border border-neutral-800 backdrop-blur-md shadow-2xl text-[11px]">
          <button
            onClick={() => handleFilterPoi('پمپ بنزین')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
              activePoiFilter === 'پمپ بنزین' ? 'bg-amber-600 text-white font-bold' : 'bg-neutral-900 text-neutral-300'
            }`}
          >
            <Fuel className="w-3.5 h-3.5 text-amber-400" />
            <span>پمپ بنزین</span>
          </button>

          <button
            onClick={() => handleFilterPoi('رستوران')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
              activePoiFilter === 'رستوران' ? 'bg-rose-600 text-white font-bold' : 'bg-neutral-900 text-neutral-300'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-rose-400" />
            <span>رستوران</span>
          </button>

          <button
            onClick={() => handleFilterPoi('کافی‌شاپ')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
              activePoiFilter === 'کافی‌شاپ' ? 'bg-amber-700 text-white font-bold' : 'bg-neutral-900 text-neutral-300'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-300" />
            <span>کافه</span>
          </button>

          <button
            onClick={() => handleFilterPoi('بیمارستان')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
              activePoiFilter === 'بیمارستان' ? 'bg-emerald-600 text-white font-bold' : 'bg-neutral-900 text-neutral-300'
            }`}
          >
            <Cross className="w-3.5 h-3.5 text-emerald-400" />
            <span>درمانگاه</span>
          </button>

          <button
            onClick={() => handleFilterPoi('هتل')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
              activePoiFilter === 'هتل' ? 'bg-purple-600 text-white font-bold' : 'bg-neutral-900 text-neutral-300'
            }`}
          >
            <Hotel className="w-3.5 h-3.5 text-purple-400" />
            <span>هتل</span>
          </button>
        </div>

        {/* Routing Modal Drawer */}
        {isRoutingOpen && (
          <div className="absolute top-16 left-3 right-3 z-30 p-3.5 rounded-3xl bg-neutral-900/95 border border-neutral-800 shadow-2xl backdrop-blur-md space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>مسیریابی هوشمند بین دو نقطه</span>
              </span>
              <button
                onClick={() => setIsRoutingOpen(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                بستن
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 bg-neutral-800/80 px-2.5 py-1.5 rounded-xl border border-neutral-700/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <input
                  type="text"
                  value={routeOrigin}
                  onChange={(e) => setRouteOrigin(e.target.value)}
                  className="bg-transparent text-white focus:outline-none flex-1 text-xs"
                  placeholder="مبدأ..."
                />
              </div>

              <div className="flex items-center gap-2 bg-neutral-800/80 px-2.5 py-1.5 rounded-xl border border-neutral-700/60">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <input
                  type="text"
                  value={routeDest}
                  onChange={(e) => setRouteDest(e.target.value)}
                  className="bg-transparent text-white focus:outline-none flex-1 text-xs"
                  placeholder="مقصد..."
                />
              </div>
            </div>

            {/* Travel Mode Chips */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 bg-neutral-800 p-0.5 rounded-xl text-xs">
                <button
                  onClick={() => setRouteTravelMode('car')}
                  className={`p-1.5 rounded-lg ${routeTravelMode === 'car' ? 'bg-blue-600 text-white' : 'text-neutral-400'}`}
                >
                  <Car className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRouteTravelMode('bike')}
                  className={`p-1.5 rounded-lg ${routeTravelMode === 'bike' ? 'bg-blue-600 text-white' : 'text-neutral-400'}`}
                >
                  <Bike className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRouteTravelMode('walk')}
                  className={`p-1.5 rounded-lg ${routeTravelMode === 'walk' ? 'bg-blue-600 text-white' : 'text-neutral-400'}`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleCalculateRoute}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
              >
                شروع مسیریابی
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
