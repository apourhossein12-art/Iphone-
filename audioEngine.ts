/* Real audio engine: HTMLAudioElement + Media Session + IndexedDB library.
   Built-in tracks are synthesized with Web Audio (works offline); users can import their own files. */

export interface Track { id: string; title: string; artist: string; url?: string; builtin: boolean }
export interface AudioState { playing: boolean; track: Track | null; tracks: Track[]; currentTime: number; duration: number; loading: boolean }

type Listener = (s: AudioState) => void;

const SR = 22050;
const note = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

const BUILTIN: { id: string; title: string; artist: string; root: number; chord: number[]; bpm: number; wave: OscillatorType }[] = [
  { id: 'b1', title: 'ALI Spatial Audio - Titanium Vibes', artist: 'Apple A18 Pro Studio', root: 57, chord: [0, 7, 12, 16], bpm: 84, wave: 'sine' },
  { id: 'b2', title: 'Persian Ambient Symphony', artist: 'Tehran Acoustic Ensemble', root: 50, chord: [0, 3, 7, 10], bpm: 66, wave: 'triangle' },
  { id: 'b3', title: 'Desert Titanium Chillwave', artist: 'Lo-Fi Cupertino', root: 53, chord: [0, 4, 7, 11], bpm: 96, wave: 'sawtooth' },
];

function wavBlob(buf: AudioBuffer): Blob {
  const data = buf.getChannelData(0);
  const out = new DataView(new ArrayBuffer(44 + data.length * 2));
  const w = (o: number, s: string) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); out.setUint32(4, 36 + data.length * 2, true); w(8, 'WAVEfmt ');
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true);
  out.setUint32(24, SR, true); out.setUint32(28, SR * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true);
  w(36, 'data'); out.setUint32(40, data.length * 2, true);
  for (let i = 0; i < data.length; i++) out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i])) * 0x7fff, true);
  return new Blob([out.buffer], { type: 'audio/wav' });
}

async function synth(def: (typeof BUILTIN)[number]): Promise<string> {
  const dur = 48;
  const ctx = new OfflineAudioContext(1, SR * dur, SR);
  const master = ctx.createGain();
  master.gain.value = 0.32;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = def.wave === 'sawtooth' ? 1400 : 3200;
  master.connect(lp); lp.connect(ctx.destination);
  const beat = 60 / def.bpm;
  const prog = [0, 5, 3, 7]; // chord roots per 4 beats
  const bars = Math.floor(dur / (beat * 4));
  for (let bar = 0; bar < bars; bar++) {
    const t0 = bar * beat * 4;
    const root = def.root + prog[bar % prog.length] - (prog[bar % prog.length] > 5 ? 12 : 0);
    // pad
    def.chord.forEach((iv, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = def.wave; o.frequency.value = note(root + iv); o.detune.value = (i - 1.5) * 6;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.16, t0 + beat * 1.2);
      g.gain.linearRampToValueAtTime(0, t0 + beat * 4.2);
      o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + beat * 4.3);
    });
    // arpeggio
    for (let k = 0; k < 8; k++) {
      const t = t0 + k * beat * 0.5;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = note(root + 12 + def.chord[k % def.chord.length]);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.9);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + beat);
    }
    // sub bass on the downbeat
    const b = ctx.createOscillator(); const bg = ctx.createGain();
    b.type = 'sine'; b.frequency.value = note(root - 12);
    bg.gain.setValueAtTime(0.0001, t0); bg.gain.exponentialRampToValueAtTime(0.3, t0 + 0.05);
    bg.gain.exponentialRampToValueAtTime(0.0001, t0 + beat * 3.6);
    b.connect(bg); bg.connect(master); b.start(t0); b.stop(t0 + beat * 3.7);
  }
  const rendered = await ctx.startRendering();
  return URL.createObjectURL(wavBlob(rendered));
}

