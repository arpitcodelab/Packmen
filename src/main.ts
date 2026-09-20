import Phaser from 'phaser';
import { CONFIG } from './config';
import { BootScene } from './view/scenes/BootScene';
import { GameScene } from './view/scenes/GameScene';

const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: CONFIG.WIDTH,
  height: CONFIG.HEIGHT,
  pixelArt: true,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: CONFIG.WIDTH,
    height: CONFIG.HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, GameScene],
};

export const game = new Phaser.Game(phaserConfig);
