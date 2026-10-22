import React, { useState } from 'react';
import { NoteItem } from '../../types/phone';
import { Plus, Search, Trash2, Pin, Folder, FileText, ChevronRight, Check } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface NotesAppProps {
  notes: NoteItem[];
  onAddNote: (note: NoteItem) => void;
  onUpdateNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
  soundEnabled: boolean;
}

export const NotesApp: React.FC<NotesAppProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  soundEnabled,
}) => {
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const filteredNotes = notes.filter(
    (n) => n.title.includes(searchQuery) || n.content.includes(searchQuery)
  );

  const handleOpenNote = (n: NoteItem) => {
    soundEffects.click(soundEnabled);
    setSelectedNote(n);
    setTitle(n.title);
    setContent(n.content);
  };

  const handleCreateNew = () => {
    soundEffects.click(soundEnabled);
    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      title: 'یادداشت جدید',
      content: '',
      updatedAt: 'همین الآن',
      folder: 'شخصی',
    };
    onAddNote(newNote);
    setSelectedNote(newNote);
    setTitle(newNote.title);
    setContent(newNote.content);
  };

  const handleSave = () => {
    if (!selectedNote) return;
    soundEffects.click(soundEnabled);
    onUpdateNote({
      ...selectedNote,
      title: title || 'بدون عنوان',
      content,
      updatedAt: 'همین الآن',
    });
    setSelectedNote(null);
  };

  if (selectedNote) {
    return (
      <div className="h-full flex flex-col bg-neutral-950 text-white select-none">
        {/* Editor Top Bar */}
        <div className="pt-13 px-4 pb-2 border-b border-neutral-800 flex items-center justify-between">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 text-xs text-amber-400 font-medium"
          >
            <ChevronRight className="w-4 h-4" />
            <span>یادداشت‌ها</span>
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold"
          >
            ذخیره
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 p-4 flex flex-col gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان یادداشت..."
            className="w-full bg-transparent text-lg font-bold text-white placeholder-neutral-500 focus:outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="نوشتن محتوای یادداشت، فرمول‌ها یا برنامه‌ریزی محصولات..."
            className="w-full flex-1 bg-transparent text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white select-none">
      {/* Top Header */}
      <div className="pt-14 px-5 pb-3 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">ALI iCloud Notes</span>
          <h1 className="text-xl font-bold tracking-tight text-white">یادداشت‌ها</h1>
        </div>
        <button
          onClick={handleCreateNew}
          className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg active:scale-95"
          title="یادداشت جدید"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-neutral-800">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در تمام یادداشت‌ها..."
            className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            onClick={() => handleOpenNote(note)}
            className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-colors space-y-1 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{note.title}</h4>
              <div className="flex items-center gap-1.5">
                {note.isPinned && <Pin className="w-3 h-3 text-amber-400" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEffects.click(soundEnabled);
                    onDeleteNote(note.id);
                  }}
                  className="p-1 text-neutral-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
              {note.content || 'بدون متن'}
            </p>
            <p className="text-[9px] text-neutral-500 pt-1 font-mono">{note.updatedAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
