import * as THREE from 'three';
import { BackroomsLevel, GameSettings, InventoryItem, NoteEntry, PlayerStats } from '../types';
import { LEVEL_DEFINITIONS } from './LevelConfig';
import { TextureGenerator } from './TextureGenerator';
import { ChunkManager, SpawnedItem } from './ChunkManager';
import { EntityManager } from './EntityManager';
import { SoundEngine } from '../audio/SoundEngine';

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private flashLight: THREE.SpotLight;
  private flashLightTarget: THREE.Object3D;
  private ambientLight: THREE.AmbientLight;

  private chunkManager: ChunkManager;
  private entityManager: EntityManager;

  // Materials per level
  private currentWallMat!: THREE.Material;
  private currentFloorMat!: THREE.Material;
  private currentCeilingMat!: THREE.Material;

  // Controls state
  public moveForward = false;
  public moveBackward = false;
  public moveLeft = false;
  public moveRight = false;
  public isSprinting = false;
  public isCrouching = false;

  // Camera rotation angles
  public yaw = 0;
  public pitch = 0;

  // Player physics
  private playerPos = new THREE.Vector3(0, 1.7, 0);
  private playerVelocity = new THREE.Vector3();

  // Player stats state
  public stats: PlayerStats = {
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
  };

  public inventory: InventoryItem[] = [
    { id: 'start_almond', type: 'almond_water', name: 'Agua de Almendras', description: 'Restaura 35 de Cordura y 20 de Salud.', quantity: 2, iconName: 'GlassWater' },
    { id: 'start_battery', type: 'battery', name: 'Batería AA', description: 'Recarga la linterna al 100%.', quantity: 3, iconName: 'BatteryCharging' },
  ];

  public notesLog: NoteEntry[] = [];
  public settings: GameSettings = {
    fov: 75,
    sensitivity: 1.0,
    volumeMaster: 0.8,
    volumeSFX: 0.8,
    volumeAmbience: 0.8,
    graphicsQuality: 'high',
    headBob: true,
    hallucinations: true,
    mobileControls: false,
  };

  private currentInteractivePrompt: string | null = null;
  private nearbyItem: SpawnedItem | null = null;
  private nearbyDoorLevel: string | null = null;

  private clock = new THREE.Clock();
  private animationFrameId: number | null = null;
  private lastPosition = new THREE.Vector3();

  // Callbacks
  public onStatsUpdate?: (stats: PlayerStats) => void;
  public onPromptChange?: (prompt: string | null) => void;
  public onGameOver?: (cause: string) => void;
  public onNoteDiscovered?: (note: NoteEntry) => void;
  public onJumpscare?: (type: string) => void;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene setup
    this.scene = new THREE.Scene();

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(
      this.settings.fov,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 1.7, 0);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.ambientLight = new THREE.AmbientLight(0xffea9f, 0.8);
    this.scene.add(this.ambientLight);

    this.flashLightTarget = new THREE.Object3D();
    this.scene.add(this.flashLightTarget);

    this.flashLight = new THREE.SpotLight(0xffffff, 4.0, 22, Math.PI / 6, 0.4, 1);
    this.flashLight.position.set(0, 1.7, 0);
    this.flashLight.target = this.flashLightTarget;
    this.scene.add(this.flashLight);

    // Managers
    this.chunkManager = new ChunkManager(this.scene);
    this.entityManager = new EntityManager(this.scene);

    // Resize listener
    window.addEventListener('resize', this.onWindowResize);

    // Load initial level materials
    this.loadLevel('level0');
  }

  public loadLevel(levelId: BackroomsLevel) {
    this.stats.currentLevel = levelId;
    const config = LEVEL_DEFINITIONS[levelId];

    // Fog
    this.scene.fog = new THREE.FogExp2(config.fogColor, config.fogDensity);
    this.renderer.setClearColor(config.fogColor);

    // Ambient lighting
    this.ambientLight.color.setHex(config.lightColor);
    this.ambientLight.intensity = config.lightIntensity;

    // Create materials
    if (config.wallType === 'wallpaper') {
      this.currentWallMat = new THREE.MeshStandardMaterial({ map: TextureGenerator.getYellowWallpaper(), roughness: 0.8 });
    } else if (config.wallType === 'concrete') {
      this.currentWallMat = new THREE.MeshStandardMaterial({ map: TextureGenerator.CONCRETE(), roughness: 0.9 });
    } else if (config.wallType === 'tiles') {
      this.currentWallMat = new THREE.MeshStandardMaterial({ map: TextureGenerator.POOL_TILES(), roughness: 0.2 });
    } else if (config.wallType === 'red_hospital') {
      this.currentWallMat = new THREE.MeshStandardMaterial({ map: TextureGenerator.RED_HOSPITAL_WALL(), roughness: 0.5 });
    } else {
      this.currentWallMat = new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 1.0 });
    }

    if (config.floorType === 'carpet') {
      this.currentFloorMat = new THREE.MeshStandardMaterial({ map: TextureGenerator.DAMP_CARPET(), roughness: 0.95 });
    } else if (config.floorType === 'water') {
      this.currentFloorMat = new THREE.MeshStandardMaterial({ color: 0x66ccdd, roughness: 0.1, transparent: true, opacity: 0.85 });
    } else if (config.floorType === 'concrete') {
      this.currentFloorMat = new THREE.MeshStandardMaterial({ map: TextureGenerator.CONCRETE(), roughness: 0.85 });
    } else {
      this.currentFloorMat = new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 1.0 });
    }

    this.currentCeilingMat = new THREE.MeshStandardMaterial({ map: TextureGenerator.CEILING_TILES(), roughness: 0.7 });

    // Clear old level
    this.chunkManager.clearAllChunks();
    this.entityManager.clearAll();

    // Reset player position slightly
    this.playerPos.set(0, 1.7, 0);

    // Sound ambient hum update
    SoundEngine.startFluorescentHum(config.lightIntensity * 0.25);

    // Spawn initial entities if level requires
    if (config.hasEntities) {
      config.spawnableEntities.forEach((entType, idx) => {
        this.entityManager.spawnEntity(entType, (idx + 1) * 12, 0, (idx + 1) * 10);
      });
    }

    SoundEngine.playWarpSound();
  }

  public handleMouseMove(movementX: number, movementY: number) {
    const sens = this.settings.sensitivity * 0.0022;
    this.yaw -= movementX * sens;
    this.pitch -= movementY * sens;
    this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
  }

  public toggleFlashlight() {
    this.stats.flashlightOn = !this.stats.flashlightOn;
    SoundEngine.playFlashlightClick();
  }

  public useInventoryItem(itemType: string) {
    const item = this.inventory.find((i) => i.type === itemType && i.quantity > 0);
    if (!item) return;

    if (itemType === 'almond_water') {
      this.stats.sanity = Math.min(100, this.stats.sanity + 35);
      this.stats.health = Math.min(100, this.stats.health + 20);
      SoundEngine.playItemPickup();
    } else if (itemType === 'battery') {
      this.stats.flashlightBattery = 100;
      SoundEngine.playFlashlightClick();
    } else if (itemType === 'sanity_pills') {
      this.stats.sanity = 100;
      SoundEngine.playItemPickup();
    } else if (itemType === 'glowstick') {
      this.stats.glowstickActive = true;
      this.stats.glowstickTime = 120;
    } else if (itemType === 'motion_tracker') {
      this.stats.motionTrackerActive = !this.stats.motionTrackerActive;
    }

    item.quantity -= 1;
  }

  public interactNearest() {
    if (this.nearbyItem && !this.nearbyItem.collected) {
      this.nearbyItem.collected = true;
      this.nearbyItem.mesh.visible = false;

      if (this.nearbyItem.type === 'note' && this.nearbyItem.noteText) {
        const note: NoteEntry = {
          id: `note_${Date.now()}`,
          title: `Registro en ${LEVEL_DEFINITIONS[this.stats.currentLevel].name}`,
          content: this.nearbyItem.noteText,
          author: 'Anónimo',
          timestamp: new Date().toLocaleTimeString(),
          read: false,
        };
        this.notesLog.unshift(note);
        this.onNoteDiscovered?.(note);
      } else {
        const invItem = this.inventory.find((i) => i.type === this.nearbyItem!.type);
        if (invItem) invItem.quantity += 1;
        else {
          this.inventory.push({
            id: `inv_${this.nearbyItem.type}`,
            type: this.nearbyItem.type,
            name: this.nearbyItem.type === 'almond_water' ? 'Agua de Almendras' : 'Batería AA',
            description: 'Objeto de supervivencia.',
            quantity: 1,
            iconName: 'Package',
          });
        }
      }

      SoundEngine.playItemPickup();
      this.currentInteractivePrompt = null;
      this.onPromptChange?.(null);
    } else if (this.nearbyDoorLevel) {
      this.loadLevel(this.nearbyDoorLevel as BackroomsLevel);
      this.currentInteractivePrompt = null;
      this.onPromptChange?.(null);
    }
  }

  public start() {
    this.clock.start();
    this.lastPosition.copy(this.playerPos);
    this.animate();
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);

    this.updatePlayerMovement(delta);
    this.updateWorldAndEntities(delta);

    // Update camera direction
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
    this.camera.position.copy(this.playerPos);

    // Update flashlight
    this.flashLight.position.copy(this.camera.position);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    this.flashLightTarget.position.copy(this.camera.position).add(forward.multiplyScalar(10));

    // Flashlight battery decay
    if (this.stats.flashlightOn) {
      this.stats.flashlightBattery = Math.max(0, this.stats.flashlightBattery - delta * 0.4);
      if (this.stats.flashlightBattery <= 0) {
        this.flashLight.intensity = 0;
      } else {
        this.flashLight.intensity = (this.stats.flashlightBattery / 100) * 4.5;
      }
    } else {
      this.flashLight.intensity = 0;
    }

    // Sanity decay in darkness
    if (!this.stats.flashlightOn || this.stats.currentLevel === 'level6') {
      this.stats.sanity = Math.max(0, this.stats.sanity - delta * 2.2);
    }

    // Motion Tracker radar beep
    if (this.stats.motionTrackerActive && Math.random() < 0.08) {
      const ents = this.entityManager.getEntities();
      let minDist = 99;
      ents.forEach((e) => {
        const d = Math.hypot(e.x - this.playerPos.x, e.z - this.playerPos.z);
        if (d < minDist) minDist = d;
      });
      if (minDist < 25) {
        SoundEngine.playRadarBeep(minDist);
      }
    }

    // Notify UI stats update
    this.stats.position = { x: this.playerPos.x, y: this.playerPos.y, z: this.playerPos.z };
    this.onStatsUpdate?.({ ...this.stats });

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  };

  private updatePlayerMovement(delta: number) {
    const config = LEVEL_DEFINITIONS[this.stats.currentLevel];
    let speed = 3.2;

    if (this.isSprinting && this.stats.stamina > 0) {
      speed = 6.2;
      this.stats.stamina = Math.max(0, this.stats.stamina - delta * 22);
    } else {
      this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + delta * 12);
    }

    if (this.isCrouching) speed *= 0.5;

    // Movement direction vectors relative to camera orientation
    const moveDir = new THREE.Vector3();
    if (this.moveForward) moveDir.z -= 1;
    if (this.moveBackward) moveDir.z += 1;
    if (this.moveLeft) moveDir.x -= 1;
    if (this.moveRight) moveDir.x += 1;
    moveDir.normalize();

    // Rotate moveDir by current camera yaw
    moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    const targetVelocity = moveDir.multiplyScalar(speed);
    this.playerVelocity.x = targetVelocity.x;
    this.playerVelocity.z = targetVelocity.z;

    const newX = this.playerPos.x + this.playerVelocity.x * delta;
    const newZ = this.playerPos.z + this.playerVelocity.z * delta;

    // Chunk generation & Wall Collision Check
    const { walls, items, interactive } = this.chunkManager.updatePlayerChunk(
      newX,
      newZ,
      2,
      this.currentWallMat,
      this.currentFloorMat,
      this.currentCeilingMat,
      this.stats.currentLevel
    );

    // Collision Box for Player
    const playerRadius = 0.45;
    let allowedX = newX;
    let allowedZ = newZ;

    walls.forEach((wallBox) => {
      const playerBoxX = new THREE.Box3(
        new THREE.Vector3(newX - playerRadius, 0, this.playerPos.z - playerRadius),
        new THREE.Vector3(newX + playerRadius, 2, this.playerPos.z + playerRadius)
      );
      if (wallBox.intersectsBox(playerBoxX)) {
        allowedX = this.playerPos.x;
      }

      const playerBoxZ = new THREE.Box3(
        new THREE.Vector3(this.playerPos.x - playerRadius, 0, newZ - playerRadius),
        new THREE.Vector3(this.playerPos.x + playerRadius, 2, newZ + playerRadius)
      );
      if (wallBox.intersectsBox(playerBoxZ)) {
        allowedZ = this.playerPos.z;
      }
    });

    this.playerPos.x = allowedX;
    this.playerPos.z = allowedZ;

    // Distance traveled stat
    const movedDist = this.playerPos.distanceTo(this.lastPosition);
    if (movedDist > 0.05) {
      this.stats.distanceTraveled += movedDist;
      this.lastPosition.copy(this.playerPos);

      // Footstep sound
      if (Math.random() < 0.25) {
        const mat = config.floorType === 'carpet' ? 'carpet' : config.floorType === 'water' ? 'water' : 'concrete';
        SoundEngine.playFootstep(mat);
      }
    }

    // Check nearby items / interactables
    this.checkInteractions(items, interactive);
  }

  private checkInteractions(items: SpawnedItem[], interactive: Array<{ mesh: THREE.Mesh; type: string; targetLevel?: string }>) {
    let foundPrompt: string | null = null;
    this.nearbyItem = null;
    this.nearbyDoorLevel = null;

    // Items
    for (const item of items) {
      if (item.collected) continue;
      const dist = Math.hypot(item.x - this.playerPos.x, item.z - this.playerPos.z);
      if (dist < 2.2) {
        this.nearbyItem = item;
        foundPrompt = item.type === 'note' ? 'Presiona E para LEER NOTA' : 'Presiona E para RECOGER';
        break;
      }
    }

    // Doors / Noclip Portals
    if (!foundPrompt) {
      for (const obj of interactive) {
        const worldPos = new THREE.Vector3();
        obj.mesh.getWorldPosition(worldPos);
        const dist = Math.hypot(worldPos.x - this.playerPos.x, worldPos.z - this.playerPos.z);
        if (dist < 2.5) {
          this.nearbyDoorLevel = obj.targetLevel || 'level1';
          const targetName = LEVEL_DEFINITIONS[this.nearbyDoorLevel as BackroomsLevel]?.name || 'Siguiente Nivel';
          foundPrompt = `Presiona E para HACER NO-CLIP hacia ${targetName}`;
          break;
        }
      }
    }

    if (foundPrompt !== this.currentInteractivePrompt) {
      this.currentInteractivePrompt = foundPrompt;
      this.onPromptChange?.(foundPrompt);
    }
  }

  private updateWorldAndEntities(delta: number) {
    const { damageDealt, sanityLoss, jumpscareType } = this.entityManager.update(
      delta,
      { x: this.playerPos.x, y: this.playerPos.y, z: this.playerPos.z },
      this.stats.flashlightOn && this.stats.flashlightBattery > 0,
      this.camera
    );

    if (damageDealt > 0) {
      this.stats.health = Math.max(0, this.stats.health - damageDealt);
    }

    if (sanityLoss > 0) {
      this.stats.sanity = Math.max(0, this.stats.sanity - sanityLoss);
    }

    if (jumpscareType) {
      this.onJumpscare?.(jumpscareType);
    }

    // Check Game Over
    if (this.stats.health <= 0) {
      this.stop();
      this.onGameOver?.('Sucumbiste ante las entidades de The Backrooms.');
    } else if (this.stats.sanity <= 0) {
      this.stop();
      this.onGameOver?.('Perdiste por completo la cordura en el laberinto infinito.');
    }
  }

  private onWindowResize = () => {
    if (!this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };
}
