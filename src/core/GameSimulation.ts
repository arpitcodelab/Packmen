import { CLASSIC_MAZE_ASCII } from '../data/maze.classic';
import { Maze } from './Maze';
import { Pacman } from './Pacman';
import { Ghost } from './ghosts/Ghost';
import { GhostModeController } from './ghosts/GhostModeController';
import { GhostHouse } from './ghosts/GhostHouse';
import { Direction, FlowState, GhostName } from './types';
import { EventBus, SimEvent } from './events';
import { PelletSystem } from './systems/PelletSystem';
import { ScoreSystem } from './systems/ScoreSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { FruitSystem } from './systems/FruitSystem';
import { getLevelConfig } from '../data/levels';

export class GameSimulation {
  readonly maze: Maze;
  readonly pacman: Pacman;
  readonly ghosts: Ghost[];
  readonly blinky: Ghost;
  readonly pinky: Ghost;
  readonly inky: Ghost;
  readonly clyde: Ghost;

  readonly bus = new EventBus();
  readonly pellets: PelletSystem;
  readonly scoreSystem: ScoreSystem;
  readonly collisionSystem: CollisionSystem;
  readonly modeController: GhostModeController;
  readonly ghostHouse: GhostHouse;
  readonly fruitSystem: FruitSystem;

  flow: FlowState = 'playing';
  level: number = 1;
  lives: number = 1;
  dotsEatenInLevel: number = 0;

  private deathTimer: number = 0;
  private readyTimer: number = 0;
  private ghostEatTimer: number = 0;

  constructor(ascii: string[] = CLASSIC_MAZE_ASCII) {
    this.maze = new Maze(ascii);
    this.pacman = new Pacman(this.maze, this.maze.pacmanStart);

    this.blinky = new Ghost(this.maze, this.maze.ghostStarts.blinky, 'blinky');
    this.pinky = new Ghost(this.maze, { col: 14, row: 11 }, 'pinky');
    this.inky = new Ghost(this.maze, { col: 11, row: 14 }, 'inky');
    this.clyde = new Ghost(this.maze, { col: 16, row: 14 }, 'clyde');

    this.ghosts = [this.blinky, this.pinky, this.inky, this.clyde];

    const view = {
      pacman: this.pacman,
      blinkyTile: () => this.blinky.tile,
    };
    for (const g of this.ghosts) {
      g.setSimView(view);
    }

    this.modeController = new GhostModeController(this.bus);
    this.ghostHouse = new GhostHouse();
    this.fruitSystem = new FruitSystem(this.bus);
    this.pellets = new PelletSystem(this.maze, this.bus);
    this.scoreSystem = new ScoreSystem(this.bus);
    this.collisionSystem = new CollisionSystem(this.bus, this.modeController);

    this.applyLevelSpeeds();
    this.bus.on((e) => this.handleEvent(e));
  }

  get score(): number {
    return this.scoreSystem.getScore();
  }

  get highScore(): number {
    return this.scoreSystem.getHighScore();
  }

  ghost(name: GhostName): Ghost | undefined {
    return this.ghosts.find((g) => g.name === name);
  }

  applyLevelSpeeds(): void {
    const cfg = getLevelConfig(this.level);
    this.pacman.speed = 75.75 * cfg.pacSpeed;
  }

  private handleEvent(e: SimEvent): void {
    if (e.type === 'LEVEL_COMPLETE') {
      this.flow = 'levelComplete';
      this.level++;
      this.fruitSystem.setLevel(this.level);
    } else if (e.type === 'EXTRA_LIFE') {
      // Single attempt system: no extra lives awarded
    } else if (e.type === 'PLAYER_DIED') {
      this.lives--;
      this.flow = 'dying';
      this.deathTimer = 1.2;
    } else if (e.type === 'GHOST_EATEN') {
      this.scoreSystem.addPoints(e.points);
      this.flow = 'ghostEatFreeze';
      this.ghostEatTimer = 0.8;
    } else if (e.type === 'FRUIT_EATEN') {
      this.scoreSystem.addPoints(e.points);
    }
  }

