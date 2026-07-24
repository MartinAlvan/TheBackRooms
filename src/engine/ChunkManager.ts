import * as THREE from 'three';

export const CHUNK_SIZE = 16; // 16x16 meters per chunk
export const WALL_HEIGHT = 4.2;

export interface SpawnedItem {
  id: string;
  type: 'almond_water' | 'battery' | 'glowstick' | 'sanity_pills' | 'motion_tracker' | 'note';
  mesh: THREE.Group;
  x: number;
  y: number;
  z: number;
  collected: boolean;
  noteText?: string;
}

export interface ChunkData {
  key: string;
  cx: number;
  cz: number;
  group: THREE.Group;
  walls: THREE.Box3[];
  items: SpawnedItem[];
  interactiveObjects: Array<{
    mesh: THREE.Mesh;
    type: 'noclip' | 'door_next_level' | 'chest';
    targetLevel?: string;
  }>;
}

export class ChunkManager {
  private activeChunks: Map<string, ChunkData> = new Map();
  private scene: THREE.Scene;
  private seed: number;

  constructor(scene: THREE.Scene, seed = 12345) {
    this.scene = scene;
    this.seed = seed;
  }

  public setSeed(newSeed: number) {
    this.seed = newSeed;
    this.clearAllChunks();
  }

