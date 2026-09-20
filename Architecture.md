# Architecture — Packmen (working title)

> **Read with:** `PRD.md` (requirements and rules). This file says **how** to build it.
> **For the AI IDE:** follow the folder structure, interfaces and rules here. Build in the milestone order of PRD Section 12. Keep game rules in `src/core` (pure TypeScript, no Phaser imports) and rendering/input/audio in `src/view`, `src/input`, `src/audio`.

---

## 1. Architectural Principles

1. **Simulation is separate from presentation.** The game "brain" (`src/core`) is pure TypeScript: no Phaser, no DOM, no audio. It can be unit-tested in Node and reused with any renderer.
2. **Fixed timestep.** Simulation always advances in 1/60 s steps, regardless of monitor refresh rate.
3. **Data-driven.** Maze, speeds, timers, scoring, fruit, ghost personalities live in `src/data`. Logic reads them; it never hard-codes numbers.
4. **Events out, commands in.** Core emits events (`DOT_EATEN`, `GHOST_EATEN`, `PLAYER_DIED`...). View/audio subscribe. Input sends commands (`setDirection`, `pause`).
5. **Small files, single responsibility.** Prefer many small modules over big ones.
6. **Strict TypeScript, no `any`.** Enums or string unions for directions, modes, states.
7. **No allocations in hot loops.** Reuse vector objects in per-frame code.

## 2. Tech Stack (all free / open source)

| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript 5** (strict) | Type safety helps AI-generated code stay correct |
| Bundler/dev server | **Vite** | Instant dev, simple static build |
| Game framework | **Phaser 3** (MIT) | Scaling, sprites, animation, audio, input, big community and lots of examples |
| Tests | **Vitest** | Same config as Vite, fast |
| Lint/format | **ESLint + Prettier** | Consistent code |
| PWA | **vite-plugin-pwa** | Manifest + service worker |
| Hosting | **GitHub Pages** via GitHub Actions | Free static hosting |
| Art tools | LibreSprite / Piskel, Inkscape (SVG maze) | Free |
| Audio tools | jsfxr (sfxr web), Audacity | Free |
| Font | Press Start 2P (OFL) bundled locally | No external requests |

> **Alternative (if Phaser feels heavy):** plain HTML5 Canvas 2D + TypeScript. Because `src/core` is engine-agnostic, only `src/view`, `src/input`, `src/audio` change.

## 3. Repository Structure

