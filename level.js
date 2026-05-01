const LEVELS = {
  1: {
    bg: '#0a0e1a',
    groundTop: 560,
    startPos: { x: 80, y: 512 },
    hasLava: true,
    lavaLeft: 300, lavaRight: 500, lavaCenter: 400,
    hasButton: true,
    buttonPos: { x: 300, y: 420 },
    doorPos: { x: 660, y: 239 },
    staticPlats: [
      { x: 180, y: 490 }, { x: 300, y: 430 }, { x: 420, y: 370 },
      { x: 540, y: 310 }, { x: 660, y: 250 }
    ],
    staticSaws: [
      { x: 370, y: 350, scale: 0.4, speed: 1.2 },
      { x: 590, y: 290, scale: 0.4, speed: -1.2 }
    ],
    hasSpike: true,
    spikeRespawn: { x: 700, y: 544 },
    movingPlats: [],
    lasers: [],
    bats: [],
    windZones: [],
    groundSegments: [
      { x: 150, w: 300 }, { x: 650, w: 300 }
    ]
  },
  2: {
    bg: '#0a1210',
    groundTop: 560,
    startPos: { x: 60, y: 512 },
    hasLava: true,
    lavaLeft: 200, lavaRight: 600, lavaCenter: 400,
    hasButton: false,
    buttonPos: null,
    doorPos: { x: 740, y: 170 },
    staticPlats: [
      { x: 160, y: 480 }, { x: 320, y: 420 }, { x: 480, y: 360 },
      { x: 200, y: 320 }, { x: 400, y: 260 }, { x: 600, y: 200 },
      { x: 740, y: 180 }
    ],
    staticSaws: [
      { x: 260, y: 450, scale: 0.35, speed: 1.5 },
      { x: 440, y: 390, scale: 0.35, speed: -1.5 }
    ],
    hasSpike: false,
    spikeRespawn: null,
    movingPlats: [
      { x: 280, y: 380, w: 80, h: 16, axis: 'x', range: 120, speed: 1.2 },
      { x: 520, y: 300, w: 80, h: 16, axis: 'y', range: 80, speed: 0.8 },
      { x: 350, y: 200, w: 70, h: 16, axis: 'x', range: 100, speed: 1.0 }
    ],
    lasers: [
      { x: 400, y: 500, w: 4, h: 60, onTime: 1500, offTime: 1200 },
      { x: 250, y: 350, w: 4, h: 50, onTime: 2000, offTime: 1000 },
      { x: 550, y: 280, w: 4, h: 50, onTime: 1800, offTime: 1300 }
    ],
    bats: [
      { x: 500, y: 400, range: 150, speed: 1.5 },
      { x: 300, y: 250, range: 120, speed: 2.0 }
    ],
    windZones: [
      { x: 350, y: 450, w: 100, h: 100, forceX: -180 }
    ],
    groundSegments: [
      { x: 100, w: 200 }, { x: 700, w: 200 }
    ]
  }
};

function getLevelData() { return LEVELS[currentLevel] || LEVELS[1]; }