  public clearAllChunks() {
    this.activeChunks.forEach((chunk) => {
      this.scene.remove(chunk.group);
      // dispose geometries/materials
      chunk.group.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
        }
      });
    });
    this.activeChunks.clear();
  }

  /**
   * Deterministic PRNG based on chunk key and global seed
   */
  private getChunkRandom(cx: number, cz: number, offset = 0): number {
    const n = Math.sin(cx * 12.9898 + cz * 78.233 + offset * 43758.5453 + this.seed) * 43758.5453123;
    return n - Math.floor(n);
  }

  /**
   * Updates chunks around player position
   */
  public updatePlayerChunk(
    px: number,
    pz: number,
    renderDistance = 2,
    wallMat: THREE.Material,
    floorMat: THREE.Material,
    ceilingMat: THREE.Material,
    levelId: string
  ): { walls: THREE.Box3[]; items: SpawnedItem[]; interactive: Array<{ mesh: THREE.Mesh; type: string; targetLevel?: string }> } {
    const currentCx = Math.floor(px / CHUNK_SIZE);
    const currentCz = Math.floor(pz / CHUNK_SIZE);

    const neededKeys = new Set<string>();
    const allWalls: THREE.Box3[] = [];
    const allItems: SpawnedItem[] = [];
    const allInteractive: Array<{ mesh: THREE.Mesh; type: string; targetLevel?: string }> = [];

    for (let dx = -renderDistance; dx <= renderDistance; dx++) {
      for (let dz = -renderDistance; dz <= renderDistance; dz++) {
        const cx = currentCx + dx;
        const cz = currentCz + dz;
        const key = `${cx},${cz}`;
        neededKeys.add(key);

        if (!this.activeChunks.has(key)) {
          const chunk = this.generateChunk(cx, cz, wallMat, floorMat, ceilingMat, levelId);
          this.activeChunks.set(key, chunk);
          this.scene.add(chunk.group);
        }

        const chunk = this.activeChunks.get(key)!;
        allWalls.push(...chunk.walls);
        allItems.push(...chunk.items);
        allInteractive.push(...chunk.interactiveObjects);
      }
    }

    // Unload distant chunks
    this.activeChunks.forEach((chunk, key) => {
      if (!neededKeys.has(key)) {
        this.scene.remove(chunk.group);
        chunk.group.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            (obj as THREE.Mesh).geometry?.dispose();
          }
        });
        this.activeChunks.delete(key);
      }
    });

    return { walls: allWalls, items: allItems, interactive: allInteractive };
  }

  /**
   * Generates 3D meshes for a single procedural chunk
   */
  private generateChunk(
    cx: number,
    cz: number,
    wallMat: THREE.Material,
    floorMat: THREE.Material,
    ceilingMat: THREE.Material,
    levelId: string
  ): ChunkData {
    const key = `${cx},${cz}`;
    const group = new THREE.Group();
    const walls: THREE.Box3[] = [];
    const items: SpawnedItem[] = [];
    const interactiveObjects: Array<{ mesh: THREE.Mesh; type: 'noclip' | 'door_next_level' | 'chest'; targetLevel?: string }> = [];

    const startX = cx * CHUNK_SIZE;
    const startZ = cz * CHUNK_SIZE;
    group.position.set(startX, 0, startZ);

    // 1. Floor mesh
    const floorGeo = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(CHUNK_SIZE / 2, 0, CHUNK_SIZE / 2);
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    // 2. Ceiling mesh (unless level 94)
    if (levelId !== 'level94') {
      const ceilingGeo = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE);
      const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
      ceilingMesh.rotation.x = Math.PI / 2;
      ceilingMesh.position.set(CHUNK_SIZE / 2, WALL_HEIGHT, CHUNK_SIZE / 2);
      group.add(ceilingMesh);
    }

    // 3. Fluorescent Light Fixtures
    const lightCount = Math.floor(this.getChunkRandom(cx, cz, 1) * 2) + 1;
    for (let i = 0; i < lightCount; i++) {
      const lx = 3 + this.getChunkRandom(cx, cz, 2 + i) * (CHUNK_SIZE - 6);
      const lz = 3 + this.getChunkRandom(cx, cz, 10 + i) * (CHUNK_SIZE - 6);

      const fixtureGeo = new THREE.BoxGeometry(2.4, 0.1, 0.8);
      const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
      const fixtureMesh = new THREE.Mesh(fixtureGeo, fixtureMat);
      fixtureMesh.position.set(lx, WALL_HEIGHT - 0.05, lz);
      group.add(fixtureMesh);

      // PointLight attached
      if (levelId !== 'level6') {
        const pointLight = new THREE.PointLight(0xffebad, 1.2, 14);
        pointLight.position.set(lx, WALL_HEIGHT - 0.5, lz);
        group.add(pointLight);
      }
    }

    // 4. Procedural Wall Placement inside Chunk Grid (4x4 sub-grid)
    const gridSize = 4;
    const cellM = CHUNK_SIZE / gridSize;

    for (let gx = 0; gx < gridSize; gx++) {
      for (let gz = 0; gz < gridSize; gz++) {
        // Skip central origin chunk area so player doesn't spawn stuck inside a wall
        if (cx === 0 && cz === 0 && gx === 1 && gz === 1) continue;

        const rand = this.getChunkRandom(cx, cz, gx * 5 + gz * 11);

        // North wall
        if (rand > 0.45 && gz > 0) {
          const wallGeo = new THREE.BoxGeometry(cellM, WALL_HEIGHT, 0.4);
          const wallMesh = new THREE.Mesh(wallGeo, wallMat);
          const wx = gx * cellM + cellM / 2;
          const wz = gz * cellM;
          wallMesh.position.set(wx, WALL_HEIGHT / 2, wz);
          group.add(wallMesh);

          // World bounding box for collisions
          const worldBox = new THREE.Box3();
          worldBox.setFromCenterAndSize(
            new THREE.Vector3(startX + wx, WALL_HEIGHT / 2, startZ + wz),
            new THREE.Vector3(cellM, WALL_HEIGHT, 0.4)
          );
          walls.push(worldBox);
        }

        // West wall
        if (rand > 0.52 && gx > 0) {
          const wallGeo = new THREE.BoxGeometry(0.4, WALL_HEIGHT, cellM);
          const wallMesh = new THREE.Mesh(wallGeo, wallMat);
          const wx = gx * cellM;
          const wz = gz * cellM + cellM / 2;
          wallMesh.position.set(wx, WALL_HEIGHT / 2, wz);
          group.add(wallMesh);

          const worldBox = new THREE.Box3();
          worldBox.setFromCenterAndSize(
            new THREE.Vector3(startX + wx, WALL_HEIGHT / 2, startZ + wz),
            new THREE.Vector3(0.4, WALL_HEIGHT, cellM)
          );
          walls.push(worldBox);
        }
      }
    }

    // 5. Item Spawning
    const itemRand = this.getChunkRandom(cx, cz, 99);
    if (itemRand > 0.5) {
      const ix = 2 + this.getChunkRandom(cx, cz, 101) * (CHUNK_SIZE - 4);
      const iz = 2 + this.getChunkRandom(cx, cz, 102) * (CHUNK_SIZE - 4);

      let itemType: 'almond_water' | 'battery' | 'glowstick' | 'sanity_pills' | 'motion_tracker' | 'note' = 'almond_water';
      if (itemRand > 0.92) itemType = 'motion_tracker';
      else if (itemRand > 0.82) itemType = 'note';
      else if (itemRand > 0.70) itemType = 'sanity_pills';
      else if (itemRand > 0.60) itemType = 'battery';

      const itemMeshGroup = this.createItemMesh(itemType);
      itemMeshGroup.position.set(ix, 0.5, iz);
      group.add(itemMeshGroup);

      const notesList = [
        '¡NO TE QUEDES EN UN SOLO LUGAR! El sonido de las luces las atrae...',
        'Encontré un pasaje hacia el Nivel 37. El agua de las piscinas reconforta la mente.',
        'Si ves una cara sonriente en la oscuridad, NO CORRAS. Apaga la linterna y retrocede.',
        'Registro de M. K. - Día 14: El agua de almendras recupera tu cordura. No bebas el líquido negro.',
        '¿Escuchas las sirenas? Si entras al Nivel !, corre con todas tus fuerzas.'
      ];

      items.push({
        id: `item_${cx}_${cz}_${Math.floor(itemRand * 1000)}`,
        type: itemType,
        mesh: itemMeshGroup,
        x: startX + ix,
        y: 0.5,
        z: startZ + iz,
        collected: false,
        noteText: itemType === 'note' ? notesList[Math.floor(itemRand * notesList.length)] : undefined,
      });
    }

    // 6. Special Interactive Objects (Staircase / Noclip Floor / Trapdoor to next Level)
    const portalRand = this.getChunkRandom(cx, cz, 222);
    if (portalRand > 0.88 && (Math.abs(cx) > 1 || Math.abs(cz) > 1)) {
      const px = CHUNK_SIZE / 2;
      const pz = CHUNK_SIZE / 2;

      // Dark floating portal doorway / trapdoor
      const portalGeo = new THREE.BoxGeometry(2.2, 3.2, 0.3);
      const portalMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0x221100,
        roughness: 0.1,
      });
      const portalMesh = new THREE.Mesh(portalGeo, portalMat);
      portalMesh.position.set(px, 1.6, pz);

      // Light frame outline
      const frameGeo = new THREE.BoxGeometry(2.4, 3.4, 0.1);
      const frameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.set(px, 1.6, pz);

      group.add(frameMesh);
      group.add(portalMesh);

      let targetLevel = 'level1';
      if (levelId === 'level0') targetLevel = portalRand > 0.95 ? 'level37' : 'level1';
      else if (levelId === 'level1') targetLevel = portalRand > 0.94 ? 'level_run' : 'level6';
      else if (levelId === 'level37') targetLevel = 'level94';
      else if (levelId === 'level_run') targetLevel = 'level37';
      else targetLevel = 'level0';

      interactiveObjects.push({
        mesh: portalMesh,
        type: 'door_next_level',
        targetLevel,
      });
    }

    return { key, cx, cz, group, walls, items, interactiveObjects };
  }

  private createItemMesh(type: string): THREE.Group {
    const itemGroup = new THREE.Group();

    if (type === 'almond_water') {
      // Bottle
      const bottleGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.45, 12);
      const bottleMat = new THREE.MeshStandardMaterial({ color: 0xe6f2ff, roughness: 0.2, transparent: true, opacity: 0.85 });
      const bottleMesh = new THREE.Mesh(bottleGeo, bottleMat);

      const capGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x3388ff });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = 0.25;

      itemGroup.add(bottleMesh);
      itemGroup.add(capMesh);
    } else if (type === 'battery') {
      const batGeo = new THREE.BoxGeometry(0.2, 0.35, 0.15);
      const batMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.8 });
      const batMesh = new THREE.Mesh(batGeo, batMat);
      itemGroup.add(batMesh);
    } else if (type === 'sanity_pills') {
      const bottleGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 10);
      const bottleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const bottleMesh = new THREE.Mesh(bottleGeo, bottleMat);
      itemGroup.add(bottleMesh);
    } else if (type === 'motion_tracker') {
      const trackerGeo = new THREE.BoxGeometry(0.35, 0.1, 0.45);
      const trackerMat = new THREE.MeshStandardMaterial({ color: 0x223322 });
      const trackerMesh = new THREE.Mesh(trackerGeo, trackerMat);

      const screenGeo = new THREE.PlaneGeometry(0.25, 0.3);
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x00ff44 });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.rotation.x = -Math.PI / 2;
      screenMesh.position.y = 0.06;

      itemGroup.add(trackerMesh);
      itemGroup.add(screenMesh);
    } else {
      // Note paper
      const paperGeo = new THREE.PlaneGeometry(0.35, 0.45);
      const paperMat = new THREE.MeshBasicMaterial({ color: 0xf3ebd3, side: THREE.DoubleSide });
      const paperMesh = new THREE.Mesh(paperGeo, paperMat);
      paperMesh.rotation.x = -Math.PI / 2;
      itemGroup.add(paperMesh);
    }

    return itemGroup;
  }
}
