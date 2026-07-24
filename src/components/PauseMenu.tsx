import React from 'react';
import { GameSettings, BackroomsLevel } from '../types';
import { LEVEL_DEFINITIONS } from '../engine/LevelConfig';
import { Settings, Volume2, Sliders, Monitor, Keyboard, RefreshCw, X, Smartphone } from 'lucide-react';

interface PauseMenuProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onSelectLevel: (levelId: BackroomsLevel) => void;
  onResume: () => void;
  onRestart: () => void;
  onOpenApk: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  settings,
  onUpdateSettings,
  onSelectLevel,
  onResume,
  onRestart,
  onOpenApk,
}) => {
  return (
    <div id="pause-modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-yellow-400 font-mono font-bold text-base">
            <Settings className="w-5 h-5" />
            <span>PAUSA Y CONFIGURACIÓN</span>
          </div>

          <button
            onClick={onResume}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Audio Volume Slider */}
          <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <div className="text-xs font-mono text-yellow-400 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span>VOLUMEN GENERAL: {Math.round(settings.volumeMaster * 100)}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volumeMaster}
              onChange={(e) => onUpdateSettings({ ...settings, volumeMaster: parseFloat(e.target.value) })}
              className="w-full accent-yellow-500"
            />
          </div>

          {/* Mouse Sensitivity & FOV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="text-xs font-mono text-neutral-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-yellow-400" />
                <span>SENSIBILIDAD MOUSE: {settings.sensitivity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={settings.sensitivity}
                onChange={(e) => onUpdateSettings({ ...settings, sensitivity: parseFloat(e.target.value) })}
                className="w-full accent-yellow-500"
              />
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="text-xs font-mono text-neutral-300 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-yellow-400" />
                <span>CAMPO DE VISIÓN (FOV): {settings.fov}°</span>
              </div>
              <input
                type="range"
                min="60"
                max="100"
                step="2"
                value={settings.fov}
                onChange={(e) => onUpdateSettings({ ...settings, fov: parseInt(e.target.value) })}
                className="w-full accent-yellow-500"
              />
            </div>
          </div>

          {/* Level Selector (Teleport for exploration testing) */}
          <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <div className="text-xs font-mono text-yellow-400 font-bold uppercase tracking-wider">
              TELETRANSPORTADOR DE NIVELES (EXPLORACIÓN LIBRE)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(LEVEL_DEFINITIONS).map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => onSelectLevel(lvl.id)}
                  className="p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-lg text-left text-xs transition-colors"
                >
                  <div className="font-mono text-yellow-400">{lvl.name}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{lvl.codeName}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Keybindings Cheat Sheet */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2 text-xs font-mono text-neutral-300">
            <div className="text-yellow-400 font-bold flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              <span>CONTROLES DE TECLADO</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 pt-1">
              <div><strong>WASD / Flechas:</strong> Moverse</div>
              <div><strong>Mouse:</strong> Mirar / Girar</div>
              <div><strong>SHIFT:</strong> Correr</div>
              <div><strong>F:</strong> Encender Linterna</div>
              <div><strong>E:</strong> Interactuar / Recoger</div>
              <div><strong>1 - 3:</strong> Usar suministros rápida</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onRestart}
              className="px-4 py-2.5 bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 text-xs font-mono font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>REINICIAR</span>
            </button>

            <button
              onClick={onOpenApk}
              className="px-4 py-2.5 bg-amber-950/50 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-mono font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-yellow-400" />
              <span>DESCARGAR APK</span>
            </button>
          </div>

          <button
            onClick={onResume}
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-mono font-bold rounded-lg transition-colors shadow-lg"
          >
            CONTINUAR EXPLORANDO
          </button>
        </div>
      </div>
    </div>
  );
};
