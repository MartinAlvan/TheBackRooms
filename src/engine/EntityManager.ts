import * as THREE from 'three';
import { Entity, EntityType } from '../types';
import { TextureGenerator } from './TextureGenerator';
import { SoundEngine } from '../audio/SoundEngine';

export class EntityManager {
  private entities: Map<string, { data: Entity; mesh: THREE.Group }> = new Map();
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public clearAll() {
    this.entities.forEach(({ mesh }) => {
      this.scene.remove(mesh);
      mesh.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).geometry?.dispose();
        }
      });
    });
    this.entities.clear();
  }

  public spawnEntity(type: EntityType, x: number, y: number, z: number): Entity {
    const id = `entity_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const data: Entity = {
      id,
      type,
      x,
      y,
      z,
      speed: type === 'bacteria' ? 3.8 : type === 'smiler' ? 1.5 : type === 'partygoer' ? 4.2 : 2.5,
      state: 'stalking',
      health: 100,
      alertness: 0,
    };

    const mesh = this.createEntityMesh(type);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);

    this.entities.set(id, { data, mesh });
    return data;
  }

  private createEntityMesh(type: EntityType): THREE.Group {
    const group = new THREE.Group();

    if (type === 'bacteria') {
      // Tall wireframe black spindly creature (Howler/Bacteria)
      const bodyGeo = new THREE.CylinderGeometry(0.15, 0.25, 3.2, 8);
      const bodyMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, wireframe: true });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.6;

      // Spindly arms
      const arm1Geo = new THREE.CylinderGeometry(0.04, 0.04, 2.2);
      const arm1 = new THREE.Mesh(arm1Geo, bodyMat);
      arm1.rotation.z = Math.PI / 4;
      arm1.position.set(-0.8, 2.0, 0);

      const arm2 = new THREE.Mesh(arm1Geo, bodyMat);
      arm2.rotation.z = -Math.PI / 4;
      arm2.position.set(0.8, 2.0, 0);

      group.add(body);
      group.add(arm1);
      group.add(arm2);
    } else if (type === 'smiler') {
      // Billboard face glowing in darkness
      const faceGeo = new THREE.PlaneGeometry(1.8, 1.8);
      const faceMat = new THREE.MeshBasicMaterial({
        map: TextureGenerator.SMILER_FACE(),
        transparent: true,
        side: THREE.DoubleSide,
      });
      const faceMesh = new THREE.Mesh(faceGeo, faceMat);
      faceMesh.position.y = 1.5;

      group.add(faceMesh);
    } else if (type === 'partygoer') {
      // Yellow tall entity with smiley mask and red balloon
      const bodyGeo = new THREE.CylinderGeometry(0.3, 0.35, 2.6, 12);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdcae38, roughness: 0.6 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.3;

      // Balloon
      const balloonGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const balloonMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
      const balloon = new THREE.Mesh(balloonGeo, balloonMat);
      balloon.position.set(0.6, 2.8, 0);

      group.add(body);
      group.add(balloon);
    } else {
      // Skin-stealer: Dark gray humanoid
      const bodyGeo = new THREE.BoxGeometry(0.7, 2.2, 0.5);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.9 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.1;
      group.add(body);
    }

    return group;
  }

  /**
   * Updates AI logic, entity position, movement towards player, and collision damage
   */
  public update(
    delta: number,
    playerPos: { x: number; y: number; z: number },
    flashlightOn: boolean,
    camera: THREE.Camera
  ): { closestDistance: number; damageDealt: number; sanityLoss: number; jumpscareType: EntityType | null } {
    let closestDistance = 999;
    let damageDealt = 0;
    let sanityLoss = 0;
    let jumpscareType: EntityType | null = null;

    this.entities.forEach(({ data, mesh }) => {
      const dist = Math.hypot(playerPos.x - data.x, playerPos.z - data.z);
      if (dist < closestDistance) closestDistance = dist;

      // Make Smiler billboard always face camera
      if (data.type === 'smiler') {
        mesh.lookAt(playerPos.x, mesh.position.y, playerPos.z);
      } else {
        mesh.lookAt(playerPos.x, mesh.position.y, playerPos.z);
      }

      // Check if player is directly looking at entity
      const dirToEntity = new THREE.Vector3(data.x - playerPos.x, 0, data.z - playerPos.z).normalize();
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      camDir.y = 0;
      camDir.normalize();

      const dot = camDir.dot(dirToEntity); // > 0.8 means looking directly at entity

      if (data.type === 'smiler') {
        if (dot > 0.75 && dist < 12) {
          // Looking at Smiler causes severe sanity drop!
          sanityLoss += delta * 15;
          if (flashlightOn) {
            // Flashlight angers Smiler!
            data.speed = 3.5;
            data.state = 'chasing';
          }
        }
      }

      // AI Movement towards player
      if (dist < 22) {
        if (data.state === 'stalking' && dist < 14) {
          data.state = 'chasing';
          SoundEngine.playEntityScreech();
        }

        if (data.state === 'chasing') {
          const moveDist = data.speed * delta;
          data.x += dirToEntity.x * moveDist;
          data.z += dirToEntity.z * moveDist;
          mesh.position.set(data.x, data.y, data.z);
        }
      }

      // Contact attack / Jumpscare
      if (dist < 1.4) {
        damageDealt += 45 * delta;
        jumpscareType = data.type;
        SoundEngine.playEntityScreech();
      }
    });

    return { closestDistance, damageDealt, sanityLoss, jumpscareType };
  }

  public getEntities(): Entity[] {
    const list: Entity[] = [];
    this.entities.forEach(({ data }) => list.push(data));
    return list;
  }
}
