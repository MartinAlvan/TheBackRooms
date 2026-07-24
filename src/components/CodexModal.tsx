import React, { useState } from 'react';
import { LEVEL_DEFINITIONS } from '../engine/LevelConfig';
import { BookOpen, ShieldAlert, Skull, MapPin, X, Info } from 'lucide-react';

interface CodexModalProps {
  onClose: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'levels' | 'entities'>('levels');
  const [selectedLevelKey, setSelectedLevelKey] = useState<string>('level0');
  const [selectedEntityKey, setSelectedEntityKey] = useState<string>('bacteria');

  const entitiesLore = [
    {
      id: 'bacteria',
      name: 'Bacteria / Howler (La Entidad)',
      danger: 'Clase A - Muy Hostil',
      description: 'Una criatura alta compuesta por estructuras de alambre negro y distorsión espacial. Se desplaza en silencio cuando la miras directamente, pero se abalanza con chillidos desgarradores en cuanto te das la vuelta.',
      strategy: 'No dejes de vigilar tu espalda. Usa el Agua de Almendras para mantener la salud si sufres un ataque.',
    },
    {
      id: 'smiler',
      name: 'Smiler (Sonriente)',
      danger: 'Clase B - Peligro Mortal en la Oscuridad',
      description: 'Una cara compuesta por ojos brillantes y una sonrisa amplia repleta de dientes afilados que flota en la penumbra.',
      strategy: 'NO lo mires fijamente y NO enciendas la linterna frente a él. Apaga la luz y retrocede lentamente.',
    },
    {
      id: 'partygoer',
      name: 'Partygoer (=)',
      danger: 'Clase S - Sumamente Engañoso',
      description: 'Bípedos amarillos con máscaras sonrientes que sostienen globos rojos. Dejan falsos mensajes en las paredes atrayendo a supervivientes.',
      strategy: 'Si encuentras globos o notas que terminan con un signo de "=)", aléjate de inmediato.',
    },
    {
      id: 'skinstealer',
      name: 'Skin-Stealer (Ladrón de Piel)',
      danger: 'Clase A - Mimetismo Humano',
      description: 'Humanoides oscuros capaces de imitar la forma humana. Permanecen inmóviles en las sombras hasta que te aproximas a corta distancia.',
      strategy: 'Mantén activa la linterna y usa el Detector de Movimiento para detectar su presencia oculta.',
    },
  ];

  return (
    <div id="codex-modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-yellow-400 font-mono font-bold text-base">
            <BookOpen className="w-5 h-5" />
            <span>GUÍA DE SUPERVIVENCIA - ARCHIVOS M.E.G.</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/50">
          <button
            onClick={() => setActiveCategory('levels')}
            className={`flex-1 py-3 text-xs font-mono font-bold tracking-wider transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeCategory === 'levels'
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>NIVELES DOCUMENTADOS</span>
          </button>

          <button
            onClick={() => setActiveCategory('entities')}
            className={`flex-1 py-3 text-xs font-mono font-bold tracking-wider transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeCategory === 'entities'
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Skull className="w-4 h-4 text-red-400" />
            <span>ENTIDADES Y AMENAZAS</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeCategory === 'levels' ? (
            <>
              {/* Level List */}
              <div className="space-y-2 border-r border-neutral-800 pr-3">
                {Object.values(LEVEL_DEFINITIONS).map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevelKey(lvl.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedLevelKey === lvl.id
                        ? 'bg-yellow-500/20 border-yellow-500/80 text-yellow-300 font-semibold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="text-xs font-mono text-yellow-400/80">{lvl.name}</div>
                    <div className="text-sm font-semibold truncate">{lvl.codeName}</div>
                  </button>
                ))}
              </div>

              {/* Level Detail */}
              {(() => {
                const lvl = LEVEL_DEFINITIONS[selectedLevelKey as keyof typeof LEVEL_DEFINITIONS];
                return (
                  <div className="md:col-span-2 bg-neutral-950 p-5 rounded-2xl border border-neutral-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                        <div>
                          <span className="text-xs font-mono text-yellow-500 uppercase tracking-widest">{lvl.name}</span>
                          <h3 className="text-lg font-bold text-white mt-0.5">{lvl.codeName}</h3>
                        </div>
                        <span className="px-2.5 py-1 bg-red-950 border border-red-800 text-red-400 text-xs font-mono font-bold rounded-full">
                          {lvl.dangerClass}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-300 leading-relaxed mt-4">{lvl.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono text-neutral-400">
                      <span>Ambiente: <strong className="text-yellow-400 uppercase">{lvl.wallType}</strong></span>
                      <span>Entidades: <strong className="text-red-400">{lvl.hasEntities ? 'DETECTADAS' : 'NINGUNA'}</strong></span>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <>
              {/* Entities List */}
              <div className="space-y-2 border-r border-neutral-800 pr-3">
                {entitiesLore.map((ent) => (
                  <button
                    key={ent.id}
                    onClick={() => setSelectedEntityKey(ent.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedEntityKey === ent.id
                        ? 'bg-red-950/30 border-red-500/80 text-red-300 font-semibold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="text-sm font-semibold truncate">{ent.name}</div>
                    <div className="text-[10px] text-red-400 font-mono">{ent.danger}</div>
                  </button>
                ))}
              </div>

              {/* Entity Detail */}
              {(() => {
                const ent = entitiesLore.find((e) => e.id === selectedEntityKey)!;
                return (
                  <div className="md:col-span-2 bg-neutral-950 p-5 rounded-2xl border border-neutral-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                        <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5" />
                          <span>{ent.name}</span>
                        </h3>
                        <span className="text-xs font-mono text-red-400 bg-red-950/80 px-2.5 py-1 rounded-full border border-red-800">
                          {ent.danger}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-300 leading-relaxed mt-4">{ent.description}</p>

                      <div className="mt-4 p-3 bg-yellow-950/30 border border-yellow-600/40 rounded-xl text-yellow-200 text-xs">
                        <strong className="font-mono text-yellow-400 flex items-center gap-1 mb-1">
                          <Info className="w-3.5 h-3.5" />
                          ESTRATEGIA DE SUPERVIVENCIA:
                        </strong>
                        {ent.strategy}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
