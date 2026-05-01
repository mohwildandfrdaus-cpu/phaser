function sceneCreate() {
  gameScene = this;
  const ld = getLevelData();
  this.cameras.main.setBackgroundColor(ld.bg);
  this.game.canvas.setAttribute('tabindex', '0');
  this.game.canvas.focus();
  this.physics.world.setBounds(0, 0, 800, 1000);

  // ===== ENHANCED BACKGROUND =====
  const bgGfx = this.add.graphics();
  bgGfx.setDepth(-10);
  bgGfx.fillGradientStyle(0x1a237e, 0x1a237e, 0x0d47a1, 0x0d47a1, 0.15);
  bgGfx.fillRect(0, 0, 800, 600);

  for (let i = 0; i < 5; i++) {
    const nx = 100 + Math.random() * 600;
    const ny = 50 + Math.random() * 400;
    const nr = 60 + Math.random() * 100;
    bgGfx.fillStyle(0x4a148c, 0.06);
    bgGfx.fillCircle(nx, ny, nr);
    bgGfx.fillStyle(0x1a237e, 0.08);
    bgGfx.fillCircle(nx + 20, ny + 10, nr * 0.6);
  }

  const starGfx = this.make.graphics({x:0,y:0,add:false});
  starGfx.fillStyle(0xffffff, 1);
  starGfx.fillCircle(3, 3, 3);
  starGfx.fillStyle(0xFFE0B2, 0.8);
  starGfx.fillCircle(3, 3, 1.5);
  starGfx.generateTexture('star_glow', 6, 6);

  for (let i = 0; i < 80; i++) {
    const sx = 20 + Math.random() * 760;
    const sy = 20 + Math.random() * 450;
    const star = this.add.image(sx, sy, 'star_glow');
    const baseAlpha = 0.4 + Math.random() * 0.6;
    star.setAlpha(baseAlpha);
    star.setScale(0.4 + Math.random() * 0.8);
    star.setDepth(-5);
    bgStars.push({
      sprite: star,
      baseAlpha: baseAlpha,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5
    });
  }

  const groundGfx = this.add.graphics();
  groundGfx.setDepth(10);
  if (ld.hasLava) {
    groundGfx.fillStyle(0x0d0806);
    groundGfx.fillRect(ld.lavaLeft, ld.groundTop + 5, ld.lavaRight - ld.lavaLeft, 40);
  }
  ld.groundSegments.forEach(seg => {
    const left = seg.x - seg.w/2;
    groundGfx.fillStyle(0x3E2723); groundGfx.fillRect(left, ld.groundTop + 10, seg.w, 30);
    groundGfx.fillStyle(0x5D4037); groundGfx.fillRect(left, ld.groundTop + 2, seg.w, 8);
    groundGfx.fillStyle(0x66BB6A); groundGfx.fillRect(left, ld.groundTop, seg.w, 4);
    groundGfx.fillStyle(0x388E3C); groundGfx.fillRect(left, ld.groundTop + 4, seg.w, 3);
    groundGfx.fillStyle(0x43A047);
    for (let gx = left + 5; gx < left + seg.w - 5; gx += 8 + Math.random()*6) {
      const gh = 3 + Math.random()*4;
      groundGfx.fillRect(gx, ld.groundTop - gh, 2, gh);
    }
  });

  const groundZones = [];
  ld.groundSegments.forEach(seg => {
    const z = this.add.rectangle(seg.x, ld.groundTop + 20, seg.w, 40);
    this.physics.add.existing(z, true); z.body.updateFromGameObject(); groundZones.push(z);
  });

  lavaGfx = this.add.graphics();
  lavaGfx.setDepth(5);
  if (ld.hasLava) {
    lavaGlow = this.add.graphics();
    lavaGlow.setDepth(4);
  }

  if (ld.hasLava && ld.hasButton) {
    lavaCover = this.add.graphics();
    lavaCover.setDepth(15);
    drawLavaCover(this, ld);
    lavaCoverBody = this.add.rectangle(ld.lavaCenter, ld.groundTop, ld.lavaRight - ld.lavaLeft, 20);
    this.physics.add.existing(lavaCoverBody, true); lavaCoverBody.body.updateFromGameObject(); lavaCoverBody.setVisible(false);
  }

  const platZones = [];
  const platGfx = this.add.graphics();
  platGfx.setDepth(10);
  for (const p of ld.staticPlats) {
    drawPlatform(platGfx, p.x, p.y, 100, 20);
    const z = this.add.rectangle(p.x, p.y, 100, 20);
    this.physics.add.existing(z, true); z.body.updateFromGameObject(); platZones.push(z);
  }

  if (ld.movingPlats) {
    for (const mp of ld.movingPlats) {
      const mg = this.add.graphics();
      mg.setDepth(10);
      drawPlatform(mg, mp.x, mp.y, mp.w, mp.h);
      const body = this.add.rectangle(mp.x, mp.y, mp.w, mp.h);
      this.physics.add.existing(body, false);
      body.body.setImmovable(true);
      body.body.setAllowGravity(false);
      body.body.moves = false;
      platZones.push(body);
      movingPlatforms.push({
        gfx: mg, body: body,
        origX: mp.x, origY: mp.y,
        axis: mp.axis, range: mp.range, speed: mp.speed,
        w: mp.w, h: mp.h,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  drawHearts(this);

  damageFlash = this.add.rectangle(400, 300, 800, 600, 0xFF0000, 0);
  damageFlash.setDepth(2000);

  if (!this.anims.exists('left')) this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
  if (!this.anims.exists('turn')) this.anims.create({ key: 'turn', frames: [{ key: 'dude', frame: 4 }] });
  if (!this.anims.exists('right')) this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }), frameRate: 10, repeat: -1 });

  player = this.physics.add.sprite(ld.startPos.x, ld.startPos.y, 'dude');
  player.setDepth(100);
  player.setCollideWorldBounds(true); player.body.setSize(30, 46); player.setBounce(0.1);
  groundZones.forEach(z => this.physics.add.collider(player, z));
  if (lavaCoverBody) lavaCoverCollider = this.physics.add.collider(player, lavaCoverBody);
  platZones.forEach(z => this.physics.add.collider(player, z));

  if (ld.hasButton && ld.buttonPos) {
    const btnX = ld.buttonPos.x, btnY = ld.buttonPos.y, btnR = 6;
    btnBase = this.add.graphics();
    btnBase.setDepth(100);
    btnBase.fillStyle(0x263238); btnBase.fillRoundedRect(btnX - 12, btnY - 2, 24, 5, 2);
    btnBase.lineStyle(1, 0x455A64); btnBase.strokeRoundedRect(btnX - 12, btnY - 2, 24, 5, 2);

    lavaButton = this.add.container(btnX, btnY - 5);
    lavaButton.setDepth(100);
    const buttonDome = this.add.graphics();
    buttonDome.fillStyle(0xB71C1C); buttonDome.fillCircle(0, 1.5, btnR);
    buttonDome.fillStyle(0xE53935); buttonDome.fillCircle(0, 0.5, btnR);
    buttonDome.fillStyle(0xFF8A80); buttonDome.fillCircle(-2.5, -2, 2.5);
    buttonDome.lineStyle(1.5, 0x8B0000, 0.6);
    buttonDome.strokeCircle(0, 0.5, btnR);
    lavaButton.add(buttonDome);

    const buttonZone = this.add.zone(btnX, btnY - 4, 18, 16);
    this.physics.add.existing(buttonZone, true);
    this.physics.add.overlap(player, buttonZone, () => { playerOnButton = true; });
    const btnHint = this.add.text(btnX, btnY - 28, '↓', { fontSize: '16px', fontFamily: 'monospace', color: '#ffb74d' }).setOrigin(0.5).setAlpha(0).setDepth(101);
    this.time.addEvent({ delay: 100, loop: true, callback: () => { btnHint.setAlpha(playerOnButton && !buttonPressed ? 1 : 0); } });
  }

  if (ld.hasSpike && ld.spikeRespawn) {
    spike = this.physics.add.sprite(ld.spikeRespawn.x, ld.spikeRespawn.y, 'spike');
    spike.setDepth(100);
    spike.setScale(0.5); spike.setOrigin(0.5, 0.5);
    spike.body.setAllowGravity(false); spike.body.setImmovable(true); spike.body.setSize(16, 16);
    this.physics.add.overlap(player, spike, () => {
      if (!spikeAlive || isInvincible || spikeFallingToLava) return;
      if (player.body.velocity.y > 0 && player.y + 20 > spike.y && player.y < spike.y + 10) killSpike();
      else takeDamage();
    });
    Audio.startSpikeHum();
  } else {
    spike = null;
  }

  function addStaticSaw(x, y, scaleVal, speedVal) {
    const saw = this.add.sprite(x, y, 'saw').setScale(scaleVal);
    saw.setDepth(100);
    this.physics.add.existing(saw, true);
    saw.body.setCircle(16 * scaleVal); saw.body.updateFromGameObject();
    this.physics.add.overlap(player, saw, () => { if (!isInvincible && lives > 0) takeDamage(); });
    saws.push({ sprite: saw, speed: Math.min(GAME_CONFIG.STATIC_SAW_SPEED_CAP, Math.abs(speedVal)) * Math.sign(speedVal) });
  }
  for (const s of ld.staticSaws) {
    addStaticSaw.call(this, s.x, s.y, s.scale, s.speed);
  }
  Audio.startSawHum();

  if (ld.lasers) {
    for (const l of ld.lasers) {
      const g = this.add.graphics();
      g.setDepth(100);
      const zone = this.add.zone(l.x, l.y, l.w, l.h);
      this.physics.add.existing(zone, true);
      this.physics.add.overlap(player, zone, () => { if (!isInvincible && lives > 0) takeDamage(); });
      lasers.push({
        gfx: g, zone: zone,
        x: l.x, y: l.y, w: l.w, h: l.h,
        onTime: l.onTime, offTime: l.offTime,
        active: true, timer: 0, lastState: true
      });
    }
  }

  if (ld.bats) {
    generateBirdTexture(this);
    for (const b of ld.bats) {
      const bird = this.add.sprite(b.x, b.y, 'bird');
      bird.setDepth(100);
      bird.setScale(0.9);
      this.physics.add.existing(bird, false);
      bird.body.setImmovable(true);
      bird.body.setAllowGravity(false);
      bird.body.moves = false;
      bird.body.setSize(28, 24);
      this.physics.add.overlap(player, bird, () => { if (!isInvincible && lives > 0) takeDamage(); });
      bats.push({
        sprite: bird,
        origX: b.x, origY: b.y,
        range: b.range, speed: b.speed,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  if (ld.windZones) {
    for (const w of ld.windZones) {
      const g = this.add.graphics();
      g.setDepth(3);
      windZones.push({ gfx: g, x: w.x, y: w.y, w: w.w, h: w.h, forceX: w.forceX });
    }
  }

  const dX = ld.doorPos.x, dY = ld.doorPos.y, dW = 18, dH = 30;
    doorFrame = this.add.graphics();
  doorFrame.setDepth(100);
  // Bingkai bawah dihapus — hanya sisa tiang kiri, kanan, dan atas
  doorFrame.fillStyle(0x4E342E);
  doorFrame.fillRect(dX - dW/2 - 2, dY - dH, 2, dH);   // tiang kiri (tinggi dH, berhenti di dasar pintu)
  doorFrame.fillRect(dX + dW/2, dY - dH, 2, dH);       // tiang kanan
  doorFrame.fillRect(dX - dW/2 - 2, dY - dH, dW + 4, 2); // lintel atas

  doorContainer = this.add.container(dX - dW/2, dY);
  doorContainer.setDepth(100);
  const doorPanel = this.add.graphics();
  doorPanel.fillStyle(0x4E342E); doorPanel.fillRect(0, -dH, dW, dH);
  doorPanel.fillStyle(0x6D4C41); doorPanel.fillRect(1, -dH + 1, 7, dH - 2); doorPanel.fillRect(9, -dH + 1, 8, dH - 2);
  doorPanel.lineStyle(1, 0x3E2723); doorPanel.lineBetween(8.5, -dH + 1, 8.5, -1);
  doorPanel.lineStyle(0.5, 0x3E2723, 0.3);
  for (let i = -dH + 5; i < -2; i += 5) doorPanel.lineBetween(1, i, dW - 1, i);
  doorPanel.fillStyle(0x757575); doorPanel.fillRect(-1, -dH + 4, 2, 3); doorPanel.fillRect(-1, -5, 2, 3);
  doorPanel.fillStyle(0xBDBDBD); doorPanel.fillCircle(dW - 4, -dH/2, 2.5);
  doorPanel.fillStyle(0xFFFFFF); doorPanel.fillCircle(dW - 5, -dH/2 - 1, 1);
  doorContainer.add(doorPanel);

  doorGlow = this.add.graphics();
  doorGlow.setDepth(100);
  doorGlow.fillStyle(0x00E676, 0); doorGlow.fillRect(dX + dW/2 - 1, dY - dH + 2, 3, dH - 4);

  finishZone = this.add.zone(dX, dY - dH/2, dW + 2, dH);
  this.physics.add.existing(finishZone, true);
  this.physics.add.overlap(player, finishZone, () => { if (!gameWon && !doorOpen && !levelTransition) openDoor(this); });

  if (ld.hasLava) {
    lavaZone = this.add.zone(ld.lavaCenter, ld.groundTop + 30, ld.lavaRight - ld.lavaLeft, 20);
    this.physics.add.existing(lavaZone, true);
    this.physics.add.overlap(player, lavaZone, () => {
      if (!isInvincible && lives > 0 && (!lavaCover || buttonPressed)) takeDamage();
    });
  }

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  this.events.on('shutdown', () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  });
}

function sceneUpdate() {
  const time = this.time.now;
  const ld = getLevelData();

  for (const s of bgStars) {
    const twinkle = Math.sin(time * 0.001 * s.speed + s.phase) * 0.3 + 0.7;
    s.sprite.setAlpha(s.baseAlpha * twinkle);
  }

  for (const saw of saws) saw.sprite.angle += saw.speed;

  for (const mp of movingPlatforms) {
    const t = time * 0.001 * mp.speed + mp.phase;
    let nx = mp.origX, ny = mp.origY;
    if (mp.axis === 'x') nx += Math.sin(t) * mp.range;
    else ny += Math.sin(t) * mp.range;

    // Update physics body position properly
    mp.body.setPosition(nx, ny);
    mp.body.body.updateFromGameObject();

    mp.gfx.clear();
    drawPlatform(mp.gfx, nx, ny, mp.w, mp.h);
  }

  for (const l of lasers) {
    l.timer += 16;
    const cycle = l.onTime + l.offTime;
    const phase = l.timer % cycle;
    const wasActive = l.active;
    l.active = phase < l.onTime;
    if (l.active !== l.lastState) {
      l.lastState = l.active;
      l.gfx.clear();
      if (l.active) {
        l.gfx.fillStyle(0xFF1744, 0.3);
        l.gfx.fillRect(l.x - l.w/2 - 3, l.y - l.h/2 - 3, l.w + 6, l.h + 6);
        l.gfx.fillStyle(0xFF5252, 0.95);
        l.gfx.fillRect(l.x - l.w/2, l.y - l.h/2, l.w, l.h);
        l.gfx.fillStyle(0xFFFFFF, 0.7);
        l.gfx.fillRect(l.x - l.w/2 + 1, l.y - l.h/2 + 1, l.w - 2, l.h - 2);
      }
    }
    l.zone.body.enable = l.active;
  }

  for (const b of bats) {
    const t = time * 0.001 * b.speed + b.phase;
    const nx = b.origX + Math.sin(t) * b.range;
    const ny = b.origY + Math.sin(t * 2.3) * 15;
    const prevX = b.sprite.x;
    b.sprite.x = nx;
    b.sprite.y = ny;
    b.sprite.body.updateFromGameObject();
    if (nx > prevX + 0.1) b.sprite.setFlipX(false);
    else if (nx < prevX - 0.1) b.sprite.setFlipX(true);

    const flap = Math.sin(time * 0.012);
    b.sprite.scaleY = 0.9 + flap * 0.12;
    b.sprite.scaleX = 0.9 - flap * 0.05;
    b.sprite.angle = Math.sin(t) * 8;
  }

  for (const w of windZones) {
    w.gfx.clear();
    w.gfx.fillStyle(0x81D4FA, 0.08);
    w.gfx.fillRect(w.x - w.w/2, w.y - w.h/2, w.w, w.h);
    const windDir = w.forceX > 0 ? 1 : -1;
    for (let i = 0; i < 3; i++) {
      const px = w.x - w.w/2 + ((time * 0.05 + i * 40) % w.w);
      const py = w.y - w.h/2 + 15 + i * (w.h/3);
      w.gfx.fillStyle(0xB3E5FC, 0.25);
      w.gfx.fillRect(px, py, 12 * windDir, 2);
    }
  }

  if (ld.hasLava) {
    lavaGfx.clear();
    if (lavaGlow) lavaGlow.clear();

    const lw = ld.lavaRight - ld.lavaLeft;

    if (lavaGlow) {
      lavaGlow.fillStyle(0xFF3D00, 0.08);
      lavaGlow.fillRect(ld.lavaLeft - 30, ld.groundTop - 20, lw + 60, 70);
      lavaGlow.fillStyle(0xFF6D00, 0.12);
      lavaGlow.fillRect(ld.lavaLeft - 15, ld.groundTop - 10, lw + 30, 50);
    }

    lavaGfx.fillStyle(0x1a0200, 0.98);
    lavaGfx.fillRect(ld.lavaLeft - 10, ld.groundTop + 2, lw + 20, 42);

    for (let layer = 0; layer < 3; layer++) {
      const speed = 0.0025 + layer * 0.0012;
      const amp = 4 + layer * 2;
      const yBase = ld.groundTop + 18 + layer * 5;
      const colors = [0xFF3D00, 0xFF9100, 0xFFD180];
      const alphas = [0.85, 0.6, 0.35];
      lavaGfx.fillStyle(colors[layer], alphas[layer]);
      lavaGfx.beginPath();
      lavaGfx.moveTo(ld.lavaLeft, yBase + 14);
      for (let x = 0; x <= lw; x += 8) {
        const waveY = Math.sin((x * 0.03) + (time * speed * (layer % 2 === 0 ? 1 : -1)) + (layer * 2.7)) * amp;
        lavaGfx.lineTo(ld.lavaLeft + x, yBase + waveY);
      }
      lavaGfx.lineTo(ld.lavaRight, ld.groundTop + 46);
      lavaGfx.lineTo(ld.lavaLeft, ld.groundTop + 46);
      lavaGfx.closePath();
      lavaGfx.fillPath();
    }

    if (Math.random() < 0.02 && lavaBubbles.length < 15) {
      lavaBubbles.push({
        x: ld.lavaLeft + 15 + Math.random() * (lw - 30),
        y: ld.groundTop + 32,
        r: 2 + Math.random() * 5,
        speed: 0.6 + Math.random() * 1.2,
        life: 1,
        maxR: 2 + Math.random() * 5,
        pop: false
      });
    }
    lavaBubbles = lavaBubbles.filter(b => {
      b.y -= b.speed;
      b.life -= 0.014;
      const pulse = Math.sin(time * 0.015 + b.x) * 0.35 + 0.65;
      const curR = b.maxR * pulse * b.life;
      if (b.life > 0 && curR > 0.5) {
        lavaGfx.fillStyle(0xFFCC80, b.life * 0.9);
        lavaGfx.fillCircle(b.x, b.y, curR);
        lavaGfx.fillStyle(0xFFFFFF, b.life * 0.7);
        lavaGfx.fillCircle(b.x - curR*0.35, b.y - curR*0.35, curR * 0.4);
        lavaGfx.lineStyle(1, 0xFF7043, b.life * 0.5);
        lavaGfx.strokeCircle(b.x, b.y, curR);
        return true;
      }
      if (!b.pop && b.life <= 0) {
        b.pop = true;
        lavaGfx.fillStyle(0xFFEB3B, 0.6);
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI * 2 / 4) * i;
          lavaGfx.fillCircle(b.x + Math.cos(angle)*6, b.y + Math.sin(angle)*6, 1.5);
        }
      }
      return false;
    });
  }

  if (gameOverActive) return;
  if (gameWon) { player.setVelocity(0, 0); player.anims.play('turn'); return; }
  if (levelTransition) return;

  const speed = 200, jumpPower = GAME_CONFIG.PLAYER_JUMP_POWER, airCtrl = 0.67;
  if (keys.left) { player.setVelocityX(player.body.touching.down ? -speed : -speed * airCtrl); player.anims.play('left', true); }
  else if (keys.right) { player.setVelocityX(player.body.touching.down ? speed : speed * airCtrl); player.anims.play('right', true); }
  else { player.setVelocityX(0); player.anims.play('turn'); }

  if (keys.up && player.body.touching.down) { player.setVelocityY(-jumpPower); if (!Settings.muted) Audio.jump(); }
  if (keys.down && playerOnButton && !buttonPressed) {
    if (!Settings.muted) Audio.button();
    gameScene.tweens.add({ targets: lavaButton, y: '+=2', duration: 50, yoyo: true });
    openLavaCover(gameScene, getLevelData());
  }
  playerOnButton = false;
  if (player.y > 650) takeDamage();

  for (const w of windZones) {
    const dx = player.x - w.x;
    const dy = player.y - w.y;
    if (Math.abs(dx) < w.w/2 && Math.abs(dy) < w.h/2) {
      player.body.velocity.x += w.forceX * 0.025;
    }
  }

  if (spike && spikeAlive && !spikeStunned && !spikeFallingToLava) {
    const deltaX = player.x - spike.x;
    if (buttonPressed && spike.x > ld.lavaLeft && spike.x < ld.lavaRight) {
      spikeFallingToLava = true; spikeAlive = false; spike.body.setAllowGravity(true); spike.body.setImmovable(false); Audio.stopSpikeHum();
    } else {
      const maxSpeed = 3.2, accel = 0.14, friction = 0.92;
      if (Math.abs(deltaX) > 30) spikeVelX += Math.sign(deltaX) * accel;
      else spikeVelX *= friction;
      spikeVelX = Math.max(-maxSpeed, Math.min(maxSpeed, spikeVelX));
      spike.x += spikeVelX;
      const spd = Math.abs(spikeVelX);
      const rollPhase = (spike.x * 0.08) + (time * 0.007);
      const bounceH = Math.min(spd * 5.5, 16);
      const bounceY = Math.abs(Math.sin(rollPhase * Math.PI)) * bounceH;
      spike.y = (ld.groundTop - 16) - bounceY;
      const onGround = Math.sin(rollPhase * Math.PI) < 0.25;
      if (onGround) spike.setScale(0.52 + spd * 0.015, 0.48 - spd * 0.015);
      else spike.setScale(0.48 - spd * 0.008, 0.52 + spd * 0.008);
      spike.angle += spikeVelX * 4.5;
    }
  }

  if (spike && spikeFallingToLava && spike.y > ld.groundTop + 12) {
    spike.setVisible(false); spike.body.enable = false; spikeFallingToLava = false;
    if (!Settings.muted) Audio.spikeFall();
    const splash = gameScene.add.particles(spike.x, ld.groundTop + 20, 'spike', {
      scale: { start: 0.15, end: 0 }, speed: { min: 60, max: 160 }, lifespan: 600, quantity: 10, tint: [0xFF7043, 0xFFB74D]
    });
    gameScene.time.delayedCall(800, () => splash.destroy());
  }

  if (spike && spikeAlive && Audio.spikeActive && Audio.spikeFilter) {
    const dist = Math.abs(player.x - spike.x);
    Audio.spikeFilter.frequency.setTargetAtTime(Math.max(200, 800 - dist), Audio.ctx.currentTime, 0.1);
  }
}

function openDoor(scene) {
  doorOpen = true;
  if (!Settings.muted) Audio.doorCreak();
  const ld = getLevelData();
  const glowX = ld.doorPos.x + 9;
  const glowY = ld.doorPos.y - 28;
  scene.tweens.add({
    targets: doorGlow, alpha: 1, duration: 400,
    onUpdate: function(tween, target) {
      target.clear(); target.fillStyle(0x00E676, tween.getValue() * 0.5); target.fillRect(glowX, glowY, 4, 26);
    }
  });
  scene.tweens.add({
    targets: doorContainer, scaleX: 0.1, duration: 600, ease: 'Cubic.easeInOut',
    onComplete: () => {
      if (doorContainer) { doorContainer.destroy(); doorContainer = null; }
      if (doorFrame) { doorFrame.destroy(); doorFrame = null; }
      if (doorGlow) { doorGlow.destroy(); doorGlow = null; }
      gameWon = true;
      if (!Settings.muted) Audio.win();
      spawnWinParticles(scene, ld.doorPos.x, ld.doorPos.y - 15);
      scene.time.delayedCall(2500, () => { levelTransition = true; nextLevel(scene); });
    }
  });
}

function spawnWinParticles(scene, x, y) {
  winParticles = scene.add.particles(x, y, 'star_glow', {
    speed: { min: 40, max: 120 },
    angle: { min: 200, max: 340 },
    scale: { start: 0.8, end: 0 },
    lifespan: 1200,
    quantity: 2,
    frequency: 80,
    tint: [0x00E676, 0x69F0AE, 0xB9F6CA],
    blendMode: 'ADD'
  });
  scene.time.delayedCall(2000, () => { if (winParticles) { winParticles.destroy(); winParticles = null; } });
}

function nextLevel(scene) {
  if (currentLevel < totalLevels) {
    currentLevel++;
    if (!Settings.muted) Audio.levelUp();
    scene.cameras.main.fadeOut(600, 0, 0, 0);
    scene.time.delayedCall(700, () => {
      Audio.stopBGM(); Audio.stopSawHum(); Audio.stopSpikeHum();
      // Proper cleanup before restart
      cleanupScene();
      scene.scene.restart();
      const lbl = document.getElementById('levelLabel');
      if (lbl) lbl.textContent = 'LEVEL ' + currentLevel;
    });
  } else {
    showGameComplete(scene);
  }
}

function cleanupScene() {
  movingPlatforms = []; lasers = []; bats = []; windZones = []; saws = []; bgStars = [];
  lavaBubbles = []; heartIcons = [];
  if (invincibleTimer) invincibleTimer.remove();
  if (stunTimer) stunTimer.remove();
  if (blinkTimer) blinkTimer.remove();
}

function showGameComplete(scene) {
  gameOverActive = true;
  const overlay = scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
  overlay.setDepth(3000);
  const title = scene.add.text(400, 240, 'SELAMAT!', { fontSize: '48px', fontFamily: 'monospace', color: '#00E676', fontStyle: 'bold' }).setOrigin(0.5);
  title.setDepth(3001);
  const sub = scene.add.text(400, 310, 'Semua level selesai!', { fontSize: '20px', fontFamily: 'monospace', color: '#ffb74d' }).setOrigin(0.5);
  sub.setDepth(3001);
  const hint = scene.add.text(400, 360, 'Tekan R untuk main lagi', { fontSize: '16px', fontFamily: 'monospace', color: '#aaa' }).setOrigin(0.5);
  hint.setDepth(3001);
  scene.tweens.add({ targets: title, scale: { from: 0.8, to: 1.1 }, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
}

function openLavaCover(scene, ld) {
  buttonPressed = true;
  if (lavaCoverCollider) { lavaCoverCollider.destroy(); lavaCoverCollider = null; }
  scene.tweens.add({
    targets: lavaCover, alpha: 0, duration: 600,
    onComplete: () => { if (lavaCover) { lavaCover.clear(); } }
  });
  if (lavaCoverBody) { lavaCoverBody.body.enable = false; }
}

function takeDamage() {
  if (isInvincible || gameOverActive || gameWon || levelTransition) return;
  lives--;
  if (!Settings.muted) Audio.damage();
  drawHearts(gameScene);
  if (lives <= 0) {
    triggerGameOver();
    return;
  }
  isInvincible = true;
  if (damageFlash) damageFlash.setFillStyle(0xFF0000, 0.4);
  gameScene.tweens.add({ targets: damageFlash, alpha: 0, duration: 300, onComplete: () => { if (damageFlash) damageFlash.setFillStyle(0xFF0000, 0); } });
  player.setTint(0xFF5252);
  if (invincibleTimer) invincibleTimer.remove();
  invincibleTimer = gameScene.time.delayedCall(GAME_CONFIG.INVINCIBLE_DURATION, () => {
    isInvincible = false;
    player.clearTint();
    if (blinkTimer) blinkTimer.remove();
  });
  if (blinkTimer) blinkTimer.remove();
  let blink = false;
  blinkTimer = gameScene.time.addEvent({
    delay: 120,
    repeat: Math.floor(GAME_CONFIG.INVINCIBLE_DURATION / 120) - 1,
    callback: () => { blink = !blink; if (blink) player.setTint(0xFF5252); else player.clearTint(); }
  });
  const knockbackX = player.x < 400 ? -180 : 180;
  player.setVelocity(knockbackX, -280);
}

function killSpike() {
  if (!spikeAlive || spikeStunned || spikeFallingToLava) return;
  spikeStunned = true;
  if (!Settings.muted) Audio.spikeKill();
  spike.setTint(0xFF5252);
  spike.body.setVelocity(0, -250);
  if (stunTimer) stunTimer.remove();
  stunTimer = gameScene.time.delayedCall(GAME_CONFIG.STUN_DURATION, () => {
    spikeStunned = false;
    if (spike && spikeAlive) { spike.clearTint(); spike.body.setVelocity(0, 0); }
  });
}

function triggerGameOver() {
  if (gameOverActive) return;
  gameOverActive = true;
  if (!Settings.muted) Audio.gameOver();
  player.setTint(0xFF0000);
  player.anims.play('turn');
  player.body.setAllowGravity(false);
  player.setVelocity(0, 0);
  Audio.stopBGM(); Audio.stopSawHum(); Audio.stopSpikeHum();
  const overlay = gameScene.add.rectangle(400, 300, 800, 600, 0x000000, 0.75);
  overlay.setDepth(3000);
  const title = gameScene.add.text(400, 250, 'GAME OVER', { fontSize: '44px', fontFamily: 'monospace', color: '#FF5252', fontStyle: 'bold' }).setOrigin(0.5);
  title.setDepth(3001);
  const hint = gameScene.add.text(400, 320, 'Tekan R untuk coba lagi', { fontSize: '18px', fontFamily: 'monospace', color: '#ffb74d' }).setOrigin(0.5);
  hint.setDepth(3001);
}

function restartLevel() {
  currentLevel = 1;
  lives = GAME_CONFIG.LIVES_START;
  Audio.stopBGM(); Audio.stopSawHum(); Audio.stopSpikeHum();
  cleanupScene();
  if (gameScene) {
    gameScene.scene.restart();
  }
  const lbl = document.getElementById('levelLabel');
  if (lbl) lbl.textContent = 'LEVEL 1';
}

function handleKeyDown(e) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
    keys.up = true;
    if (!Audio.started) Audio.startAll();
  }
  if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = true;
  if (e.code === 'KeyR') restartLevel();
}

function handleKeyUp(e) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keys.up = false;
  if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = false;
}