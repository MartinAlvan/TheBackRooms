import React from 'react';
import { Skull, RotateCcw, ShieldAlert, Award } from 'lucide-react';

interface GameOverModalProps {
  cause: string;
  distance: number;
  levelReachedName: string;
  onRetry: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  cause,
  distance,
  levelReachedName,
  onRetry,
}) => {
  return (
    <div id="gameover-modal" className="fixed inset-0 z-50 bg-red-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-neutral-950 border-2 border-red-600/80 w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Glowing Red Background Blur */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center">
          <div className="p-4 bg-red-900/40 rounded-full border border-red-500/60 animate-bounce">
            <Skull className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-mono font-black text-red-500 tracking-wider">
            TE HAS PERDIDO
          </h2>
          <p className="text-xs sm:text-sm font-mono text-neutral-400 italic leading-relaxed">
            "{cause}"
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-neutral-900/90 p-4 rounded-xl border border-neutral-800 space-y-3 text-left">
          <div className="text-xs font-mono text-yellow-500 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-800 pb-2">
            <Award className="w-4 h-4" />
            <span>ESTADÍSTICAS DE SUPERVIVENCIA</span>
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-neutral-300">
            <span>Distancia Recorrida:</span>
            <strong className="text-emerald-400">{Math.floor(distance)} metros</strong>
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-neutral-300">
            <span>Último Nivel Alcanzado:</span>
            <strong className="text-yellow-400">{levelReachedName}</strong>
          </div>
        </div>

        <button
          onClick={onRetry}
          className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-sm tracking-wider rounded-xl transition-all shadow-xl flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>REINENTAR EN EL NIVEL 0</span>
        </button>
      </div>
    </div>
  );
};