```
packmen/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ vitest.config.ts
├─ .eslintrc.cjs / eslint.config.js
├─ .prettierrc
├─ ASSETS_LICENSES.md
├─ README.md
├─ .github/workflows/deploy.yml
├─ public/
│  ├─ manifest.webmanifest
│  ├─ icons/                     # PWA icons 192/512
│  └─ assets/
│     ├─ sprites/                # atlas png + json (player, ghosts, fruit, ui)
│     ├─ maze/                   # maze image (png or svg)
│     ├─ audio/                  # .ogg + .mp3 fallback
│     └─ fonts/                  # PressStart2P.woff2
├─ scripts/
│  └─ validate-maze.ts           # npm run validate:maze
├─ src/
│  ├─ main.ts                    # creates Phaser.Game
│  ├─ config.ts                  # GAME_TITLE, sizes, feature flags (authenticBugs, debug)
│  ├─ core/                      # PURE LOGIC (no Phaser/DOM)
│  │  ├─ types.ts                # Vec2, Direction, GhostName, GhostMode, etc.
│  │  ├─ constants.ts            # TILE=8, COLS=28, ROWS=31, BASE_SPEED
│  │  ├─ direction.ts            # DIR vectors, opposite(), tie-break order
│  │  ├─ Maze.ts                 # parses ASCII map, queries (isWall, isDoor, isTunnel, noUp)
│  │  ├─ Actor.ts                # base moving entity (position, dir, speed, tile-center logic)
│  │  ├─ Pacman.ts               # player rules: buffered turn, stop at wall
│  │  ├─ ghosts/
│  │  │  ├─ Ghost.ts             # movement + mode handling
│  │  │  ├─ targeting.ts         # strategy per ghost: blinky/pinky/inky/clyde
│  │  │  ├─ GhostModeController.ts   # scatter/chase timeline, frightened timer
│  │  │  └─ GhostHouse.ts        # release logic (personal + global counters, fallback timer)
│  │  ├─ systems/
│  │  │  ├─ CollisionSystem.ts
│  │  │  ├─ ScoreSystem.ts       # points, ghost chain, extra life
│  │  │  ├─ PelletSystem.ts      # dots/energizers, counts
│  │  │  └─ FruitSystem.ts
│  │  ├─ GameSimulation.ts       # owns all entities, step(dt), emits events
│  │  ├─ GameFlow.ts             # state machine (READY, PLAYING, DYING, ...)
│  │  ├─ events.ts               # typed event bus
│  │  └─ rng.ts                  # seedable RNG (for deterministic tests)
│  ├─ data/
│  │  ├─ maze.classic.ts         # ASCII maze string[]
│  │  ├─ levels.ts               # level table from PRD 7.8
│  │  ├─ scoring.ts
│  │  └─ ghosts.ts               # names, colors, start tiles, scatter corners
│  ├─ view/                      # Phaser rendering
│  │  ├─ scenes/
│  │  │  ├─ BootScene.ts         # tiny loader (font, progress bar assets)
│  │  │  ├─ PreloadScene.ts      # loads assets, error UI if fail
│  │  │  ├─ MenuScene.ts
│  │  │  ├─ GameScene.ts         # hosts sim, renders it
│  │  │  ├─ HudScene.ts          # overlay: score, lives, fruit, pause button
│  │  │  └─ GameOverScene.ts
│  │  ├─ sprites/
│  │  │  ├─ PacmanSprite.ts
│  │  │  ├─ GhostSprite.ts
│  │  │  ├─ FruitSprite.ts
│  │  │  └─ PelletRenderer.ts
│  │  ├─ animations.ts           # registers all Phaser animations
│  │  └─ effects.ts              # flash, shake, popups, optional CRT overlay
│  ├─ input/
│  │  ├─ InputManager.ts         # merges keyboard/touch/gamepad -> Direction commands
│  │  ├─ KeyboardInput.ts
│  │  ├─ SwipeInput.ts
│  │  ├─ DPadOverlay.ts          # DOM or Phaser touch buttons
│  │  └─ GamepadInput.ts         # P2
│  ├─ audio/
│  │  └─ AudioManager.ts         # loads/plays sfx, loops, mute, unlock
│  ├─ storage/
│  │  └─ Storage.ts              # safe localStorage wrapper (high score, settings)
│  └─ utils/
│     └─ math.ts
└─ tests/
   ├─ maze.test.ts
   ├─ movement.test.ts
   ├─ ghostTargeting.test.ts
   ├─ ghostModes.test.ts
   ├─ ghostHouse.test.ts
   ├─ scoring.test.ts
   └─ simulation.test.ts
```

## 4. Coordinates and Resolution

- Logical resolution **224 × 288** (28 × 36 tiles of 8 px). Playable maze occupies rows 3–33 (31 rows); rows 0–2 HUD top, rows 34–35 HUD bottom (lives, fruit).
- Phaser config: `type: AUTO`, `pixelArt: true`, `scale: { mode: Phaser.Scale.FIT, autoCenter: CENTER_BOTH, width: 224, height: 288 }`, background `#000000`.
- **Tile coords** `(col,row)` are integers. **Pixel coords** are floats inside the sim; the tile center of `(c,r)` is `(c*8+4, r*8+4)`.
- Tunnel wrap: if `x < -halfTile` set `x += COLS*TILE`; if `x > COLS*TILE + halfTile` set `x -= COLS*TILE`.

## 5. Game Loop and Fixed Timestep

```ts
// GameScene.update(time, deltaMs)
const STEP = 1 / 60;
accumulator += Math.min(deltaMs / 1000, 0.1); // clamp to avoid spiral after tab switch
while (accumulator >= STEP) {
  sim.step(STEP);          // pure logic
  accumulator -= STEP;
}
const alpha = accumulator / STEP;
view.render(sim, alpha);   // optional interpolation between prev/current positions
```

- Pause: stop calling `sim.step` (view still renders "PAUSED").
- Freezes (ghost-eat pop, death) are handled inside `GameFlow` timers, not by stopping the loop.

## 6. High-Level Diagram