/* ---- IndexedDB (imported songs) ---- */
const DB = 'aliphone-music';
const openDb = () => new Promise<IDBDatabase>((res, rej) => {
  const r = indexedDB.open(DB, 1);
  r.onupgradeneeded = () => r.result.createObjectStore('tracks', { keyPath: 'id' });
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
const dbAll = async (): Promise<any[]> => {
  try {
    const db = await openDb();
    return await new Promise((res) => { const q = db.transaction('tracks').objectStore('tracks').getAll(); q.onsuccess = () => res(q.result); q.onerror = () => res([]); });
  } catch { return []; }
};
const dbPut = async (row: any) => { try { const db = await openDb(); db.transaction('tracks', 'readwrite').objectStore('tracks').put(row); } catch {} };
const dbDel = async (id: string) => { try { const db = await openDb(); db.transaction('tracks', 'readwrite').objectStore('tracks').delete(id); } catch {} };

class AudioEngine {
  private audio = new Audio();
  private listeners = new Set<Listener>();
  private state: AudioState = { playing: false, track: null, tracks: BUILTIN.map((b) => ({ id: b.id, title: b.title, artist: b.artist, builtin: true })), currentTime: 0, duration: 0, loading: false };
  private ready: Promise<void>;

  constructor() {
    this.audio.preload = 'auto';
    this.audio.addEventListener('timeupdate', () => this.emit({ currentTime: this.audio.currentTime, duration: isFinite(this.audio.duration) ? this.audio.duration : 0 }));
    this.audio.addEventListener('play', () => this.emit({ playing: true }));
    this.audio.addEventListener('pause', () => this.emit({ playing: false }));
    this.audio.addEventListener('ended', () => this.next());
    this.audio.addEventListener('loadedmetadata', () => this.emit({ duration: this.audio.duration }));
    this.ready = this.loadLibrary();
    const ms = (navigator as any).mediaSession;
    if (ms) {
      ms.setActionHandler('play', () => this.toggle(true));
      ms.setActionHandler('pause', () => this.toggle(false));
      ms.setActionHandler('nexttrack', () => this.next());
      ms.setActionHandler('previoustrack', () => this.prev());
      ms.setActionHandler('seekto', (d: any) => this.seek(d.seekTime));
    }
  }

  private async loadLibrary() {
    const rows = await dbAll();
    const imported: Track[] = rows.map((r) => ({ id: r.id, title: r.title, artist: r.artist, url: URL.createObjectURL(r.blob), builtin: false }));
    this.emit({ tracks: [...this.state.tracks, ...imported] });
  }

  private emit(patch: Partial<AudioState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l(this.state));
  }
  subscribe(l: Listener) { this.listeners.add(l); l(this.state); return () => { this.listeners.delete(l); }; }
  getState() { return this.state; }
  setVolume(v: number) { this.audio.volume = Math.max(0, Math.min(1, v)); }
  seek(t: number) { if (isFinite(t)) this.audio.currentTime = t; }

  async play(id?: string) {
    await this.ready;
    const target = this.state.tracks.find((t) => t.id === id) ?? this.state.track ?? this.state.tracks[0];
    if (!target) return;
    if (this.state.track?.id === target.id && this.audio.src) { await this.audio.play().catch(() => {}); return; }
    this.emit({ track: target, loading: true, currentTime: 0 });
    let url = target.url;
    if (!url) {
      const def = BUILTIN.find((b) => b.id === target.id)!;
      url = await synth(def);
      target.url = url;
    }
    this.audio.src = url;
    this.emit({ loading: false });
    await this.audio.play().catch(() => {});
    const ms = (navigator as any).mediaSession;
    if (ms && 'MediaMetadata' in window) {
      ms.metadata = new (window as any).MediaMetadata({ title: target.title, artist: target.artist, artwork: [{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }] });
    }
  }
  toggle(force?: boolean) {
    const want = force ?? !this.state.playing;
    if (want) return this.play(); else this.audio.pause();
  }
  next() { this.step(1); }
  prev() { if (this.audio.currentTime > 3) this.seek(0); else this.step(-1); }
  private step(d: number) {
    const { tracks, track } = this.state;
    if (!tracks.length) return;
    const i = Math.max(0, tracks.findIndex((t) => t.id === track?.id));
    this.play(tracks[(i + d + tracks.length) % tracks.length].id);
  }
  async importFiles(files: FileList | File[]) {
    const added: Track[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('audio/') && !/\.(mp3|m4a|wav|ogg|flac|aac)$/i.test(f.name)) continue;
      const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const title = f.name.replace(/\.[^.]+$/, '');
      await dbPut({ id, title, artist: 'My Library', blob: f });
      added.push({ id, title, artist: 'My Library', url: URL.createObjectURL(f), builtin: false });
    }
    if (added.length) this.emit({ tracks: [...this.state.tracks, ...added] });
  }
  async remove(id: string) {
    if (this.state.track?.id === id) { this.audio.pause(); this.audio.removeAttribute('src'); this.emit({ track: null, playing: false }); }
    await dbDel(id);
    this.emit({ tracks: this.state.tracks.filter((t) => t.id !== id) });
  }
}

export const audioEngine = new AudioEngine();
