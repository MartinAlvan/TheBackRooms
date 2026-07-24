import * as THREE from 'three';

export class TextureGenerator {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Generates a yellow mono-wallpaper texture with aged vertical stripes and subtle grime
   */
  public static getYellowWallpaper(): THREE.CanvasTexture {
    if (this.cache.has('wallpaper_yellow')) return this.cache.get('wallpaper_yellow')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base yellow-ochre tint
    ctx.fillStyle = '#c8b261';
    ctx.fillRect(0, 0, 512, 512);

    // Vertical wallpaper pattern lines
    ctx.fillStyle = '#b09a47';
    for (let x = 0; x < 512; x += 32) {
      ctx.fillRect(x, 0, 16, 512);
      ctx.fillStyle = '#a28c3b';
      ctx.fillRect(x + 14, 0, 2, 512);
    }

    // Diamond floral/geometric subtle wallpaper overlay
    ctx.strokeStyle = 'rgba(120, 100, 30, 0.25)';
    ctx.lineWidth = 3;
    for (let y = 0; y < 512; y += 64) {
      for (let x = 0; x < 512; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x + 32, y);
        ctx.lineTo(x + 64, y + 32);
        ctx.lineTo(x + 32, y + 64);
        ctx.lineTo(x, y + 32);
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Moisture / Mold / Grime spots
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 25;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('wallpaper_yellow', texture);
    return texture;
  }

  /**
   * Generates a damp yellow-brown carpet texture with mottled fiber noise
   */
  public static DAMP_CARPET(): THREE.CanvasTexture {
    if (this.cache.has('carpet_yellow')) return this.cache.get('carpet_yellow')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base carpet dirty yellow-brown
    ctx.fillStyle = '#82743f';
    ctx.fillRect(0, 0, 512, 512);

    // Mottled damp stains
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 20 + Math.random() * 60;
      const grad = ctx.createRadialGradient(x, y, 5, x, y, r);
      grad.addColorStop(0, 'rgba(60, 50, 20, 0.6)');
      grad.addColorStop(1, 'rgba(130, 116, 63, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fiber noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 35;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('carpet_yellow', texture);
    return texture;
  }

  /**
   * Generates office drop-ceiling tiles with metal grid and fluorescent light cuts
   */
  public static CEILING_TILES(): THREE.CanvasTexture {
    if (this.cache.has('ceiling_tiles')) return this.cache.get('ceiling_tiles')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Aged cream acoustic tile
    ctx.fillStyle = '#dcd5c2';
    ctx.fillRect(0, 0, 512, 512);

    // Acoustic pin-hole dots
    ctx.fillStyle = '#9c9480';
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillRect(x, y, 2, 2);
    }

    // Grid metal rails
    ctx.strokeStyle = '#6e685a';
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, 512, 512);
    ctx.beginPath();
    ctx.moveTo(256, 0); ctx.lineTo(256, 512);
    ctx.moveTo(0, 256); ctx.lineTo(512, 256);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('ceiling_tiles', texture);
    return texture;
  }

  /**
   * Level 1: Gritty concrete texture with cracks and damp patches
   */
  public static CONCRETE(): THREE.CanvasTexture {
    if (this.cache.has('concrete')) return this.cache.get('concrete')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#484b50';
    ctx.fillRect(0, 0, 512, 512);

    // Cracks
    ctx.strokeStyle = '#222428';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = Math.random() * 512;
      ctx.moveTo(x, y);
      for (let j = 0; j < 6; j++) {
        x += (Math.random() - 0.5) * 80;
        y += (Math.random() - 0.5) * 80;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 40;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('concrete', texture);
    return texture;
  }

  /**
   * Level 37: Poolrooms pristine white tile with cyan grout
   */
  public static POOL_TILES(): THREE.CanvasTexture {
    if (this.cache.has('pool_tiles')) return this.cache.get('pool_tiles')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#eaf7f9';
    ctx.fillRect(0, 0, 512, 512);

    // Cyan grout grid lines
    ctx.strokeStyle = '#82c0c7';
    ctx.lineWidth = 4;
    const tileSize = 64;
    for (let x = 0; x <= 512; x += tileSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    for (let y = 0; y <= 512; y += tileSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }

    // Subtle tile gradient sheen
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(1, 'rgba(180, 220, 230, 0.2)');
        ctx.fillStyle = grad;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('pool_tiles', texture);
    return texture;
  }

  /**
   * Level !: Emergency Hospital Corridor Wall
   */
  public static RED_HOSPITAL_WALL(): THREE.CanvasTexture {
    if (this.cache.has('red_hospital')) return this.cache.get('red_hospital')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#4a080a';
    ctx.fillRect(0, 0, 512, 512);

    // Warning hazard stripes at top and bottom
    ctx.fillStyle = '#e60000';
    ctx.fillRect(0, 180, 512, 150);

    ctx.fillStyle = '#111';
    for (let x = -200; x < 700; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 180);
      ctx.lineTo(x + 40, 180);
      ctx.lineTo(x - 20, 330);
      ctx.lineTo(x - 60, 330);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('red_hospital', texture);
    return texture;
  }

  /**
   * Smiler Entity Glow Face Texture
   */
  public static SMILER_FACE(): THREE.CanvasTexture {
    if (this.cache.has('smiler_face')) return this.cache.get('smiler_face')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 256, 256);

    // Glowing white eyes
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.ellipse(80, 90, 20, 28, Math.PI / 12, 0, Math.PI * 2);
    ctx.ellipse(176, 90, 20, 28, -Math.PI / 12, 0, Math.PI * 2);
    ctx.fill();

    // Creepy wide jagged teeth smile
    ctx.beginPath();
    ctx.arc(128, 130, 75, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Draw sharp teeth lines
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';
    for (let i = 70; i <= 186; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, 165);
      ctx.lineTo(i, 195);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('smiler_face', texture);
    return texture;
  }
}
