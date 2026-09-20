import Phaser from 'phaser';
import { CONFIG } from '../../config';
import { GameSimulation } from '../../core/GameSimulation';
import { InputManager } from '../../input/InputManager';
import { GhostName } from '../../core/types';
import { AudioManager } from '../../audio/AudioManager';

export class GameScene extends Phaser.Scene {
  private sim!: GameSimulation;
  private inputManager!: InputManager;
  private audioManager!: AudioManager;
  private accumulator = 0;
  private readonly STEP = 1 / 60;
  private readonly MAZE_OFFSET_Y = 24;

  private statusText!: Phaser.GameObjects.Text;
  private readyImage!: Phaser.GameObjects.Image;
  private popupImage!: Phaser.GameObjects.Image;
  private popupText!: Phaser.GameObjects.Text;

  private pacmanSprite!: Phaser.GameObjects.Sprite;
  private ghostSprites: Map<GhostName, Phaser.GameObjects.Sprite> = new Map();
  private fruitImage!: Phaser.GameObjects.Image;

  private mazeFallbackGraphics!: Phaser.GameObjects.Graphics;
  private pelletGraphics!: Phaser.GameObjects.Graphics;
  private lifeSprites: Phaser.GameObjects.Image[] = [];
  private fruitIndicatorSprites: Phaser.GameObjects.Image[] = [];

  private energizerTimer = 0;
  private energizerVisible = true;
  private lastPelletCount = -1;
  private flashToggle = false;
  private flashTimer = 0;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    this.sim = new GameSimulation();
    this.audioManager = new AudioManager();
    this.audioManager.attachSimulation(this.sim);
    this.audioManager.initSiren('assets/audio/siren_1.mp3');

    this.inputManager = new InputManager();
    this.inputManager.onDirection((d) => this.sim.setDirection(d));
    this.inputManager.onMute(() => {
      this.audioManager.toggleMute();
      this.updateDomHUD();
    });
    this.inputManager.onRestart(() => this.restartGame());

    // Connect DOM UI controls
    if (typeof document !== 'undefined') {
      const btnRestart = document.getElementById('btn-restart');
      if (btnRestart) btnRestart.onclick = () => this.restartGame();

      const btnSound = document.getElementById('btn-sound');
      if (btnSound) {
        btnSound.onclick = () => {
          this.audioManager.toggleMute();
          this.updateDomHUD();
        };
      }

      const btnPlayAgain = document.getElementById('btn-play-again');
      if (btnPlayAgain) btnPlayAgain.onclick = () => this.restartGame();

      // Sync overlay instantly on window resize and orientation flip
      window.addEventListener('resize', () => this.syncOverlayPosition());
      window.addEventListener('orientationchange', () => {
        setTimeout(() => this.syncOverlayPosition(), 100);
      });
    }

    this.scale.on('resize', () => {
      this.syncOverlayPosition();
    });

    // 1. Maze Layer (Depth 1) - Authentic SVG vector maze
    if (this.textures.exists('maze')) {
      this.add.image(0, this.MAZE_OFFSET_Y, 'maze').setOrigin(0, 0).setDepth(1);
    } else {
      this.mazeFallbackGraphics = this.add.graphics().setDepth(1);
      this.drawFallbackMaze();
    }

    // 2. Pellets Layer (Depth 2)
    this.pelletGraphics = this.add.graphics().setDepth(2);

    // 3. Bonus Fruit Sprite (Depth 3)
    this.fruitImage = this.add.image(0, 0, 'cherry').setOrigin(0.5, 0.5).setDepth(3).setVisible(false);

    // 4. Ghost Sprites (Depth 4)
    const ghostNames: GhostName[] = ['blinky', 'pinky', 'inky', 'clyde'];
    for (const name of ghostNames) {
      const gSprite = this.add.sprite(0, 0, `${name}_left`, 0).setOrigin(0.5, 0.5).setDepth(4);
      this.ghostSprites.set(name, gSprite);
    }

    // 5. Pac-Man Sprite (Depth 5)
    this.pacmanSprite = this.add.sprite(
      this.sim.pacman.pos.x,
      this.MAZE_OFFSET_Y + this.sim.pacman.pos.y,
      'pacman_right',
      0
    ).setOrigin(0.5, 0.5).setDepth(5);

