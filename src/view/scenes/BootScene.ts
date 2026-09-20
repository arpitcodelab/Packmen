import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    // Vector SVG Maze
    this.load.svg('maze', 'assets/spriteSheets/maze/maze_blue.svg');

    // Vector Pickups
    this.load.svg('pacdot', 'assets/spriteSheets/pickups/pacdot.svg');
    this.load.svg('powerPellet', 'assets/spriteSheets/pickups/powerPellet.svg');
    this.load.svg('extra_life', 'assets/extra_life.svg');

    this.load.svg('cherry', 'assets/spriteSheets/pickups/cherry.svg');
    this.load.svg('strawberry', 'assets/spriteSheets/pickups/strawberry.svg');
    this.load.svg('orange', 'assets/spriteSheets/pickups/orange.svg');
    this.load.svg('apple', 'assets/spriteSheets/pickups/apple.svg');
    this.load.svg('melon', 'assets/spriteSheets/pickups/melon.svg');
    this.load.svg('galaxian', 'assets/spriteSheets/pickups/galaxian.svg');
    this.load.svg('bell', 'assets/spriteSheets/pickups/bell.svg');
    this.load.svg('key', 'assets/spriteSheets/pickups/key.svg');

    // Pacman Sprite Sheets (16x16 frames)
    this.load.spritesheet('pacman_right', 'assets/spriteSheets/characters/pacman/pacman_right.svg', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('pacman_left', 'assets/spriteSheets/characters/pacman/pacman_left.svg', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('pacman_up', 'assets/spriteSheets/characters/pacman/pacman_up.svg', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('pacman_down', 'assets/spriteSheets/characters/pacman/pacman_down.svg', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('pacman_death', 'assets/spriteSheets/characters/pacman/pacman_death.svg', { frameWidth: 16, frameHeight: 16 });

    // Ghost Directional Sprite Sheets (16x16 frames)
    const ghosts = ['blinky', 'pinky', 'inky', 'clyde'] as const;
    const dirs = ['right', 'left', 'up', 'down'] as const;

    for (const g of ghosts) {
      for (const d of dirs) {
        this.load.spritesheet(`${g}_${d}`, `assets/spriteSheets/characters/ghosts/${g}/${g}_${d}.svg`, { frameWidth: 16, frameHeight: 16 });
      }
    }

    // Frightened & Eyes Sprite Sheets
    this.load.spritesheet('scared_blue', 'assets/spriteSheets/characters/ghosts/scared_blue.svg', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('scared_white', 'assets/spriteSheets/characters/ghosts/scared_white.svg', { frameWidth: 16, frameHeight: 16 });
    for (const d of dirs) {
      this.load.spritesheet(`eyes_${d}`, `assets/spriteSheets/characters/ghosts/eyes_${d}.svg`, { frameWidth: 16, frameHeight: 16 });
    }

    // Text & Score Popups
    this.load.svg('ready_banner', 'assets/spriteSheets/text/ready.svg');
    const scoreVals = [100, 200, 300, 400, 500, 700, 800, 1000, 1600, 2000, 3000, 5000];
    for (const val of scoreVals) {
      this.load.svg(`score_${val}`, `assets/spriteSheets/text/${val}.svg`);
    }

    // Audio
    this.load.audio('siren_1', 'assets/audio/siren_1.mp3');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    // Create Animations
    // 1. Pacman chomp animations
    const directions = ['right', 'left', 'up', 'down'];
    for (const dir of directions) {
      if (this.textures.exists(`pacman_${dir}`) && !this.anims.exists(`pacman_chomp_${dir}`)) {
        this.anims.create({
          key: `pacman_chomp_${dir}`,
          frames: this.anims.generateFrameNumbers(`pacman_${dir}`, { start: 0, end: 3 }),
          frameRate: 14,
          repeat: -1,
        });
      }
    }

    if (this.textures.exists('pacman_death') && !this.anims.exists('pacman_dying')) {
      this.anims.create({
        key: 'pacman_dying',
        frames: this.anims.generateFrameNumbers('pacman_death', { start: 0, end: 11 }),
        frameRate: 10,
        repeat: 0,
      });
    }

    // 2. Ghost animations
    const ghostList = ['blinky', 'pinky', 'inky', 'clyde'];
    for (const g of ghostList) {
      for (const d of directions) {
        if (this.textures.exists(`${g}_${d}`) && !this.anims.exists(`${g}_walk_${d}`)) {
          this.anims.create({
            key: `${g}_walk_${d}`,
            frames: this.anims.generateFrameNumbers(`${g}_${d}`, { start: 0, end: 1 }),
            frameRate: 6,
            repeat: -1,
          });
        }
      }
    }

    if (this.textures.exists('scared_blue') && !this.anims.exists('ghost_scared_blue')) {
      this.anims.create({
        key: 'ghost_scared_blue',
        frames: this.anims.generateFrameNumbers('scared_blue', { start: 0, end: 1 }),
        frameRate: 6,
        repeat: -1,
      });
    }

    if (this.textures.exists('scared_white') && !this.anims.exists('ghost_scared_white')) {
      this.anims.create({
        key: 'ghost_scared_white',
        frames: this.anims.generateFrameNumbers('scared_white', { start: 0, end: 1 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    this.scene.start('GameScene');
  }
}