```
        ┌───────────────────────────────────────────────┐
        │                 Phaser Scenes                 │
        │ Boot → Preload → Menu → Game(+Hud) → GameOver │
        └───────┬───────────────▲────────────────┬──────┘
   commands     │               │ render state   │ subscribe
 ┌──────────┐   ▼               │                ▼
 │  Input   │─────► GameScene ──┴──► View sprites/HUD   AudioManager
 │ Manager  │            │                                ▲
 └──────────┘            │ step(dt)                       │ events
                         ▼                                │
              ┌───────────────────────────────────────────┴───┐
              │           core/GameSimulation (pure TS)       │
              │ GameFlow FSM · Pacman · Ghosts(4) · GhostMode │
              │ GhostHouse · Pellets · Fruit · Score · Collide│
              └───────────────▲───────────────────────────────┘
                              │ reads
                         src/data/* (maze, levels, scoring)
```

## 7. Core Types and Interfaces

```ts
// core/types.ts
export type Vec2 = { x: number; y: number };
export type Tile = { col: number; row: number };
export type Direction = 'up' | 'left' | 'down' | 'right' | 'none';
export type GhostName = 'blinky' | 'pinky' | 'inky' | 'clyde';
export type GhostMode = 'inHouse' | 'leaving' | 'scatter' | 'chase' | 'frightened' | 'eaten';
export type FlowState =
  | 'ready' | 'playing' | 'ghostEatFreeze' | 'dying'
  | 'levelComplete' | 'gameOver';

// core/direction.ts
export const DIR_VEC: Record<Exclude<Direction,'none'>, Vec2> = {
  up: {x:0,y:-1}, left:{x:-1,y:0}, down:{x:0,y:1}, right:{x:1,y:0},
};
export const TIE_BREAK_ORDER = ['up','left','down','right'] as const; // ghost decisions
export const opposite = (d: Direction): Direction => /* ... */;

// core/events.ts  (typed emitter, no Phaser dependency)
export type SimEvent =
  | { type: 'DOT_EATEN'; alt: boolean }          // alt toggles the two dot sounds
  | { type: 'ENERGIZER_EATEN' }
  | { type: 'GHOST_EATEN'; ghost: GhostName; points: number; tile: Tile }
  | { type: 'FRUIT_SPAWNED'; fruit: FruitType }
  | { type: 'FRUIT_EATEN'; fruit: FruitType; points: number }
  | { type: 'PLAYER_DIED' }
  | { type: 'EXTRA_LIFE' }
  | { type: 'LEVEL_COMPLETE'; level: number }
  | { type: 'MODE_CHANGED'; mode: 'scatter'|'chase'|'frightened' }
  | { type: 'GAME_OVER'; score: number }
  | { type: 'READY' };

// core/GameSimulation.ts
export interface GameSimulation {
  readonly flow: FlowState;
  readonly level: number; readonly score: number; readonly lives: number;
  readonly pacman: PacmanState; readonly ghosts: readonly GhostState[];
  readonly pellets: PelletState; readonly fruit: FruitState | null;
  step(dt: number): void;
  setDirection(d: Direction): void;       // from input
  startNewGame(): void;
  on(cb: (e: SimEvent) => void): () => void;
}
```

## 8. Maze Module

- `Maze` is constructed from `string[]` (the ASCII rows). It exposes:
  - `isWalkable(col,row, who:'pacman'|'ghost'|'ghostReturning')`
  - `isDoor(col,row)`, `isTunnel(col,row)`, `isNoUp(col,row)`
  - `neighbors(col,row)`, `wrapCol(col)`
  - `startTile('pacman' | GhostName)`, `fruitTile`, `pelletList`
- Out-of-range columns on the tunnel row are treated as walkable (wrap); everything else outside bounds is a wall.
- `scripts/validate-maze.ts` imports the same parser and asserts the rules in PRD 7.1. Run it in CI and in `npm test`.

## 9. Actor Movement (shared by Pac-Man and ghosts)

Every actor has: `pos` (pixel, float), `dir`, `speed` (px/s), `tile` (derived).

**Algorithm per step** (distance to travel = `speed * dt`):
1. While `distance > 0`:
   1. Compute distance to the next tile center along `dir` (`d`).
   2. If `d > distance`: move `distance`, done.
   3. Else: move `d` (now exactly on a tile center), subtract `d` from `distance`, and call **`decideAtCenter()`** (actor-specific), which may change `dir` or stop.
2. Apply tunnel wrap.

This "consume distance up to each tile center" loop guarantees that decisions always happen exactly at tile centers, even at high speed or big delta.

### Pac-Man specifics
- `desiredDir` set by input at any time.
- Instant reversal: if `desiredDir` is opposite of `dir`, flip immediately (no need to wait for center).
- `decideAtCenter()`: if `desiredDir` walkable from this tile → `dir = desiredDir`; else if `dir` walkable → keep; else `dir = 'none'` (stop).
- Eating: on entering a tile with a pellet → `PelletSystem.eat(tile)`; apply pause frames (1 for dot, 3 for energizer) by decrementing a `freezeFrames` counter that skips movement.

