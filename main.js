const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false
    }
  },
  scene: { preload, create, update }
};

let player, spikes;
let keys = { left: false, right: false, up: false };

new Phaser.Game(config);

function preload() {
  this.load.image('bg', 'https://labs.phaser.io/assets/skies/space3.png');
  this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
  this.load.spritesheet('dude', 'https://labs.phaser.io/assets/sprites/dude.png', {
    frameWidth: 32,
    frameHeight: 48
  });
  this.load.image('spike', 'https://labs.phaser.io/assets/sprites/spikedball.png');
}

function create() {
  // 🔥 AUTO FOCUS CANVAS — PENTING BANGET
  this.game.canvas.focus();
  this.game.canvas.setAttribute('tabindex', '0');
  this.game.canvas.style.outline = 'none';

  // Background
  this.add.image(400, 300, 'bg').setDisplaySize(800, 600);

  // Ground & platforms
  const ground = this.physics.add.staticGroup();
  const platforms = this.physics.add.staticGroup();

  ground.create(400, 580, 'ground').setDisplaySize(800, 40).refreshBody();
  platforms.create(250, 500, 'ground').setScale(0.5).refreshBody();
  platforms.create(400, 420, 'ground').setScale(0.5).refreshBody();
  platforms.create(550, 340, 'ground').setScale(0.5).refreshBody();

  // Player
  player = this.physics.add.sprite(100, 400, 'dude');
  player.setCollideWorldBounds(true);

  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, platforms);

  // ===== 🔥 BUTTON TARUH DI SINI =====
let buttonPressed = false;

lavaButton = this.add.container(500, 350);

const base = this.add.rectangle(0, 10, 30, 10, 0x546E7A);
const top = this.add.rectangle(0, 2, 20, 16, 0xF44336);
top.setName('buttonTop');

lavaButton.add([base, top]);

this.add.text(x, y, 'TEKAN SPACE', { 
    fontSize: '20px', 
    fill: '#FFD700',
    fontFamily: 'Arial'
});

const buttonZone = this.add.zone(420, 350, 80, 80);
this.physics.add.existing(buttonZone, true);

this.physics.add.overlap(player, buttonZone, () => {
   console.log("PLAYER MASUK ZONA");
  
  if (!buttonPressed && cursors.down.isDown) {
    console.log("TOMBOL DIPENCET");
    openLavaCover(this);
  }
});


  // Animasi
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'turn',
    frames: [{ key: 'dude', frame: 4 }]
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // Spike
  spikes = this.physics.add.group();
  spikes.create(600, 550, 'spike')
    .setScale(0.5)
    .setCollideWorldBounds(true)
    .setAllowGravity(false);
  this.physics.add.collider(spikes, ground);
  this.physics.add.overlap(player, spikes, () => respawnPlayer());

  // 🔥 KEYBOARD NATIVE — PALING AMAN & PASTI JALAN
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
  });
}

function update() {

 // 🔥 DEBUG INPUT
  if (keys.down) {
    console.log("DOWN KEDETECT");
  }

  const speed = 200;
  const jumpSpeed = 500;
  const airControl = 0.6;

  // Movement pakai keys native
  if (keys.left) {
    player.setVelocityX(player.body.touching.down ? -speed : -speed * airControl);
    player.anims.play('left', true);
  }
  else if (keys.right) {
    player.setVelocityX(player.body.touching.down ? speed : speed * airControl);
    player.anims.play('right', true);
  }
  else {
    player.setVelocityX(0);
    player.anims.play('turn', true);
  }

  if (keys.up && player.body.touching.down) {
    player.setVelocityY(-jumpSpeed);
  }

  // Spike chase
  spikes.children.iterate(function (spike) {
    if (!spike) return;
    const dir = player.x - spike.x;
    if (Math.abs(dir) > 5) {
      spike.setVelocityX(Math.sign(dir) * 100);
    } else {
      spike.setVelocityX(0);
    }
  });
}

function respawnPlayer() {
  player.setPosition(100, 400);
  player.setVelocity(0, 0);
}