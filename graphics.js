function sceneInit() {
  isInvincible = false; spikeAlive = true; spikeStunned = false; spikeFallingToLava = false;
  saws = []; lives = GAME_CONFIG.LIVES_START; buttonPressed = false; gameWon = false; gameOverActive = false;
  levelTransition = false;
  winParticles = null; doorOpen = false; spikeVelX = 0; lavaBubbles = []; heartIcons = [];
  movingPlatforms = []; lasers = []; bats = []; windZones = []; bgStars = [];
  keys = { left: false, right: false, up: false, down: false, space: false };
  if (invincibleTimer) invincibleTimer.remove();
  if (stunTimer) stunTimer.remove();
  if (blinkTimer) blinkTimer.remove();

  lavaCover = null; lavaCoverBody = null; lavaCoverCollider = null;
  lavaButton = null; btnBase = null;
  doorContainer = null; doorFrame = null; doorGlow = null;
  finishZone = null; lavaZone = null;
  spike = null; lavaGfx = null; lavaGlow = null;
  damageFlash = null; gameScene = null;
}

function scenePreload() {
  this.load.spritesheet('dude', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
  this.load.image('spike', 'https://labs.phaser.io/assets/sprites/spikedball.png');
  this.load.image('saw', 'https://labs.phaser.io/assets/sprites/saw.png');
}

function drawPlatform(gfx, cx, cy, w, h) {
  const x = cx - w/2, y = cy - h/2;
  gfx.fillStyle(0x000000, 0.3);
  gfx.fillRect(x + 4, y + h + 3, w, 6);
  gfx.fillStyle(0x3E2723);
  gfx.fillRect(x, y + h - 4, w, 4);
  gfx.fillStyle(0x4E342E);
  gfx.fillRect(x + w - 4, y, 4, h);
  gfx.fillStyle(0x5D4037);
  gfx.fillRect(x, y, 4, h);
  gfx.fillStyle(0x6D4C41);
  gfx.fillRect(x + 4, y + 4, w - 8, h - 8);
  gfx.fillStyle(0x8D6E63);
  gfx.fillRect(x + 4, y, w - 8, 4);
  gfx.fillStyle(0xA1887F, 0.45);
  gfx.fillRect(x + 8, y + 6, w - 16, 2);
  gfx.fillStyle(0x4E342E, 0.4);
  for (let i = x + 14; i < x + w - 8; i += 20) gfx.fillRect(i, y + 9, 1.5, h - 15);
  gfx.fillStyle(0x3E2723);
  const bolts = [[x+7,y+7],[x+w-7,y+7],[x+7,y+h-7],[x+w-7,y+h-7]];
  bolts.forEach(([bx,by])=>{
    gfx.fillCircle(bx, by, 2.5);
    gfx.fillStyle(0x8D6E63, 0.6); gfx.fillCircle(bx-0.5, by-0.5, 1.2); gfx.fillStyle(0x3E2723);
  });
}

function createHeart(scene, x, y, scale = 1) {
  const container = scene.add.container(x, y);
  const g = scene.add.graphics();
  const s = 11 * scale;
  g.fillStyle(0xFF5252, 0.2);
  g.fillCircle(0, 0, s * 1.4);
  g.fillStyle(0xFF5252);
  g.fillCircle(-s * 0.5, -s * 0.25, s * 0.55);
  g.fillCircle(s * 0.5, -s * 0.25, s * 0.55);
  g.fillTriangle(-s * 1.05, -s * 0.05, s * 1.05, -s * 0.05, 0, s * 1.0);
  g.fillStyle(0xFF8A80, 0.8);
  g.fillCircle(-s * 0.22, -s * 0.05, s * 0.2);
  container.add(g);
  return container;
}

function drawHearts(scene) {
  heartIcons.forEach(h => h.destroy());
  heartIcons = [];
  for (let i = 0; i < lives; i++) {
    const h = createHeart(scene, 24 + i * 30, 26);
    h.setDepth(1000);
    heartIcons.push(h);
  }
}

function drawLavaCover(scene, ld) {
  if (!ld.hasLava || !lavaCover) return;
  lavaCover.clear();
  const w = ld.lavaRight - ld.lavaLeft;
  const plankW = w / 6;
  for (let i = 0; i < 6; i++) {
    const px = ld.lavaLeft + i * plankW;
    lavaCover.fillStyle(0x000000, 0.35);
    lavaCover.fillRect(px + 1, ld.groundTop - 6, plankW - 2, 22);
    lavaCover.fillStyle(0x5D4037);
    lavaCover.fillRect(px, ld.groundTop - 10, plankW - 2, 20);
    lavaCover.fillStyle(0x8D6E63);
    lavaCover.fillRect(px, ld.groundTop - 10, plankW - 2, 3);
    lavaCover.fillStyle(0x3E2723);
    lavaCover.fillRect(px, ld.groundTop + 7, plankW - 2, 3);
    lavaCover.fillStyle(0x4E342E, 0.3);
    lavaCover.fillRect(px + 4, ld.groundTop - 6, 1, 12);
    lavaCover.fillRect(px + plankW - 6, ld.groundTop - 6, 1, 12);
    lavaCover.fillStyle(0x3E2723);
    lavaCover.fillCircle(px + plankW/2 - 1, ld.groundTop, 1.5);
    lavaCover.fillStyle(0xA1887F, 0.5);
    lavaCover.fillCircle(px + plankW/2 - 1.5, ld.groundTop - 0.5, 0.8);
  }
  lavaCover.fillStyle(0x4E342E);
  lavaCover.fillRect(ld.lavaLeft - 4, ld.groundTop - 12, 4, 24);
  lavaCover.fillRect(ld.lavaRight, ld.groundTop - 12, 4, 24);
}

// ===== BIRD TEXTURE GENERATOR =====
function generateBirdTexture(scene) {
  if (scene.textures.exists('bird')) return;
  
  const size = 48;
  const gfx = scene.make.graphics({x:0,y:0,add:false});
  
  // Body - orange/yellow bird
  gfx.fillStyle(0xFF9800);
  gfx.fillEllipse(size/2, size/2 + 2, 22, 16);
  
  // Belly - lighter
  gfx.fillStyle(0xFFCC80);
  gfx.fillEllipse(size/2, size/2 + 6, 14, 10);
  
  // Head
  gfx.fillStyle(0xFF9800);
  gfx.fillCircle(size/2 + 8, size/2 - 6, 9);
  
  // Eye white
  gfx.fillStyle(0xFFFFFF);
  gfx.fillCircle(size/2 + 10, size/2 - 8, 4);
  
  // Eye pupil
  gfx.fillStyle(0x212121);
  gfx.fillCircle(size/2 + 11, size/2 - 8, 2);
  
  // Eye shine
  gfx.fillStyle(0xFFFFFF);
  gfx.fillCircle(size/2 + 12, size/2 - 9, 1);
  
  // Beak
  gfx.fillStyle(0xFF5722);
  gfx.fillTriangle(size/2 + 16, size/2 - 6, size/2 + 24, size/2 - 4, size/2 + 16, size/2 - 2);
  
  // Wing (left, darker)
  gfx.fillStyle(0xE65100);
  gfx.fillEllipse(size/2 - 4, size/2, 14, 8);
  
  // Wing highlight
  gfx.fillStyle(0xFFB74D);
  gfx.fillEllipse(size/2 - 2, size/2 - 1, 10, 5);
  
  // Tail feathers
  gfx.fillStyle(0xE65100);
  gfx.fillTriangle(size/2 - 12, size/2 + 2, size/2 - 20, size/2 - 2, size/2 - 12, size/2 + 6);
  gfx.fillTriangle(size/2 - 12, size/2 + 4, size/2 - 18, size/2 + 6, size/2 - 12, size/2 + 8);
  
  // Legs
  gfx.fillStyle(0xFF5722);
  gfx.fillRect(size/2 - 3, size/2 + 10, 2, 5);
  gfx.fillRect(size/2 + 1, size/2 + 10, 2, 5);
  
  // Outline glow for visibility
  gfx.lineStyle(1.5, 0xFFE0B2, 0.6);
  gfx.strokeEllipse(size/2, size/2 + 2, 22, 16);
  gfx.strokeCircle(size/2 + 8, size/2 - 6, 9);
  
  gfx.generateTexture('bird', size, size);
}