### Ghost specifics
```ts
decideAtCenter(ghost, sim) {
  const candidates = ['up','left','down','right']            // order = tie-break priority
    .filter(d => d !== opposite(ghost.dir))                  // never reverse voluntarily
    .filter(d => maze.isWalkableForGhost(next(ghost.tile, d), ghost.mode))
    .filter(d => !(d === 'up' && maze.isNoUp(ghost.tile) && ghost.mode is scatter|chase));

  if (ghost.mode === 'frightened') return rng.pick(candidates);

  const target = getTarget(ghost, sim);                      // see section 10
  return argMin(candidates, d => dist2(next(ghost.tile, d), target)); // first wins ties
}
```
- **Forced reverse:** when the mode controller signals a global switch (scatter↔chase, or frightened start), set `ghost.pendingReverse = true`; at the next step, flip direction once (skip ghosts in house or eaten).
- **Dead end guard:** if `candidates` is empty (shouldn't happen), fall back to reversing.
- **Speed selection (each step):** eaten → 200% (configurable); frightened → `ghostFright%`; in tunnel → `ghostTunnel%`; Blinky in Elroy → Elroy speed; else `ghost%`. Multiply by `BASE_SPEED (75.75)`.

## 10. Ghost Targeting Strategies (`core/ghosts/targeting.ts`)

```ts
type TargetFn = (self: GhostState, sim: SimView) => Tile;

export const blinky: TargetFn = (_, s) => s.pacman.tile;

export const pinky: TargetFn = (_, s) => {
  const t = ahead(s.pacman.tile, s.pacman.dir, 4);
  if (config.authenticBugs && s.pacman.dir === 'up') t.col -= 4;  // classic overflow bug
  return t;
};

export const inky: TargetFn = (_, s) => {
  const pivot = ahead(s.pacman.tile, s.pacman.dir, 2);
  if (config.authenticBugs && s.pacman.dir === 'up') pivot.col -= 2;
  const b = s.ghost('blinky').tile;
  return { col: pivot.col + (pivot.col - b.col), row: pivot.row + (pivot.row - b.row) };
};

export const clyde: TargetFn = (self, s) =>
  dist(self.tile, s.pacman.tile) > 8 ? s.pacman.tile : SCATTER_CORNER.clyde;
```

`getTarget(ghost)`:
- `scatter` → its corner (Blinky in Elroy → Pac-Man's tile)
- `chase` → the strategy above
- `eaten` → ghost-house entrance tile (above the door), then inside
- `leaving` → the tile just outside the door

Targets may lie **outside** the maze; that is intended and works because only neighboring tile distances are compared.

## 11. Mode Controller, Ghost House, Pellets, Fruit

### GhostModeController
- Holds the per-level scatter/chase schedule from `levels.ts` (array of `{mode, seconds}`), a cursor and a timer.
- `update(dt)`: if frightened active → tick the fright timer only (schedule paused). Otherwise tick schedule; on segment end emit a mode switch → all eligible ghosts `pendingReverse`.
- `startFrightened(seconds, flashes)`: sets `frightenedUntil`, resets the ghost-eat chain to 200, sets eligible ghosts to `frightened` + `pendingReverse`. If `seconds === 0` → only reverse.
- Frightened ends → ghosts return to the current schedule mode.

### GhostHouse
- State per ghost: `inHouse | leaving | out`. Inside ghosts bob up/down (visual only) until released.
- Release rules (PRD 7.7): personal dot counters; fallback timer (4 s or 3 s of no dot eaten); after a life is lost, use the global counter (7/17/32) until Clyde exits.
- `onDotEaten()` increments the appropriate counter; `update(dt)` ticks the no-dot timer; `tryRelease()` moves the next ghost to `leaving`: it travels to the door-center, then up and out, then becomes `scatter`/`chase` depending on current schedule.
- Eaten ghosts return to the house, then are released immediately.

### PelletSystem
- Holds a `Set<number>` of remaining pellet indices (`row*COLS+col`) and counts. `eat(tile)` returns `'dot' | 'energizer' | null`, updates counts, notifies `GhostHouse`, `FruitSystem`, Elroy check.

### FruitSystem
- Triggers at 70 and 170 dots eaten. Timer 9–10 s (random via seeded RNG). Fruit type from `levels.ts`. Collision by tile match with the player.

## 12. Game Flow State Machine (`GameFlow`)

```
       startNewGame
  ┌───────────────┐
  ▼               │ (lives>0)
READY(2s) ─► PLAYING ─► DYING(~2.5s) ─► READY
              │  ▲           │(lives==0)
              │  │           ▼
   ghost eaten│  │        GAME_OVER
              ▼  │
       GHOST_EAT_FREEZE(1s)
              │
   all pellets eaten
              ▼
       LEVEL_COMPLETE(~2.5s: flash) ─► next level ─► READY
```

- Only `PLAYING` advances actors and mode timers.
- `READY`: entities at start positions, nothing moves; ghosts hidden until READY! finishes on the first frame of PLAYING (classic behavior) or shown immediately (choose one, keep consistent).
- Each transition emits a `SimEvent` so view/audio can react.

## 13. Rendering (Phaser)

- **Maze:** a single pre-rendered image (SVG rasterized to PNG at 2× or 4× and scaled down, or pixel PNG). Flash effect on level-complete by swapping to a white maze texture (tween).
- **Pellets:** small sprites or a single `RenderTexture` redrawn on change. Energizer blink via a timer toggling visibility (~4 Hz).
- **Sprites:** one texture atlas (`sprites.png/json`). Animations registered once in `animations.ts`:
  - pacman: `chomp-{dir}` (3 frames), `die` (~11 frames)
  - ghosts: `{name}-{dir}` (2 frames), `frightened`, `frightened-flash`, `eyes-{dir}`
  - fruit, score popups (200/400/800/1600, fruit values)
- **Scenes:** `GameScene` owns the sim and world sprites; `HudScene` runs in parallel for score/lives/fruit row and pause button so UI stays crisp and independent of world state.
- **Interpolation:** render position = lerp(prevPos, pos, alpha) to stay smooth on high-refresh displays.
- **Depth:** maze < pellets < fruit < ghosts < pacman < popups < HUD.
- **Optional post effect:** CRT scanline overlay (a semi-transparent tiled image), user-toggleable.

## 14. Input Layer

- `InputManager` exposes `onDirection(cb)`, `onPause(cb)`, `onMute(cb)`; merges sources. Last input wins; ignore duplicates.
- **Keyboard:** Arrow keys + WASD via Phaser keyboard; `preventDefault` on arrows/space to stop page scroll.
- **Swipe:** track `pointerdown` → `pointerup`/`pointermove`; if |Δ| ≥ 24 px, dominant axis decides direction; can also fire mid-drag for responsiveness.
- **D-pad:** four 44+ px buttons rendered only when `navigator.maxTouchPoints > 0` or user toggles; uses `pointerdown`.
- **Touch hygiene (CSS):** `touch-action: none; user-select: none; -webkit-touch-callout: none; overscroll-behavior: none;` on `html, body, canvas`; `viewport` meta with `user-scalable=no`.
- **Pause on blur:** `document.visibilitychange` and `window.blur` → pause.
- **Gamepad (P2):** poll `navigator.getGamepads()` each frame.

## 15. Audio Layer

- `AudioManager` wraps Phaser's sound manager:
  - `unlock()` on first `pointerdown`/`keydown` (Phaser handles most; verify on iOS).
  - `playSfx(name)`, `startLoop(name)`, `stopLoop(name)`, `setLoopRate(name, rate)` (siren speeds up as dots decrease), `mute(bool)`, `volume(0..1)`.
  - Subscribes to `SimEvent`s: `DOT_EATEN` → alternate `dot1`/`dot2`; `GHOST_EATEN` → `eatGhost`; etc.
- Formats: `.ogg` primary, `.mp3` fallback (Safari). Keep files short; normalize loudness.
- Mute/volume persisted through `Storage`.

## 16. Persistence

```ts
// storage/Storage.ts
export const Storage = {
  get<T>(key: string, fallback: T): T { try { /* localStorage read + JSON.parse */ } catch { return fallback; } },
  set<T>(key: string, value: T): void { try { /* write */ } catch { /* ignore quota/private mode */ } },
};
// keys: 'packmen.highScore', 'packmen.settings'
```

## 17. Configuration and Data

```ts
// config.ts
export const CONFIG = {
  GAME_TITLE: 'Packmen',
  TILE: 8, COLS: 28, ROWS: 31, WIDTH: 224, HEIGHT: 288,
  BASE_SPEED_PX_PER_SEC: 75.75,
  START_LIVES: 3, EXTRA_LIFE_AT: 10_000,
  authenticBugs: false,        // P2 quirk toggle
  debug: false,                // shows target tiles, grid, FPS
};
```

- `data/levels.ts` exports `LEVELS: LevelConfig[]` (index 0 = level 1) with `getLevelConfig(n)` clamping to the last entry for 21+. Includes speeds (as fractions like `0.80`), Elroy thresholds, fright seconds/flashes, fruit type, scatter/chase schedule, house release counts.
- **Debug overlay (`?debug=1`):** draw the grid, each ghost's target tile in the ghost's color, mode text, and FPS. This is the single most useful tool for tuning AI, keep it.

## 18. Testing Strategy (Vitest)

Core is pure, so test it directly and deterministically (seeded RNG).

| Test file | Must cover |
|---|---|
| `maze.test.ts` | Parses ASCII; validator rules (dims, symmetry, 244 pellets, reachability, tunnel) |
| `movement.test.ts` | Player stops at walls, buffered turn taken at next center, reverse works, tunnel wrap, large `dt` still stops at centers |
| `ghostTargeting.test.ts` | Blinky/Pinky/Inky/Clyde targets for fixed positions (incl. Clyde 8-tile threshold, up-bug flag) |
| `ghostModes.test.ts` | Schedule per level, pause during frightened, reversal on switch, no-up rule, tie-break order |
| `ghostHouse.test.ts` | Personal counters L1/L2/L3, fallback timer, global counter after death |
| `scoring.test.ts` | 200/400/800/1600 chain, fruit points, extra life once at 10,000 |
| `simulation.test.ts` | Full scripted scenario: eat pellets → level complete; death → lives; game over |

- CI (`deploy.yml`) runs `npm ci && npm run lint && npm test && npm run validate:maze && npm run build` before deploying.
- Manual QA checklist per milestone lives in `README.md`.

## 19. Build, PWA and Deployment

- `vite.config.ts`: `base: '/<repo-name>/'` for GitHub Pages; `build.target: 'es2020'`; Phaser split into its own chunk (`manualChunks`).
- `vite-plugin-pwa`: `registerType: 'autoUpdate'`, precache all assets, manifest with `display: 'fullscreen'` (or `standalone`), `orientation: 'any'`, `background_color`/`theme_color: '#000000'`, 192 and 512 icons (+ maskable).
- GitHub Actions: build → `actions/upload-pages-artifact` → `actions/deploy-pages`.
- Optional: zip `dist/` and upload to itch.io as an HTML5 game.

## 20. Performance Guidelines

- Reuse objects (`Vec2`, arrays) in `step`; avoid `.map/.filter` chains in per-frame hot paths (ghost direction decision runs only at tile centers, so it is fine).
- Use a texture atlas (one draw call for sprites). Keep the maze as one image.
- Cap `deltaMs` to avoid catch-up spirals; `visibilitychange` → pause.
- Keep total audio under ~2 MB (short ogg files).

## 21. Rules for the AI IDE (paste into your IDE's rules / system prompt)

1. Follow `PRD.md` and `Architecture.md` exactly. If something is ambiguous, ask before inventing.
2. Never import Phaser or touch the DOM inside `src/core`.
3. Never hard-code speeds, timers, points or maze data in logic; read them from `src/data`.
4. Use strict TypeScript, no `any`; use the typed event bus for cross-module communication.
5. Implement only the current milestone; leave the game runnable after each one; add/extend tests for every rule implemented.
6. Do not copy code or assets from other games/sites. Use only assets listed in `ASSETS_LICENSES.md`; add every new asset there.
7. Keep functions short; comment the *why* for rules taken from the arcade spec (e.g., "Pinky targets 4 tiles ahead").
8. Before finishing each milestone: run `npm run lint`, `npm test`, `npm run validate:maze`, `npm run build` and fix everything.

## 22. Beginner Setup Cheat-Sheet

```bash
# 1. Install Node.js LTS (nodejs.org) and Git
npm create vite@latest packmen -- --template vanilla-ts
cd packmen
npm i phaser
npm i -D vitest eslint prettier vite-plugin-pwa typescript
npm run dev            # open the printed localhost URL
```

Then hand `PRD.md` + `Architecture.md` to your IDE and tell it: *"Read both files fully. Implement Milestone M0 only, then stop and show me how to run and test it."* Repeat for M1, M2, and so on.
