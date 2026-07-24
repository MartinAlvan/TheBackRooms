import React from 'react';
import { PlayerStats, InventoryItem } from '../types';
import { LEVEL_DEFINITIONS } from '../engine/LevelConfig';
import { Battery, Zap, Heart, Brain, Radio, Compass, Hand, ShieldAlert, Sparkles, Eye } from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  inventory: InventoryItem[];
  prompt: string | null;
  onUseItem: (itemType: string) => void;
  onToggleFlashlight: () => void;
  onOpenInventory: () => void;
  onOpenCodex: () => void;
  onOpenPause: () => void;
  isMobile: boolean;
  onMobileMove: (dx: number, dy: number) => void;
  onMobileLook: (dx: number, dy: number) => void;
  onInteract: () => void;
  onToggleSprint: () => void;
  isSprinting: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  inventory,
  prompt,
  onUseItem,
  onToggleFlashlight,
  onOpenInventory,
  onOpenCodex,
  onOpenPause,
  isMobile,
  onMobileMove,
  onMobileLook,
  onInteract,
  onToggleSprint,
  isSprinting,
}) => {
  const currentLevelInfo = LEVEL_DEFINITIONS[stats.currentLevel];

  // Calculate sanity warning status
  const isSanityLow = stats.sanity < 35;
  const isHealthLow = stats.health < 30;

  return (
    <div id="hud-overlay" className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 z-20">
      {/* Sanity Hallucination Glitch Effect Overlay when low sanity */}
      {isSanityLow && (
        <div
          id="sanity-hallucination-overlay"
          className="absolute inset-0 bg-red-950/20 mix-blend-color-dodge animate-pulse pointer-events-none border-4 border-red-800/40"
        />
      )}

      {/* TOP BAR: Level Badge, Compass, Pause Button */}
      <div id="top-bar" className="flex items-center justify-between w-full pointer-events-auto">
        {/* Level Badge */}
        <div id="level-badge" className="flex items-center gap-3 bg-black/75 backdrop-blur-md px-4 py-2 rounded-lg border border-yellow-600/40 text-yellow-100 shadow-lg">
          <ShieldAlert className="w-5 h-5 text-yellow-400 animate-pulse" />
          <div>
            <div className="text-xs uppercase font-mono tracking-widest text-yellow-400/80">
              {currentLevelInfo.codeName} • <span className="text-red-400 font-bold">{currentLevelInfo.dangerClass}</span>
            </div>
            <div className="text-sm font-semibold tracking-wide">{currentLevelInfo.name}</div>
          </div>
        </div>

        {/* Distance Traveled & Compass */}
        <div id="compass-badge" className="hidden sm:flex items-center gap-2 bg-black/75 backdrop-blur-md px-4 py-2 rounded-lg border border-neutral-700 text-neutral-200">
          <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
          <span className="text-xs font-mono tracking-wider">
            RECORRIDO: <strong className="text-emerald-300">{Math.floor(stats.distanceTraveled)}m</strong>
          </span>
        </div>

        {/* Top Buttons */}
        <div id="hud-top-actions" className="flex items-center gap-2">
          <button
            id="codex-btn"
            onClick={onOpenCodex}
            className="px-3 py-2 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-yellow-400 rounded-md transition-all flex items-center gap-1.5 shadow"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden md:inline">CÓDEX LORE</span>
          </button>

          <button
            id="pause-btn"
            onClick={onOpenPause}
            className="px-3 py-2 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-200 rounded-md transition-all shadow"
          >
            MENÚ
          </button>
        </div>
      </div>

      {/* CENTER: Crosshair & Interaction Prompt */}
      <div id="center-hud" className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Crosshair */}
        <div id="crosshair" className="w-2.5 h-2.5 bg-white/70 rounded-full border border-black/80 shadow-sm" />

        {/* Interaction Prompt Banner */}
        {prompt && (
          <div
            id="interaction-prompt"
            className="mt-6 px-6 py-2.5 bg-yellow-950/90 border border-yellow-500/80 text-yellow-200 text-xs sm:text-sm font-mono tracking-wider rounded-lg shadow-2xl animate-bounce flex items-center gap-2"
          >
            <Hand className="w-4 h-4 text-yellow-400" />
            <span>{prompt}</span>
          </div>
        )}
      </div>

      {/* RADAR / MOTION TRACKER (Floating Widget if active) */}
      {stats.motionTrackerActive && (
        <div
          id="motion-tracker-widget"
          className="absolute top-20 right-4 w-32 h-32 bg-emerald-950/90 border-2 border-emerald-500 rounded-full shadow-2xl flex items-center justify-center overflow-hidden pointer-events-auto"
        >
          <div id="radar-sweep" className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping" />
          <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />
          <div className="absolute bottom-2 text-[10px] font-mono text-emerald-300">RADAR ACTIVO</div>
        </div>
      )}

      {/* BOTTOM BAR: Vital Meters & Quick Inventory */}
      <div id="bottom-bar" className="flex flex-col sm:flex-row items-end sm:items-center justify-between w-full gap-4 pointer-events-auto">
        {/* Vitals Panel */}
        <div id="vitals-panel" className="bg-black/85 backdrop-blur-md p-3.5 rounded-xl border border-neutral-800 w-full sm:w-80 flex flex-col gap-2.5 shadow-2xl">
          {/* Health Bar */}
          <div className="flex items-center gap-2">
            <Heart className={`w-4 h-4 ${isHealthLow ? 'text-red-500 animate-ping' : 'text-red-400'}`} />
            <div className="flex-1 bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="bg-gradient-to-r from-red-700 to-red-500 h-full transition-all duration-300"
                style={{ width: `${stats.health}%` }}
              />
            </div>
            <span className="text-xs font-mono text-neutral-300 w-8 text-right">{Math.round(stats.health)}%</span>
          </div>

          {/* Sanity Bar */}
          <div className="flex items-center gap-2">
            <Brain className={`w-4 h-4 ${isSanityLow ? 'text-purple-400 animate-spin' : 'text-purple-400'}`} />
            <div className="flex-1 bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="bg-gradient-to-r from-purple-800 to-indigo-500 h-full transition-all duration-300"
                style={{ width: `${stats.sanity}%` }}
              />
            </div>
            <span className="text-xs font-mono text-neutral-300 w-8 text-right">{Math.round(stats.sanity)}%</span>
          </div>

          {/* Stamina Bar */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <div className="flex-1 bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full transition-all duration-150"
                style={{ width: `${stats.stamina}%` }}
              />
            </div>
            <span className="text-xs font-mono text-neutral-400 w-8 text-right">{Math.round(stats.stamina)}%</span>
          </div>

          {/* Flashlight Battery */}
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-1 border-t border-neutral-800/80">
            <button
              onClick={onToggleFlashlight}
              className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all ${
                stats.flashlightOn ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              <Battery className="w-3.5 h-3.5" />
              <span>LINTERNA ({Math.round(stats.flashlightBattery)}%)</span>
            </button>

            <span className="text-[11px] text-neutral-500">TECLA F / TOQUE</span>
          </div>
        </div>

        {/* Quick Inventory Toolbar */}
        <div id="quick-inventory-bar" className="flex items-center gap-2 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-neutral-800">
          {inventory.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => onUseItem(item.type)}
              className="relative group p-2 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 rounded-lg text-neutral-200 transition-all flex flex-col items-center justify-center w-14 h-14"
            >
              <span className="absolute top-1 left-1.5 text-[10px] font-mono text-neutral-500">{idx + 1}</span>
              <Sparkles className="w-5 h-5 text-yellow-400 mb-0.5" />
              <span className="text-[10px] font-mono truncate max-w-[50px]">{item.name.split(' ')[0]}</span>
              {item.quantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {item.quantity}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={onOpenInventory}
            className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/50 text-yellow-300 rounded-lg text-xs font-mono flex flex-col items-center justify-center w-14 h-14"
          >
            Mochila
          </button>
        </div>
      </div>

      {/* MOBILE CONTROLS OVERLAY */}
      {isMobile && (
        <div id="mobile-controls" className="absolute inset-x-4 bottom-24 pointer-events-auto flex items-center justify-between">
          {/* Action Buttons Right */}
          <div className="flex flex-col gap-3 ml-auto">
            <button
              onClick={onInteract}
              className="w-14 h-14 bg-yellow-600/80 active:bg-yellow-500 rounded-full border-2 border-yellow-300 text-white font-bold text-xs shadow-2xl flex items-center justify-center"
            >
              E (USAR)
            </button>

            <button
              onClick={onToggleSprint}
              className={`w-14 h-14 rounded-full border-2 text-white font-bold text-xs shadow-2xl flex items-center justify-center ${
                isSprinting ? 'bg-amber-600 border-amber-300' : 'bg-neutral-800/80 border-neutral-600'
              }`}
            >
              CORRER
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
