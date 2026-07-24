export type BackroomsLevel = 'level0' | 'level1' | 'level37' | 'level_run' | 'level6' | 'level94';

export interface LevelInfo {
  id: BackroomsLevel;
  name: string;
  codeName: string;
  dangerClass: 'Clase 0' | 'Clase 1' | 'Clase 3' | 'Clase 4' | 'Clase 5' | 'Clase Muerta';
  description: string;
  wallType: 'wallpaper' | 'concrete' | 'tiles' | 'red_hospital' | 'darkness' | 'pastel';
  floorType: 'carpet' | 'concrete' | 'water' | 'checker' | 'dark' | 'grass';
  fogColor: number;
  fogDensity: number;
  lightColor: number;
  lightIntensity: number;
  ambientHumType: 'fluorescent' | 'pipes' | 'water_echo' | 'siren' | 'whisper' | 'tv_static';
  hasEntities: boolean;
  spawnableEntities: EntityType[];
}

export type EntityType = 'bacteria' | 'smiler' | 'partygoer' | 'skinstealer';

export interface Entity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  z: number;
  speed: number;
  state: 'idle' | 'stalking' | 'chasing' | 'staring';
  health: number;
  alertness: number;
}

export type ItemType = 'almond_water' | 'battery' | 'glowstick' | 'sanity_pills' | 'motion_tracker' | 'note';

export interface InventoryItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  quantity: number;
  iconName: string;
}

export interface NoteEntry {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  read: boolean;
}

export interface PlayerStats {
  health: number; // 0 - 100
  sanity: number; // 0 - 100
  stamina: number; // 0 - 100
  maxStamina: number;
  flashlightOn: boolean;
  flashlightBattery: number; // 0 - 100
  glowstickActive: boolean;
  glowstickTime: number; // seconds remaining
  motionTrackerActive: boolean;
  distanceTraveled: number; // in meters
  currentLevel: BackroomsLevel;
  position: { x: number; y: number; z: number };
}

export interface GameSettings {
  fov: number; // 60 - 100
  sensitivity: number; // 0.1 - 2.0
  volumeMaster: number; // 0 - 1
  volumeSFX: number; // 0 - 1
  volumeAmbience: number; // 0 - 1
  graphicsQuality: 'low' | 'medium' | 'high';
  headBob: boolean;
  hallucinations: boolean;
  mobileControls: boolean;
}

export interface HighScoreRecord {
  date: string;
  distance: number;
  levelReached: string;
  timeSurvivedSeconds: number;
  itemsFound: number;
}
