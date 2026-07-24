import React, { useState } from 'react';
import { InventoryItem, NoteEntry } from '../types';
import { Package, FileText, GlassWater, BatteryCharging, Pill, Radio, X, Sparkles } from 'lucide-react';

interface InventoryModalProps {
  inventory: InventoryItem[];
  notes: NoteEntry[];
  onClose: () => void;
  onUseItem: (itemType: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  inventory,
  notes,
  onClose,
  onUseItem,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'notes'>('items');
  const [selectedNote, setSelectedNote] = useState<NoteEntry | null>(notes[0] || null);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'almond_water': return <GlassWater className="w-6 h-6 text-blue-400" />;
      case 'battery': return <BatteryCharging className="w-6 h-6 text-amber-400" />;
      case 'sanity_pills': return <Pill className="w-6 h-6 text-emerald-400" />;
      case 'motion_tracker': return <Radio className="w-6 h-6 text-emerald-300" />;
      default: return <Package className="w-6 h-6 text-yellow-400" />;
    }
  };

  return (
    <div id="inventory-modal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-yellow-400 font-mono font-bold text-base">
            <Package className="w-5 h-5" />
            <span>MOCHILA DE SUPERVIVENCIA</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/50">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-3 text-xs font-mono font-bold tracking-wider transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'items'
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>OBJETOS Y SUMINISTROS</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-3 text-xs font-mono font-bold tracking-wider transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'notes'
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>REGISTROS Y NOTAS ({notes.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'items' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                      {getItemIcon(item.type)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className="text-xs font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                          x{item.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <button
                    disabled={item.quantity <= 0}
                    onClick={() => onUseItem(item.type)}
                    className="mt-4 w-full py-2 bg-yellow-600/20 hover:bg-yellow-600/30 disabled:opacity-30 disabled:cursor-not-allowed border border-yellow-500/50 text-yellow-300 text-xs font-mono font-bold rounded-lg transition-colors"
                  >
                    USAR / CONSUMIR
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[300px]">
              {/* Notes List */}
              <div className="space-y-2 border-r border-neutral-800 pr-3">
                {notes.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-mono">No has encontrado notas en las paredes.</p>
                ) : (
                  notes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${
                        selectedNote?.id === note.id
                          ? 'bg-yellow-500/20 border-yellow-500/80 text-yellow-300 font-semibold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <div className="font-mono truncate">{note.title}</div>
                      <div className="text-[10px] text-neutral-500">{note.timestamp}</div>
                    </button>
                  ))
                )}
              </div>

              {/* Note Content Reader */}
              <div className="md:col-span-2 bg-amber-950/20 p-5 rounded-xl border border-amber-800/40 text-amber-100/90 font-serif leading-relaxed text-sm flex flex-col justify-between">
                {selectedNote ? (
                  <div>
                    <div className="text-xs font-mono text-yellow-500 mb-2 uppercase tracking-widest border-b border-amber-800/30 pb-2">
                      {selectedNote.title}
                    </div>
                    <p className="italic text-amber-200/90 mb-4 whitespace-pre-wrap">{selectedNote.content}</p>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500 font-mono my-auto text-center">
                    Selecciona una nota para leer.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
