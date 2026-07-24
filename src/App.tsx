import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './engine/GameEngine';
import { BackroomsLevel, GameSettings, InventoryItem, NoteEntry, PlayerStats } from './types';
import { HUD } from './components/HUD';
import { InventoryModal } from './components/InventoryModal';
import { CodexModal } from './components/CodexModal';
import { PauseMenu } from './components/PauseMenu';
import { GameOverModal } from './components/GameOverModal';
import { IntroScreen } from './components/IntroScreen';
import { ApkModal } from './components/ApkModal';
import { LEVEL_DEFINITIONS } from './engine/LevelConfig';
import { SoundEngine } from './audio/SoundEngine';

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  // App screens state
  const [isPlaying, setIsPlaying] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showInventory, setShowInventory] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [gameOverCause, setGameOverCause] = useState('Desapareciste en el laberinto.');

  // Game stats state
  const [stats, setStats] = useState<PlayerStats>({
    health: 100,
    sanity: 100,
    stamina: 100,
    maxStamina: 100,
    flashlightOn: true,
    flashlightBattery: 100,
    glowstickActive: false,
    glowstickTime: 0,
    motionTrackerActive: false,
    distanceTraveled: 0,
    currentLevel: 'level0',
    position: { x: 0, y: 1.7, z: 0 },
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 'almond_1', type: 'almond_water', name: 'Agua de Almendras', description: 'Restaura 35 de Cordura y 20 de Salud.', quantity: 2, iconName: 'GlassWater' },
    { id: 'bat_1', type: 'battery', name: 'Batería AA', description: 'Recarga la linterna al 100%.', quantity: 3, iconName: 'BatteryCharging' },
  ]);

  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    fov: 75,
    sensitivity: 1.0,
    volumeMaster: 0.8,
    volumeSFX: 0.8,
    volumeAmbience: 0.8,
    graphicsQuality: 'high',
    headBob: true,
    hallucinations: true,
    mobileControls: false,
  });

  // Detect mobile user agent
  useEffect(() => {
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    setIsMobile(mobileCheck);
  }, []);

  // Initialize GameEngine
  const handleStartGame = (initialLevel: BackroomsLevel = 'level0') => {
    setShowIntro(false);
    setShowGameOver(false);
    setShowPause(false);
    setIsPlaying(true);

    SoundEngine.init();
    SoundEngine.resume();

    if (!canvasContainerRef.current) return;

    if (!gameEngineRef.current) {
      const engine = new GameEngine(canvasContainerRef.current);
      gameEngineRef.current = engine;

      engine.onStatsUpdate = (newStats) => {
        setStats(newStats);
        setInventory([...engine.inventory]);
      };

      engine.onPromptChange = (newPrompt) => {
        setPrompt(newPrompt);
      };

      engine.onGameOver = (cause) => {
        setGameOverCause(cause);
        setShowGameOver(true);
        setIsPlaying(false);
      };

      engine.onNoteDiscovered = (newNote) => {
        setNotes((prev) => [newNote, ...prev]);
      };
    }

    gameEngineRef.current.loadLevel(initialLevel);
    gameEngineRef.current.start();
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameEngineRef.current || !isPlaying) return;

      const engine = gameEngineRef.current;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          engine.moveForward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          engine.moveBackward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          engine.moveLeft = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          engine.moveRight = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          engine.isSprinting = true;
          setIsSprinting(true);
          break;
        case 'KeyF':
          engine.toggleFlashlight();
          break;
        case 'KeyE':
          engine.interactNearest();
          break;
        case 'Digit1':
          engine.useInventoryItem('almond_water');
          break;
        case 'Digit2':
          engine.useInventoryItem('battery');
          break;
        case 'Digit3':
          engine.useInventoryItem('sanity_pills');
          break;
        case 'KeyI':
          setShowInventory((prev) => !prev);
          break;
        case 'Escape':
          setShowPause((prev) => !prev);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!gameEngineRef.current) return;
      const engine = gameEngineRef.current;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          engine.moveForward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          engine.moveBackward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          engine.moveLeft = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          engine.moveRight = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          engine.isSprinting = false;
          setIsSprinting(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  // Pointer Lock mouse look listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gameEngineRef.current || !isPlaying || showInventory || showPause || showCodex) return;
      gameEngineRef.current.handleMouseMove(e.movementX, e.movementY);
    };

    const handleCanvasClick = () => {
      if (isPlaying && !showInventory && !showPause && !showCodex && canvasContainerRef.current) {
        canvasContainerRef.current.requestPointerLock?.();
      }
    };

    const container = canvasContainerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('click', handleCanvasClick);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [isPlaying, showInventory, showPause, showCodex]);

  const handleUseItem = (itemType: string) => {
    gameEngineRef.current?.useInventoryItem(itemType);
  };

  const handleToggleFlashlight = () => {
    gameEngineRef.current?.toggleFlashlight();
  };

  const handleSelectLevel = (levelId: BackroomsLevel) => {
    gameEngineRef.current?.loadLevel(levelId);
    setShowPause(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans text-neutral-100 select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={canvasContainerRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

      {/* Gameplay HUD */}
      {isPlaying && !showIntro && !showGameOver && (
        <HUD
          stats={stats}
          inventory={inventory}
          prompt={prompt}
          onUseItem={handleUseItem}
          onToggleFlashlight={handleToggleFlashlight}
          onOpenInventory={() => setShowInventory(true)}
          onOpenCodex={() => setShowCodex(true)}
          onOpenPause={() => setShowPause(true)}
          isMobile={isMobile}
          onMobileMove={() => {}}
          onMobileLook={() => {}}
          onInteract={() => gameEngineRef.current?.interactNearest()}
          onToggleSprint={() => {
            if (gameEngineRef.current) {
              gameEngineRef.current.isSprinting = !gameEngineRef.current.isSprinting;
              setIsSprinting(gameEngineRef.current.isSprinting);
            }
          }}
          isSprinting={isSprinting}
        />
      )}

      {/* Intro Main Menu */}
      {showIntro && (
        <IntroScreen
          onStartGame={handleStartGame}
          onOpenCodex={() => setShowCodex(true)}
          onOpenApk={() => setShowApkModal(true)}
        />
      )}

      {/* Inventory & Notes Modal */}
      {showInventory && (
        <InventoryModal
          inventory={inventory}
          notes={notes}
          onClose={() => setShowInventory(false)}
          onUseItem={handleUseItem}
        />
      )}

      {/* Codex Lore Guide */}
      {showCodex && (
        <CodexModal onClose={() => setShowCodex(false)} />
      )}

      {/* Pause & Settings Menu */}
      {showPause && (
        <PauseMenu
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            SoundEngine.setMasterVolume(newSettings.volumeMaster);
          }}
          onSelectLevel={handleSelectLevel}
          onResume={() => setShowPause(false)}
          onRestart={() => handleStartGame('level0')}
          onOpenApk={() => setShowApkModal(true)}
        />
      )}

      {/* APK / PWA Conversion Modal */}
      {showApkModal && (
        <ApkModal onClose={() => setShowApkModal(false)} />
      )}

      {/* Game Over Modal */}
      {showGameOver && (
        <GameOverModal
          cause={gameOverCause}
          distance={stats.distanceTraveled}
          levelReachedName={LEVEL_DEFINITIONS[stats.currentLevel]?.name || 'Backrooms'}
          onRetry={() => handleStartGame('level0')}
        />
      )}
    </div>
  );
}