    // 6. Popup Score Image & Text (Depth 150)
    this.popupImage = this.add.image(0, 0, 'score_200').setOrigin(0.5, 0.5).setDepth(150).setVisible(false);
    this.popupText = this.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 2, y: 1 },
    }).setOrigin(0.5, 0.5).setDepth(150).setVisible(false);

    // 7. Center Status Message (Depth 200 - High visibility on top of everything)
    if (this.textures.exists('ready_banner')) {
      this.readyImage = this.add.image(CONFIG.WIDTH / 2, this.MAZE_OFFSET_Y + 160, 'ready_banner')
        .setOrigin(0.5, 0.5)
        .setDepth(200)
        .setVisible(true);
    }
    this.statusText = this.add.text(CONFIG.WIDTH / 2, this.MAZE_OFFSET_Y + 160, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5, 0.5).setDepth(200).setVisible(false);

    // Subscriptions for Score Popups
    this.sim.on((e) => {
      if (e.type === 'GHOST_EATEN' || e.type === 'FRUIT_EATEN') {
        const px = (e as any).tile ? (e as any).tile.col * CONFIG.TILE + CONFIG.TILE / 2 : 13 * CONFIG.TILE + CONFIG.TILE / 2;
        const py = this.MAZE_OFFSET_Y + ((e as any).tile ? (e as any).tile.row * CONFIG.TILE + CONFIG.TILE / 2 : 17 * CONFIG.TILE + CONFIG.TILE / 2);
        const textureKey = `score_${e.points}`;

        if (this.textures.exists(textureKey)) {
          this.popupImage.setTexture(textureKey).setPosition(px, py).setVisible(true);
          this.popupText.setVisible(false);
        } else {
          this.popupText.setPosition(px, py).setText(`${e.points}`).setVisible(true);
          this.popupImage.setVisible(false);
        }
      }
    });

    this.drawPellets();
    this.updateHUDIndicators();
    this.updateDomHUD();
  }

  public restartGame(): void {
    this.sim.restart();
    this.drawPellets();
    this.updateHUDIndicators();
    if (this.popupImage) this.popupImage.setVisible(false);
    if (this.popupText) this.popupText.setVisible(false);
    this.updateDomHUD();
  }

  private updateDomHUD(): void {
    if (typeof document === 'undefined') return;

    const scoreEl = document.getElementById('ui-score');
    const highScoreEl = document.getElementById('ui-high-score');
    const soundBtn = document.getElementById('btn-sound');
    const gameOverModal = document.getElementById('game-over-modal');

    if (scoreEl) {
      scoreEl.textContent = this.sim.score === 0 ? '00' : `${this.sim.score}`;
    }
    if (highScoreEl) {
      highScoreEl.textContent = `${this.sim.highScore}`;
    }
    if (soundBtn) {
      soundBtn.textContent = this.audioManager.isMuted ? '🔇' : '🔊';
      soundBtn.title = this.audioManager.isMuted ? 'Unmute (M)' : 'Mute (M)';
    }

    if (gameOverModal) {
      if (this.sim.flow === 'gameOver') {
        gameOverModal.style.display = 'flex';
        const finalScore = document.getElementById('final-score-display');
        if (finalScore) finalScore.textContent = `${this.sim.score}`;
      } else {
        gameOverModal.style.display = 'none';
      }
    }
  }

  private syncOverlayPosition(): void {
    if (typeof document === 'undefined') return;

    const canvas = this.game.canvas;
    const overlay = document.getElementById('hud-overlay');
    const container = document.getElementById('game-container');
    if (!canvas || !overlay || !container) return;

    const rect = canvas.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();

    overlay.style.left = `${rect.left - cRect.left}px`;
    overlay.style.top = `${rect.top - cRect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height * (24 / 288)}px`;
    overlay.style.display = 'flex';

    const baseFontSize = Math.max(8, Math.floor(rect.height * 0.025));
    overlay.style.fontSize = `${baseFontSize}px`;
  }

  private drawFallbackMaze(): void {
    const g = this.mazeFallbackGraphics;
    g.clear();

    const maze = this.sim.maze;
    const tile = CONFIG.TILE;
    const offsetY = this.MAZE_OFFSET_Y;

    for (let r = 0; r < maze.rows; r++) {
      for (let c = 0; c < maze.cols; c++) {
        const x = c * tile;
        const y = offsetY + r * tile;

        if (maze.isWall(c, r)) {
          g.fillStyle(0x2121de, 1);
          g.fillRect(x, y, tile, tile);
          g.fillStyle(0x000000, 1);
          g.fillRect(x + 1, y + 1, tile - 2, tile - 2);

          const connect = (nc: number, nr: number, px: number, py: number, w: number, h: number) => {
            if (maze.isWall(nc, nr)) {
              g.fillStyle(0x000000, 1);
              g.fillRect(px, py, w, h);
            }
          };
          connect(c + 1, r, x + tile - 2, y + 1, 2, tile - 2);
          connect(c - 1, r, x, y + 1, 2, tile - 2);
          connect(c, r + 1, x + 1, y + tile - 2, tile - 2, 2);
          connect(c, r - 1, x + 1, y, tile - 2, 2);
        } else if (maze.isDoor(c, r)) {
          g.fillStyle(0xffb8de, 1);
          g.fillRect(x, y + tile / 2 - 1, tile, 2);
        }
      }
    }
  }

  private drawPellets(): void {
    const g = this.pelletGraphics;
    g.clear();
    const maze = this.sim.maze;
    const pellets = this.sim.pellets;
    const offsetY = this.MAZE_OFFSET_Y;

    for (const p of maze.pellets) {
      if (!pellets.hasPellet(p.tile.col, p.tile.row)) {
        continue;
      }

      const cx = p.tile.col * CONFIG.TILE + CONFIG.TILE / 2;
      const cy = offsetY + p.tile.row * CONFIG.TILE + CONFIG.TILE / 2;

      // Authentic retro peach color #FAB9B0
      g.fillStyle(0xfab9b0, 1);

      if (p.type === 'dot') {
        g.fillRect(cx - 1, cy - 1, 2, 2);
      } else if (p.type === 'energizer' && this.energizerVisible) {
        // Authentic pixel energizer (8x8 rounded diamond/circle matching powerPellet.svg)
        g.fillRect(cx - 2, cy - 4, 4, 1);
        g.fillRect(cx - 3, cy - 3, 6, 1);
        g.fillRect(cx - 4, cy - 2, 8, 4);
        g.fillRect(cx - 3, cy + 2, 6, 1);
        g.fillRect(cx - 2, cy + 3, 4, 1);
      }
    }
    this.lastPelletCount = pellets.remainingCount;
  }

  private updateHUDIndicators(): void {
    // 1. Reserve lives (Bottom-Left)
    const reserveLives = Math.max(0, this.sim.lives - 1);
    while (this.lifeSprites.length < reserveLives) {
      const idx = this.lifeSprites.length;
      const sprite = this.textures.exists('extra_life')
        ? this.add.image(18 + idx * 16, 276, 'extra_life').setOrigin(0.5, 0.5).setDepth(50)
        : null;
      if (sprite) {
        this.lifeSprites.push(sprite);
      } else {
        break;
      }
    }
    for (let i = 0; i < this.lifeSprites.length; i++) {
      this.lifeSprites[i].setVisible(i < reserveLives);
    }

    // 2. Fruit indicators (Bottom-Right: up to 7 fruits)
    const currentFruitType = this.sim.fruitSystem.activeFruit?.type || 'cherry';
    if (this.textures.exists(currentFruitType) && this.fruitIndicatorSprites.length === 0) {
      const indicator = this.add.image(CONFIG.WIDTH - 18, 276, currentFruitType).setOrigin(0.5, 0.5).setDepth(50);
      this.fruitIndicatorSprites.push(indicator);
    }
  }

  update(_time: number, deltaMs: number): void {
    // Fixed timestep accumulator
    this.accumulator += Math.min(deltaMs / 1000, 0.1);
    while (this.accumulator >= this.STEP) {
      this.sim.step(this.STEP);
      this.accumulator -= this.STEP;
    }

    if (this.sim.flow !== 'ghostEatFreeze') {
      this.popupText.setVisible(false);
      this.popupImage.setVisible(false);
    }

    // Energizer blinking (~4 Hz)
    this.energizerTimer += deltaMs;
    if (this.energizerTimer >= 150) {
      this.energizerTimer = 0;
      this.energizerVisible = !this.energizerVisible;
      this.drawPellets();
    } else if (this.sim.pellets.remainingCount !== this.lastPelletCount) {
      this.drawPellets();
    }

    // Frightened Flashing timer
    if (this.sim.modeController.isFlashing) {
      this.flashTimer += deltaMs;
      if (this.flashTimer >= 140) {
        this.flashTimer = 0;
        this.flashToggle = !this.flashToggle;
      }
    } else {
      this.flashToggle = false;
    }

    // Update HUD Score in DOM and sync overlay
    this.updateDomHUD();
    this.syncOverlayPosition();
    this.updateHUDIndicators();

    // Bonus Fruit on Maze
    const fruit = this.sim.fruitSystem.activeFruit;
    if (fruit && this.sim.flow === 'playing') {
      const fx = fruit.tile.col * CONFIG.TILE + CONFIG.TILE / 2;
      const fy = this.MAZE_OFFSET_Y + fruit.tile.row * CONFIG.TILE + CONFIG.TILE / 2;
      if (this.textures.exists(fruit.type)) {
        this.fruitImage.setTexture(fruit.type);
      }
      this.fruitImage.setPosition(fx, fy).setVisible(true);
    } else {
      this.fruitImage.setVisible(false);
    }

    // Status Banner
    if (this.sim.flow === 'ready') {
      if (this.readyImage) {
        this.readyImage.setVisible(true);
        this.statusText.setVisible(false);
      } else {
        this.statusText.setText('READY!').setColor('#ffff00').setVisible(true);
      }
    } else if (this.sim.flow === 'gameOver') {
      if (this.readyImage) this.readyImage.setVisible(false);
      this.statusText.setText('GAME  OVER').setColor('#ff0000').setVisible(true);
    } else if (this.sim.flow === 'levelComplete') {
      if (this.readyImage) this.readyImage.setVisible(false);
      this.statusText.setText('LEVEL COMPLETE!').setColor('#ffff00').setVisible(true);
    } else {
      if (this.readyImage) this.readyImage.setVisible(false);
      this.statusText.setVisible(false);
    }

    // Background Audio Siren
    if (this.sim.flow === 'playing') {
      this.audioManager.playSiren();
      const dotsRemaining = this.sim.pellets.remainingCount;
      this.audioManager.setSirenRate(1.0 + (244 - dotsRemaining) / 300);
    } else {
      this.audioManager.pauseSiren();
    }

    // Render Pac-Man and Ghosts with SVG Sprites
    this.updatePacmanSprite();
    this.updateGhostSprites();
  }

  private updatePacmanSprite(): void {
    const pac = this.sim.pacman;
    const px = pac.pos.x;
    const py = this.MAZE_OFFSET_Y + pac.pos.y;
    this.pacmanSprite.setPosition(px, py);

    if (this.sim.flow === 'gameOver') {
      this.pacmanSprite.setVisible(false);
      return;
    }

    this.pacmanSprite.setVisible(true);

    if (this.sim.flow === 'ready') {
      this.pacmanSprite.setTexture('pacman_right', 0);
      this.pacmanSprite.stop();
      return;
    }

    if (this.sim.flow === 'dying') {
      if (this.anims.exists('pacman_dying') && this.pacmanSprite.anims.currentAnim?.key !== 'pacman_dying') {
        this.pacmanSprite.play('pacman_dying');
      }
      return;
    }

    const dir = pac.dir === 'none' ? 'right' : pac.dir;
    const animKey = `pacman_chomp_${dir}`;

    if (this.anims.exists(animKey)) {
      if (pac.dir !== 'none') {
        if (this.pacmanSprite.anims.currentAnim?.key !== animKey) {
          this.pacmanSprite.play(animKey);
        }
      } else {
        this.pacmanSprite.setTexture(`pacman_${dir}`, 0);
        this.pacmanSprite.stop();
      }
    }
  }

  private updateGhostSprites(): void {
    const hideGhosts = this.sim.flow === 'gameOver' || this.sim.flow === 'dying';

    for (const ghost of this.sim.ghosts) {
      const sprite = this.ghostSprites.get(ghost.name);
      if (!sprite) continue;

      if (hideGhosts) {
        sprite.setVisible(false);
        continue;
      }

      sprite.setVisible(true);
      const gx = ghost.pos.x;
      const gy = this.MAZE_OFFSET_Y + ghost.pos.y;
      sprite.setPosition(gx, gy);

      const dir = ghost.dir === 'none' ? 'left' : ghost.dir;

      if (ghost.mode === 'eaten') {
        sprite.stop();
        const eyesKey = `eyes_${dir}`;
        if (this.textures.exists(eyesKey)) {
          sprite.setTexture(eyesKey, 0);
        }
      } else if (ghost.mode === 'frightened') {
        const scaredAnim = this.flashToggle ? 'ghost_scared_white' : 'ghost_scared_blue';
        if (this.anims.exists(scaredAnim)) {
          if (sprite.anims.currentAnim?.key !== scaredAnim) {
            sprite.play(scaredAnim);
          }
        }
      } else {
        // Normal Chase / Scatter mode
        const walkAnim = `${ghost.name}_walk_${dir}`;
        if (this.anims.exists(walkAnim)) {
          if (sprite.anims.currentAnim?.key !== walkAnim) {
            sprite.play(walkAnim);
          }
        } else {
          sprite.setTexture(`${ghost.name}_${dir}`, 0);
        }
      }
    }
  }
}
