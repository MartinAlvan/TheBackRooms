import React from 'react';
import { Play, BookOpen, Compass, Sparkles, Smartphone } from 'lucide-react';
import { BackroomsLevel } from '../types';
import { LEVEL_DEFINITIONS } from '../engine/LevelConfig';

interface IntroScreenProps {
  onStartGame: (initialLevel?: BackroomsLevel) => void;
  onOpenCodex: () => void;
  onOpenApk: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStartGame, onOpenCodex, onOpenApk }) => {
  return (
    <div id="intro-screen" className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4 select-none overflow-y-auto">
      {/* Background Image Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/30 via-black to-black opacity-90" />

      <div className="relative z-10 max-w-3xl w-full my-auto space-y-8 text-center p-6 sm:p-10 bg-neutral-950/80 backdrop-blur-xl border border-yellow-600/30 rounded-3xl shadow-2xl">
        {/* Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GENERACIÓN PROCEDIMENTAL INFINITA</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 drop-shadow-md">
            THE BACKROOMS
          </h1>
          <p className="text-xs sm:text-sm font-mono text-yellow-500/80 tracking-widest uppercase">
            Descenso Infinito a los Espacios Liminales
          </p>
        </div>

        {/* Lore Quote */}
        <div className="p-4 bg-amber-950/20 border-l-4 border-yellow-500 text-left text-xs sm:text-sm font-serif italic text-amber-200/90 leading-relaxed rounded-r-xl">
          "Si no tienes cuidado y haces no-clip fuera de la realidad en los lugares equivocados, terminarás en The Backrooms, donde no hay nada más que el hedor a alfombra húmeda, la locura del amarillo monótono y el zumbido constante de las luces fluorescentes..."
        </div>

        {/* Level Quick Select */}
        <div className="space-y-3 text-left">
          <div className="text-xs font-mono text-yellow-400/90 font-bold tracking-wider uppercase flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            <span>SELECCIONAR NIVEL DE ENTRADA:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.values(LEVEL_DEFINITIONS).map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => onStartGame(lvl.id)}
                className="p-3 bg-neutral-900/90 hover:bg-yellow-500/20 border border-neutral-800 hover:border-yellow-500/60 rounded-xl text-left transition-all group"
              >
                <div className="text-xs font-mono text-yellow-400 font-bold group-hover:text-yellow-300">{lvl.name}</div>
                <div className="text-[11px] text-neutral-300 font-semibold truncate">{lvl.codeName}</div>
                <div className="text-[9px] font-mono text-red-400 mt-1">{lvl.dangerClass}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => onStartGame('level0')}
            className="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-mono font-black text-xs sm:text-sm tracking-wider rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>HACER NO-CLIP (NIVEL 0)</span>
          </button>

          <button
            onClick={onOpenCodex}
            className="w-full sm:w-auto px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-yellow-400 font-mono font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>GUÍA DE ENTIDADES</span>
          </button>

          <button
            onClick={onOpenApk}
            className="w-full sm:w-auto px-5 py-3.5 bg-amber-950/50 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-mono font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4 text-yellow-400" />
            <span>CONVERTIR A APK / APP</span>
          </button>
        </div>

        <div className="text-[10px] font-mono text-neutral-500 pt-2">
          Usa WASD o Pantalla Táctil para moverte • Pulsa F para Linterna • Pulsa E para Interactuar
        </div>
      </div>
    </div>
  );
};