  setDirection(d: Direction): void {
    if (this.flow !== 'playing') return;
    this.pacman.setDesiredDirection(d);
  }

  step(dt: number): void {
    if (this.flow === 'ghostEatFreeze') {
      this.ghostEatTimer -= dt;
      if (this.ghostEatTimer <= 0) {
        this.flow = 'playing';
      }
      return;
    }

    if (this.flow === 'dying') {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        if (this.lives > 0) {
          this.resetActors();
          this.flow = 'ready';
          this.readyTimer = 1.2;
          this.bus.emit({ type: 'READY' });
        } else {
          this.flow = 'gameOver';
          this.bus.emit({ type: 'GAME_OVER', score: this.score });
        }
      }
      return;
    }

    if (this.flow === 'ready') {
      this.readyTimer -= dt;
      if (this.readyTimer <= 0) {
        this.flow = 'playing';
      }
      return;
    }

    if (this.flow !== 'playing') return;

    // Advance mode schedule, ghost house, and fruit system
    this.modeController.update(dt, this.ghosts);
    this.ghostHouse.update(dt, this.ghosts);
    this.fruitSystem.update(dt);

    // Step player
    this.pacman.step(dt);

    // Pellet eating
    const eaten = this.pellets.eat(this.pacman.tile);
    if (eaten === 'dot') {
      this.scoreSystem.addPoints(10);
      this.pacman.freezeFrames = 1;
      this.dotsEatenInLevel++;
      this.ghostHouse.onDotEaten(this.ghosts);
      this.fruitSystem.onDotCount(this.dotsEatenInLevel);

      // Cruise Elroy check for Blinky
      const cfg = getLevelConfig(this.level);
      const remainingDots = this.pellets.remainingCount;
      if (remainingDots <= cfg.elroy2Dots) {
        this.blinky.setElroy(2, cfg.elroy2Speed);
      } else if (remainingDots <= cfg.elroy1Dots) {
        this.blinky.setElroy(1, cfg.elroy1Speed);
      }
    } else if (eaten === 'energizer') {
      this.scoreSystem.addPoints(50);
      this.pacman.freezeFrames = 3;
      const cfg = getLevelConfig(this.level);
      this.modeController.startFrightened(cfg.frightDuration, this.ghosts);
    }

    // Fruit collision check
    this.fruitSystem.checkCollision(this.pacman.tile);

    // Step all ghosts
    for (const g of this.ghosts) {
      g.step(dt);
    }

    // Check collisions
    this.collisionSystem.checkCollision(this.pacman, this.ghosts);
  }

  resetActors(): void {
    this.pacman.pos = {
      x: this.maze.pacmanStart.col * 8 + 4,
      y: this.maze.pacmanStart.row * 8 + 4,
    };
    this.pacman.dir = 'none';
    this.pacman.desiredDir = 'none';

    this.blinky.resetPosition(this.maze.ghostStarts.blinky);
    this.pinky.resetPosition({ col: 14, row: 11 });
    this.inky.resetPosition({ col: 11, row: 14 });
    this.clyde.resetPosition({ col: 16, row: 14 });

    this.modeController.reset();
    this.ghostHouse.reset();
  }

  restart(): void {
    this.scoreSystem.reset();
    this.pellets.initFromMaze(this.maze);
    this.fruitSystem.setLevel(1);
    this.level = 1;
    this.lives = 1;
    this.dotsEatenInLevel = 0;
    this.resetActors();
    this.applyLevelSpeeds();
    this.flow = 'ready';
    this.readyTimer = 1.5;
    this.bus.emit({ type: 'READY' });
  }

  on(cb: (e: SimEvent) => void): () => void {
    return this.bus.on(cb);
  }
}
